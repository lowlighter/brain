import websocket
from keras.models import Sequential
from keras.layers import Dense
from keras.models import load_model
from keras import *
import numpy as np
from keras.models import model_from_json
import json

import pandas as pd
from pandas import DataFrame
from pandas import Series
from pandas import concat
from pandas import read_csv
from pandas import datetime
from threading import Timer
import time
from sklearn.utils import shuffle


import threading

class InfiniteTimer():
    """A Timer class that does not stop, unless you want it to."""

    def __init__(self, seconds, target):
        self._should_continue = False
        self.is_running = False
        self.seconds = seconds
        self.target = target
        self.thread = None

    def _handle_target(self):
        self.is_running = True
        self.target()
        self.is_running = False
        self._start_timer()

    def _start_timer(self):
        if self._should_continue: # Code could have been running when cancel was called.
            self.thread = Timer(self.seconds, self._handle_target)
            self.thread.start()

    def start(self):
        if not self._should_continue and not self.is_running:
            self._should_continue = True
            self._start_timer()
        else:
            print("Timer already started or running, please wait if you're restarting.")

    def cancel(self):
        if self.thread is not None:
            self._should_continue = False # Just in case thread is running and cancel fails.
            self.thread.cancel()
        else:
            print("Timer never started or failed to initialize.")


actions = ["neutre", "droite", "gauche"]
actionIndex = 0
isTraining = 1;

dataset = pd.DataFrame()
model = Sequential()


def changeAction():
	global t
	global actionIndex
	global actions
	global isTraining
	if(actionIndex < len(actions)):
		print("Training for: " + actions[actionIndex])
		actionIndex+=1
	else:
		t.cancel()
		isTraining = 2
		launch_training()

t = InfiniteTimer(5, changeAction)




def transformString(df):
    df['left'] = df.metadata.map({"gauche":1, "neutre":0, "droite": 0})
    df['right'] = df.metadata.map({"droite":1, "neutre":0, "gauche": 0})
    df['neutral'] = df.metadata.map({"droite":0, "neutre":1, "gauche": 0})
    return df

def removeUselessDatas(df):
    return df


def separateOutputInput(df):
    #dfOuput = df["left", "right", "neutral"]
    dfOutput = df.loc[:, ["left", "right", "neutral"]]
    dfInput = df.drop(["left", "right", "neutral"], axis=1)
    return dfInput, dfOutput

def separateDataTestAndTrain(df):
    dfTrain = df.sample(frac=0.8)
    dfTest = df.drop(dfTrain.index)
    return dfTrain, dfTest


def on_message(ws, message):
	global dataset
	global columns
	messageDecoded = json.loads(message)

	dataType = messageDecoded[0]
	if(dataType == "pow"):
		if(isTraining==1):
			toAppend = pd.Series(messageDecoded[2:])
			dataset = dataset.append(toAppend, ignore_index=True)
			dataset["metadata"] = actions[actionIndex-1]
			print(dataset)
		if(isTraining==0):
			pass
def launch_training():
	global isTraining
	global dataset
	global model
	print(dataset)
	print("launch_training")
	dataset = transformString(dataset)
	dataset = dataset.drop(["metadata"], axis=1)
	dataset = shuffle(dataset)
	dataset = removeUselessDatas(dataset)

	datasetTrain, datasetTest = separateDataTestAndTrain(dataset)
	datasetX, datasetY = separateOutputInput(datasetTrain)
	datasetX_test, datasetY_test = separateOutputInput(datasetTest)
	datasetX = datasetX.as_matrix()
	datasetY = datasetY.as_matrix()
	datasetX_test = datasetX_test.as_matrix()
	datasetY_test = datasetY_test.as_matrix()
	
	model.add(Dense(50	, activation="relu", input_dim=25))
	model.add(Dense(15	, activation="relu"))
	model.add(Dense(32, activation='relu'))
	model.add(Dense(32, activation='relu'))
	model.add(Dense(3	, activation="softmax"))
	model.summary()
	model.compile(loss='categorical_crossentropy', optimizer='adam', metrics=['acc'])
	model.fit(datasetX, datasetY, epochs=150, batch_size=10, validation_data=(datasetX_test, datasetY_test))
	print(model.predict(datasetX_test))
	print(model.evaluate(datasetX_test, datasetY_test))
	isTraining = 0

def on_error(ws, error):
	print(error)

def on_close(ws):
	print("### closed ###")

def on_open(ws):
	global t
	print("### Connection open ###")
	changeAction()
	t.start()

if __name__ == "__main__":
	ws = websocket.WebSocketApp("ws://localhost:3001", on_message = on_message, on_error = on_error, on_close = on_close)
	ws.on_open = on_open
	ws.run_forever()


