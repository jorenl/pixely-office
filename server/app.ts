require("tsconfig-paths/register");
import express = require("express");
import expressWs = require("express-ws");
import path from "path";

import { sharedData } from "shared";
import { Message } from "shared/websocket/messages";

const PORT = 3000;

const app = express();
const ews = expressWs(app);

app.use("/assets/", express.static(path.join(__dirname, "../public")));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.htm"));
});

app.get("/test", (req, res) => {
  res.send(JSON.stringify(sharedData, null, 2));
});

ews.app.ws("/ws", (ws, req) => {
  const server = ews.getWss();

  function send(message: Message) {
    ws.send(JSON.stringify(message));
  }

  ws.on("message", (message) => {
    const data: Message = JSON.parse(message.toString());
    console.log("Message received:", data);

    if (data.type === "CHAT") {
      server.clients.forEach((client) => {});
      send({
        type: "CHAT",
        sender: "server",
        text: `You said: ${data.text}`,
      });
    }
  });
});

app.listen(PORT, () => {
  console.log(`Example app listening at http://localhost:${PORT}`);
});
