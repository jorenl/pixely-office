import { useRef, useEffect } from "react";

import { Message } from "shared/websocket/messages";

class WsConnection {
  private ws: WebSocket;

  constructor() {
    this.ws = new WebSocket(`ws://${window.location.host}/ws`);
    this.bindHandlers();
  }

  private send(message: Message) {
    const data = JSON.stringify(message);
    this.ws.send(data);
  }

  private bindHandlers() {
    this.ws.onopen = (event) => {
      this.send({
        type: "USER_JOINED",
        uid: "123456789",
        username: "Joren",
        sender: "test",
      });
    };
    this.ws.onmessage = (event) => {
      const message: Message = JSON.parse(event.data);
      console.log("Received message: ", message);
    };
  }

  public sayHi() {
    this.send({
      type: "CHAT",
      sender: "test",
      text: "Hi!",
    });
  }

  public close() {
    this.ws.close();
  }
}

export function useWsConnection() {
  const wsRef = useRef<WsConnection | null>(null);
  useEffect(() => {
    wsRef.current = new WsConnection();
    const cleanup = () => {
      wsRef.current.close();
    };
    return cleanup;
  }, []);
  return wsRef;
}
