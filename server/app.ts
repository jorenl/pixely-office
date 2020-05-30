require("tsconfig-paths/register");
import express = require("express");
import expressWs = require("express-ws");
import path from "path";
import url = require("url");
import WebSocket from "ws";
import { ExpressPeerServer } from "peer";

import { Message } from "shared/websocket/messages";

import { newStore } from "./store";
import { RemovePlayerAction } from "shared/store/actions";

const PORT = process.env.PORT || 3000;

// for now, let's just use a single store on startup...
const store = newStore();

const app = express();

const httpServer = app.listen(PORT, () => {
  console.log(`Pixely office app listening at http://localhost:${PORT}`);
});

const PEER_WSS_PATH = "/peer/app/peerjs";
const GAME_WSS_PATH = "/ws";
const peerWss = new WebSocket.Server({
  path: PEER_WSS_PATH,
  noServer: true,
});
const gameWss = new WebSocket.Server({ path: GAME_WSS_PATH, noServer: true });

// Handle muxing the peerjs and game events web socket servers
httpServer.on("upgrade", (request, socket, head) => {
  const pathname = url.parse(request.url).pathname;

  if (pathname === PEER_WSS_PATH) {
    peerWss.handleUpgrade(request, socket, head, (ws) => {
      peerWss.emit("connection", ws, request);
    });
  } else if (pathname === GAME_WSS_PATH) {
    gameWss.handleUpgrade(request, socket, head, (ws) => {
      gameWss.emit("connection", ws, request);
    });
  } else {
    console.error("Destroying socket");
    socket.destroy();
  }
});

const peerServer = ExpressPeerServer(httpServer, {
  path: "/app",
  wss: peerWss,
});
app.use("/peer", peerServer);

app.use("/assets/", express.static(path.join(__dirname, "../public")));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.htm"));
});

gameWss.on("connection", (ws) => {
  let playerUid: string;

  function send(message: Message) {
    ws.send(JSON.stringify(message));
  }

  function broadcast(message: Message) {
    gameWss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }

  ws.on("message", (message) => {
    const data: Message = JSON.parse(message.toString());
    console.log("Message received:", data);

    if (data.type === "REDUX_ACTION") {
      // skim the player uid off the ADD_PLAYER action,
      // also only allow the action to be sent once
      if (data.action.type === "ADD_PLAYER") {
        if (playerUid) {
          return;
        }
        playerUid = data.action.uid;
      }
      store.dispatch(data.action);
      broadcast(data);
    }

    if (data.type === "REQUEST_GAME_STATE") {
      send({
        type: "REDUX_ACTION",
        action: {
          type: "UPDATE_GAME_STATE",
          players: store.getState().players,
        },
      });
    }
  });

  ws.on("close", () => {
    const action: RemovePlayerAction = {
      type: "REMOVE_PLAYER",
      uid: playerUid,
    };
    store.dispatch(action);
    broadcast({ type: "REDUX_ACTION", action });
  });
});
