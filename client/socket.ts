import { Message } from "shared/websocket/messages";

export type OnMessageHandler = (message: Message) => void;
export type OnOpenHandler = () => void;

export class WsConnection {
  private ws: WebSocket;
  private ready: boolean;
  private onMessageHandlers: OnMessageHandler[] = [];
  private onOpenHandlers: OnOpenHandler[] = [];

  constructor() {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    this.ws = new WebSocket(`${protocol}//${window.location.host}/ws`);
    this.ws.onopen = this.handleOpen;
    this.ws.onmessage = this.handleMessage;
  }

  private handleOpen = (event: Event) => {
    this.ready = true;
    this.onOpenHandlers.map((h) => h());
  };

  private handleMessage = (event: MessageEvent) => {
    const message: Message = JSON.parse(event.data);
    console.log("Received message: ", message);
    this.onMessageHandlers.map((h) => h(message));
  };

  public onOpen(handler: OnOpenHandler) {
    this.onOpenHandlers.push(handler);
  }

  public removeOnOpen(handler: OnOpenHandler) {
    this.onOpenHandlers = this.onOpenHandlers.filter((h) => h !== handler);
  }

  public onMessage(handler: OnMessageHandler) {
    this.onMessageHandlers.push(handler);
  }

  public removeOnMessage(handler: OnMessageHandler) {
    this.onMessageHandlers = this.onMessageHandlers.filter(
      (h) => h !== handler
    );
  }

  public send(message: Message) {
    if (!this.ready) {
      console.error("Websocket not ready, can't send");
    }
    const data = JSON.stringify(message);
    this.ws.send(data);
  }

  public close() {
    this.ready = false;
    this.ws.close();
  }
}

// hacky module state
let _wsc: WsConnection;

export function getWsConnection(): WsConnection {
  if (!_wsc) {
    _wsc = new WsConnection();
  }
  return _wsc;
}
