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
#include "SessionCreator.h"

/*
 * To get a client id and a client secret, you must connect to your Emotiv
 * account on emotiv.com and create a Cortex app.
 */
const QString clientId = "the client id of your Cortex app";
const QString clientSecret = "the client secret of your Cortex app";

/*
 * As a developer, you can use your personal EmotivID to run the examples.
 * But in a real application, you should ask your users to login
 * with their own EmotivID.
 */
const QString username = "a EmotivID";
const QString password = "a password";


SessionCreator::SessionCreator(QObject *parent) : QObject(parent) {
    client = nullptr;
}

void SessionCreator::clear() {
    if (client) {
        disconnect(client, 0, this, 0);
        client = nullptr;
    }
}

void SessionCreator::createSession(CortexClient* client,
                                   QString headsetId,
                                   QString license) {
    this->client = client;
    this->headsetId = headsetId;
    this->license = license;

    connect(client, &CortexClient::getUserLoginOk, this, &SessionCreator::onGetUserLoginOk);
    connect(client, &CortexClient::logoutOk, this, &SessionCreator::onLogoutOk);
    connect(client, &CortexClient::loginOk, this, &SessionCreator::onLoginOk);
    connect(client, &CortexClient::authorizeOk, this, &SessionCreator::onAuthorizeOk);
    connect(client, &CortexClient::createSessionOk, this, &SessionCreator::onCreateSessionOk);

    // first step: get the current user
    // Note: if you already have a token, you can reuse it
    // so you can skip the login procedure and call onAuthorizeOk("your token")
    client->getUserLogin();
}

void SessionCreator::onGetUserLoginOk(const QStringList &usernames) {
    if (usernames.contains(username)) {
        // we are already logged in
        // we can skip the logout/login steps
        onLoginOk();
    }
    else if (usernames.isEmpty()) {
        // no one is logged in, so no need for a logout
        onLogoutOk();
    }
    else {
        // logout the current user before we can login
        client->logout(usernames.first());
    }
}

void SessionCreator::onLogoutOk() {
    // now, we can login
    client->login(username, password, clientId, clientSecret);
}

void SessionCreator::onLoginOk() {
    if (license.isEmpty()) {
        client->authorize();
    }
    else {
        client->authorize(clientId, clientSecret, license);
    }
}

void SessionCreator::onAuthorizeOk(QString token) {
    this->token = token;
    qInfo() << "Authorize successful, token" << token;

    // next step: open a session for the headset
    bool activate = ! license.isEmpty();
    client->createSession(token, headsetId, activate);
}

void SessionCreator::onCreateSessionOk(QString sessionId) {
    qInfo() << "Session created, session id " << sessionId;
    emit sessionCreated(token, sessionId);
}
