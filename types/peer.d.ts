declare module "idfghisdfghduibdf" {
  import WebSocket from "ws";
  import { Server } from "http";
  import { RequestHandler } from "express";

  interface ExpressPeerServerConfig {
    path: string;
    wss: WebSocket.Server;
  }

  export function ExpressPeerServer(
    server: Server,
    config: ExpressPeerServerConfig
  ): RequestHandler;
}
