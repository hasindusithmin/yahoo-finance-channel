const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const protobuf = require("protobufjs");

const app = express();
//initialize a simple http server
const server = http.createServer(app);

//initialize the WebSocket server instance
const wss = new WebSocket.Server({ server });

const root = protobuf.loadSync("./YPricingData.proto");

const Yaticker = root.lookupType("yaticker");

app.get("/", (req, res) => {
  res.send("nothing");
});

wss.on("connection", ($ws) => {
  const ws = new WebSocket("wss://streamer.finance.yahoo.com");
  ws.onopen = function open() {
    ws.send(
      JSON.stringify({
        subscribe: ["EURUSD=X"],
      })
    );
  };
  ws.onmessage = function incoming(data) {
    const { id, price, time, changePercent, change } = Yaticker.decode(
      Buffer.from(data.data, "base64")
    ).toJSON();
    $ws.send(JSON.stringify({ id, price, time, changePercent, change }));
  };
});

//start our server
server.listen(3000, () => {
  console.log(`Server started`);
});
