/***************
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>
***************/
#include "CortexClient.h"

#include <QUrl>
#include <QJsonObject>
#include <QJsonDocument>
#include <QJsonParseError>
#include <QJsonArray>
#include <QtDebug>


// utility function
QStringList arrayToStringList(const QJsonArray &array) {
    QStringList list;
    for (const QJsonValue &val : array) {
        list.append(val.toString());
    }
    return list;
}

CortexClient::CortexClient(QObject *parent) : QObject(parent) {
    nextRequestId = 1;

    // forward the connected/disconnected signals
    connect(&socket, &QWebSocket::connected, this, &CortexClient::connected);
    connect(&socket, &QWebSocket::disconnected, this, &CortexClient::disconnected);

    // handle errors
    connect(&socket, static_cast<void(QWebSocket::*)(QAbstractSocket::SocketError)>(&QWebSocket::error),
            this, &CortexClient::onError);
    connect(&socket, &QWebSocket::sslErrors, this, &CortexClient::onSslErrors);

    // handle incomming text messages
    connect(&socket, &QWebSocket::textMessageReceived, this, &CortexClient::onMessageReceived);
}

void CortexClient::onError(QAbstractSocket::SocketError error) {
    qCritical() << "Socket error:" << error;
}

void CortexClient::onSslErrors(const QList<QSslError> &errors) {
    for (const QSslError &error : errors) {
        qCritical() << "SSL error:" << error.errorString();
    }
}

void CortexClient::open() {
    socket.open(QUrl("wss://emotivcortex.com:54321"));
}

void CortexClient::close() {
    socket.close();
    nextRequestId = 1;
    methodForRequestId.clear();
}

void CortexClient::queryHeadsets() {
    sendRequest("queryHeadsets");
}

void CortexClient::getUserLogin() {
    sendRequest("getUserLogin");
}

void CortexClient::login(QString username, QString password,
                         QString clientId, QString clientSecret) {
    QJsonObject params;
    params["username"] = username;
    params["password"] = password;
    params["client_id"] = clientId;
    params["client_secret"] = clientSecret;
    sendRequest("login", params);
}

void CortexClient::logout(QString username) {
    QJsonObject params;
    params["username"] = username;
    sendRequest("logout", params);
}

void CortexClient::authorize() {
    QJsonObject params;
    params["debit"] = 0;
    sendRequest("authorize", params);
}

void CortexClient::authorize(QString clientId, QString clientSecret, QString license) {
    QJsonObject params;
    params["client_id"] = clientId;
    params["client_secret"] = clientSecret;
    params["license"] = license;
    params["debit"] = 1;
    sendRequest("authorize", params);
}

void CortexClient::createSession(QString token,
                                 QString headsetId, bool activate) {
    QJsonObject params;
    params["_auth"] = token;
    params["headset"] = headsetId;
    params["status"] = activate ? "active" : "open";
    sendRequest("createSession", params);
}

void CortexClient::closeSession(QString token, QString sessionId) {
    QJsonObject params;
    params["_auth"] = token;
    params["session"] = sessionId;
    params["status"] = "close";
    sendRequest("updateSession", params);
}

void CortexClient::subscribe(QString token, QString sessionId, QString stream) {
    QJsonObject params;
    QJsonArray streamArray;

    streamArray.append(stream);
    params["_auth"] = token;
    params["session"] = sessionId;
    params["streams"] = streamArray;

    sendRequest("subscribe", params);
}

void CortexClient::unsubscribe(QString token, QString sessionId, QString stream) {
    QJsonObject params;
    QJsonArray streamArray;

    streamArray.append(stream);
    params["_auth"] = token;
    params["session"] = sessionId;
    params["streams"] = streamArray;

    sendRequest("unsubscribe", params);
}

void CortexClient::getDetectionInfo(QString detection) {
    QJsonObject params;
    params["detection"] = detection;
    sendRequest("getDetectionInfo", params);
}

void CortexClient::training(QString token, QString sessionId, QString detection,
                            QString action, QString control) {
    QJsonObject params;
    params["_auth"] = token;
    params["session"] = sessionId;
    params["detection"] = detection;
    params["action"] = action;
    params["status"] = control;
    sendRequest("training", params);
}

void CortexClient::injectMarker(QString token, QString sessionId,
                                QString label, int value, qint64 time) {
    QJsonObject params;
    params["_auth"] = token;
    params["session"] = sessionId;
    params["label"] = label;
    params["value"] = value;
    params["port"] = "Cortex Example";
    params["time"] = time;
    sendRequest("injectMarker", params);
}

void CortexClient::injectStopMarker(QString token, QString sessionId,
                      QString label, int value, qint64 time) {
    QJsonObject params;
    params["_auth"] = token;
    params["session"] = sessionId;
    params["label"] = label;
    // please note that we use the field "stop" instead of "value"
    params["stop"] = value;
    params["port"] = "Cortex Example";
    params["time"] = time;
    sendRequest("injectMarker", params);
}

