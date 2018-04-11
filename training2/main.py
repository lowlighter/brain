from pandas import read_csv
from pandas import DataFrame
from pandas import concat
import pandas as pd
from sklearn.metrics import mean_squared_error
from math import sqrt
from matplotlib import pyplot
from keras.models import Sequential
from keras.layers import Dense
from keras.layers import LSTM
from timer import *
import websocket
import json
import numpy as np
import operator
import sys
import threading
from time import sleep

actions = ["neutre", "gauche", "droite"]
rdataset = DataFrame()
index = 0
timer = None
model = None
train = False

def prepare(datasets, dataframe):
    '''
    Prépare les datasets
    '''
    # Transform metadata
    def transform(d):
        for action in actions:
            dico = {}
            for a in actions:
                dico[a] = 0
            dico[action] = 1
            d[action] = d.metadata.map(dico)
        return d

    # Separate inputs from outputs
    def separateIO(d):
        do = d.loc[:, actions]
        di = d.drop(actions, axis=1)
        return di, do

    # Separate training from testing
    def separateTT(d):
        train = d.sample(frac=0.8)
        test = d.sample(frac=0.2)
        return train, test

    # Create dataset
    if dataframe == True:
        print("Using recorded datasets")
        dataset = datasets
    else:
        print("Using csv datasets")
        dataset = DataFrame()
        for name in datasets:
            dataset = dataset.append(read_csv("{name}.csv".format(name=name), header=0))

    # Prepare dataset
    dataset = transform(dataset)
    dataset = dataset.drop(["n", "time", "metadata"], axis=1)
    train, test = separateTT(dataset)
    LX, LY = separateIO(train)
    TX, TY = separateIO(test)
    return LX, LY, TX, TY


def training(datasets, dataframe):
    '''
    Entraine le modèle
    '''
    # Prepare dataset
    LX, LY, TX, TY = prepare(datasets, dataframe)

    # Prepare model
    model = Sequential()
    model.add(Dense(50, activation="relu", input_dim=25))
    model.add(Dense(15, activation="relu"))
    model.add(Dense(32, activation='relu'))
    model.add(Dense(32, activation='relu'))
    model.add(Dense(32, activation='relu'))
    model.add(Dense(32, activation='relu'))
    model.add(Dense( 3, activation="softmax"))

    # Compile model
    model.compile(loss='categorical_crossentropy', optimizer='adam', metrics=['acc'])
    model.fit(LX, LY, epochs=150, batch_size=10, validation_data=(TX, TY)) #verbose=0
    model.predict(TX)
    return model


def evaluate(model, datasets, dataframe):
    '''
    Evalue le modèle
    '''
    # Prepare dataset
    LX, LY, TX, TY = prepare(datasets, dataframe)
    return model.evaluate(TX, TY)

def predict(model, data):
    return model.predict(data)


def record(data, metadata = ""):
    '''
    Enregistre les données
    '''
    global rdataset
    append = pd.Series(data)
    append["metadata"] = metadata
    append["time"] = 0
    append["n"] = 0
    rdataset = rdataset.append(append, ignore_index=True)


def save(model, name):
    '''
    Enregistre le modèle au format json
    '''
    json = model.to_json()
    with open("./models/{name}.json".format(name=name), "w") as file:
        file.write(json)
    model.save_weights("model.h5")
    print("Saved model to disk")

def load(name):
    '''
    Charge un modèle stocké au format json
    '''
    file = open("./models/{name}.json".format(name=name), 'r')
    json = file.read()
    file.close()
    model = model_from_json(json)
    model.load_weights("model.h5")
    return model

def on_message(ws, message):
    '''
    Enregistre les données reçues par la websocket
    '''
    global rdataset
    global actions
    global index
    global timer
    global train
    data = json.loads(message)
    type = data[0]
    data = data[2:]
    if ((type == "pow") and (train)):
        if (index < len(actions)):
            record(data, actions[index])
            print("Recording {action}                \r".format(action=actions[index]), end="", flush=True)
            ws.send(json.dumps({"action":"python_message", "data":["training", actions[index]]}))
        elif (model):
            observed = np.array([data,]).astype(np.float)
            predicted = np.around(predict(model, observed))[0]
            i, m = max(enumerate(predicted), key=operator.itemgetter(1))
            print(actions[i])
            ws.send(json.dumps({"action":"python_message", "data":["prediction", actions[i]]}))
        elif not model:
            ws.send(json.dumps({"action":"python_message", "data":["modeling", "neutre"]}))
    if (type == "inf"):
        type = data[0]
        action = data[1]
        data = data[2:]
        if (type == "cmd"):
            if (action == "start"):
                actions = data
                timer = InfiniteTimer(1, update)
                timer.start()
                train = True
            if (action == "stop"):
                rdataset = DataFrame()
                index = 0
                timer = None
                train = False


def on_error(ws, error):
    pass


def on_close(ws):
    print("Connection closed")


def on_open(ws):
    print("Connection open")


def update():
    global index
    global timer
    global actions
    global rdataset
    global model
    if (index < len(actions)):
        index += 1
    else:
        timer.cancel()
        model = training(rdataset, True)

if __name__ == "__main__":
    print("Starting python application")
    websocket.enableTrace(False)
    ws = websocket.WebSocketApp("ws://localhost:3001", on_message = on_message, on_error = on_error, on_close = on_close)
    ws.on_open = on_open
    wst = threading.Thread(target=ws.run_forever)
    wst.daemon = True
    wst.start()

    conn_timeout = 5
    while not ws.sock.connected and conn_timeout:
        sleep(1)
        conn_timeout -= 1

    while ws.sock.connected:
        sleep(1)
