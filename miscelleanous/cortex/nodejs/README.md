NodeJS starter project
======================

This directory contains examples for using NodeJS and Cortex together. You can run the commands individually, or include them as libraries in another program.

This code makes extensive use of Promises for flow control; if you haven't used them much it might be worth skimming this: https://davidwalsh.name/promises. The code in theory should work fine with async/await, but I wanted to keep the Node version requirement modest. (6+)

We only have one dependency, which is the ws websocket library. To install that dependency just run `npm install`.

Please refer to table below for each example:

| Script | Purpose |
|---|---|
| raw.js | Streaming eeg data |
| numbers.js | Streaming band power, performance metric and motion data |
| events.js | Streaming facial expression and mental command |