void CortexClient::sendRequest(QString method, QJsonObject params) {
    QJsonObject request;

    // build the request
    request["jsonrpc"] = "2.0";
    request["id"] = nextRequestId;
    request["method"] = method;
    request["params"] = params;

    // send the json message
    QString message = QJsonDocument(request).toJson(QJsonDocument::Compact);
    //qDebug() << " * send    " << message;
    socket.sendTextMessage(message);

    // remember the method used for this request
    methodForRequestId.insert(nextRequestId, method);
    nextRequestId++;
}

void CortexClient::onMessageReceived(QString message) {
    //qDebug() << " * received" << message;

    // parse the json message
    QJsonParseError err;
    QJsonDocument doc = QJsonDocument::fromJson(message.toUtf8(), &err);
    if (err.error != QJsonParseError::NoError) {
        qCritical() << "error, failed to parse the json message: " << message;
        return;
    }

    QJsonObject response = doc.object();
    int id = response.value("id").toInt(-1);
    QString sid = response.value("sid").toString();

    if (id != -1) {
        // this is a RPC response, we get the method from the id
        // we must know the method in order to understand the result
        QString method = methodForRequestId.value(id);
        QJsonValue result = response.value("result");
        QJsonValue error = response.value("error");

        methodForRequestId.remove(id);

        if (error.isObject()) {
            emitError(method, error.toObject());
        } else {
            handleResponse(method, result);
        }
    }
    else if (! sid.isEmpty()) {
        // this message has a sid (subscription id)
        // so this is some data from a data stream
        double time = response.value("time").toDouble();
        QJsonArray data;
        QString stream;

        // find the data field inside the response
        for (auto it = response.begin(); it != response.end(); ++it) {
            QString key = it.key();
            QJsonValue value = it.value();

            if (key != "sid" && key != "time" && value.isArray()) {
                stream = key;
                data = value.toArray();
            }
        }
        emit streamDataReceived(sid, stream, time, data);
    }
}

void CortexClient::handleResponse(QString method, const QJsonValue &result) {
    if (method == "queryHeadsets") {
        QList<Headset> headsets;

        for (const QJsonValue &val : result.toArray()) {
            QJsonObject jheadset = val.toObject();
            Headset hs(jheadset);
            headsets.append(hs);
        }
        emit queryHeadsetsOk(headsets);
    }
    else if (method == "getUserLogin") {
        QStringList usernames;
        QJsonArray array = result.toArray();
        for (const QJsonValue &val : array) {
            usernames.append(val.toString());
        }
        emit getUserLoginOk(usernames);
    }
    else if (method == "login") {
        emit loginOk();
    }
    else if (method == "logout") {
        emit logoutOk();
    }
    else if (method == "authorize") {
        QString token = result.toObject().value("_auth").toString();
        emit authorizeOk(token);
    }
    else if (method == "createSession") {
        QString sessionId = result.toObject().value("id").toString();
        emit createSessionOk(sessionId);
    }
    else if (method == "updateSession") {
        QString sessionId = result.toObject().value("id").toString();
        emit closeSessionOk();
    }
    else if (method == "subscribe") {
        QJsonObject sub = result.toArray().first().toObject();
        QString sid = sub.value("sid").toString();

        if (sid.isEmpty()) {
            // it is actually an error!
            emitError(method, sub);
        } else {
            emit subscribeOk(sid);
        }
    }
    else if (method == "unsubscribe") {
        QJsonObject unsub = result.toArray().first().toObject();
        QString msg = unsub.value("message").toString();
        emit unsubscribeOk(msg);
    }
    else if (method == "getDetectionInfo") {
        handleGetDetectionInfo(result);
    }
    else if (method == "training") {
        emit trainingOk(result.toString());
    }
    else if (method == "injectMarker") {
        emit injectMarkerOk();
    }
    else {
        // unknown method, so we don't know how to interpret the result
        qCritical() << "unkown RPC method:" << method << result;
    }
}

void CortexClient::handleGetDetectionInfo(const QJsonValue &result) {
    QJsonArray jactions = result.toObject().value("actions").toArray();
    QJsonArray jcontrols = result.toObject().value("controls").toArray();
    QJsonArray jevents = result.toObject().value("events").toArray();

    emit getDetectionInfoOk(arrayToStringList(jactions),
                            arrayToStringList(jcontrols),
                            arrayToStringList(jevents));
}

void CortexClient::emitError(QString method, const QJsonObject &obj) {
    int code = obj.value("code").toInt();
    QString error = obj.value("message").toString();
    emit errorReceived(method, code, error);
}
