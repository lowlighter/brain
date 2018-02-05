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
#include "DataStreamExample.h"

#include <QCoreApplication>
#include <QJsonArray>
#include <QJsonDocument>
#include <QtDebug>


DataStreamExample::DataStreamExample(QObject *parent) : QObject(parent) {
    connect(&client, &CortexClient::connected, this, &DataStreamExample::onConnected);
    connect(&client, &CortexClient::disconnected, this, &DataStreamExample::onDisconnected);
    connect(&client, &CortexClient::errorReceived, this, &DataStreamExample::onErrorReceived);
    connect(&client, &CortexClient::subscribeOk, this, &DataStreamExample::onSubscribeOk);
    connect(&client, &CortexClient::unsubscribeOk, this, &DataStreamExample::onUnsubscribeOk);
    connect(&client, &CortexClient::streamDataReceived, this, &DataStreamExample::onStreamDataReceived);
    connect(&client, &CortexClient::closeSessionOk, this, &DataStreamExample::onCloseSessionOk);
    connect(&finder, &HeadsetFinder::headsetsFound, this, &DataStreamExample::onHeadsetsFound);
    connect(&creator, &SessionCreator::sessionCreated, this, &DataStreamExample::onSessionCreated);
}

void DataStreamExample::start(QString stream, QString license) {
    this->stream = stream;
    this->license = license;
    nextDataTime = 0;
    timerId = 0;
    client.open();
}

void DataStreamExample::onConnected() {
    qInfo() << "Connected to Cortex.";
    finder.findHeadsets(&client);
}

void DataStreamExample::onDisconnected() {
    qInfo() << "Disconnected.";
    QCoreApplication::quit();
}

void DataStreamExample::onErrorReceived(QString method, int code, QString error) {
    qCritical() << "Cortex returned an error:";
    qCritical() << "\t" << method << code << error;
    QCoreApplication::quit();
}

void DataStreamExample::onHeadsetsFound(const QList<Headset> &headsets) {
    finder.clear();

    // we take the first headset
    // TODO in a real application, you should ask the user to choose a headset from the list
    this->headsetId = headsets.first().id;

    // next step: create a session for this headset
    creator.createSession(&client, headsetId, license);
}

void DataStreamExample::onSessionCreated(QString token, QString sessionId) {
    creator.clear();
    this->token = token;
    this->sessionId = sessionId;

    // next step: subscribe to a data stream
    client.subscribe(token, sessionId, stream);
}

void DataStreamExample::onSubscribeOk(QString sid) {
    qInfo() << "Subscription successful, sid" << sid;
    qInfo() << "Receiving data for 30 seconds.";
    timerId = startTimer(30*1000);
}

void DataStreamExample::onStreamDataReceived(
        QString sessionId, QString stream, double time, const QJsonArray &data) {
    Q_UNUSED(sessionId);
    // a data stream can publish a lot of data
    // we display only a few data per second
    if (time >= nextDataTime) {
        qInfo() << stream << data;
        nextDataTime = time + 0.25;
    }
}

void DataStreamExample::timerEvent(QTimerEvent *event) {
    if (event->timerId() == timerId) {
        killTimer(timerId);
        client.unsubscribe(token, sessionId, stream);
    }
}

void DataStreamExample::onUnsubscribeOk(QString msg) {
    qInfo() << "Subscription cancelled:" << msg;
    client.closeSession(token, sessionId);
}

void DataStreamExample::onCloseSessionOk() {
    qInfo() << "Session closed.";
    client.close();
}
