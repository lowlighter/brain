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

actions = ["neutre", "gauche", "droite"]
rdataset = DataFrame()
index = 0
timer = None
model = None

def prepare(datasets, dataframe):
    '''
    Prépare les datasets
    '''
    # Transform metadata
    def transform(d):
        d['left'] = d.metadata.map({"gauche":1, "neutre":0, "droite":0})
        d['right'] = d.metadata.map({"gauche":0, "neutre":0, "droite":1})
        d['neutral'] = d.metadata.map({"gauche":0, "neutre":1, "droite":0})
        return d

    # Separate inputs from outputs
    def separateIO(d):
        do = d.loc[:, ["left", "right", "neutral"]]
        di = d.drop(["left", "right", "neutral"], axis=1)
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
    model.add(Dense(32, activation='relu'))
    model.add(Dense( 3, activation="softmax"))

    # Compile model
    model.compile(loss='categorical_crossentropy', optimizer='adam', metrics=['acc'])
    model.fit(LX, LY, epochs=100, batch_size=10, validation_data=(TX, TY))
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


def on_message(ws, message):
    '''
    Enregistre les données reçues par la websocket
    '''
    global actions
    global index
    data = json.loads(message)
    type = data[0]
    data = data[2:]
    if (type == "pow"):
        if (index < len(actions)):
            record(data, actions[index])
            print("Recording {action}                \r".format(action=actions[index]), end="", flush=True)
        elif (model):
            observed = np.array([data,]).astype(np.float)
            predicted = np.around(predict(model, observed))[0]
            i, m = max(enumerate(predicted), key=operator.itemgetter(1))
            print(actions[i])

def on_error(ws, error):
    print(error)


def on_close(ws):
    print("Connection closed")


def on_open(ws):
    print("Connection open")
    global timer
    timer.start()


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

timer = InfiniteTimer(20, update)

if __name__ == "__main__":
    print("Python training started")
    ws = websocket.WebSocketApp("ws://localhost:3001", on_message = on_message, on_error = on_error, on_close = on_close)
    ws.on_open = on_open
    print("test")
    #ws.run_forever()
