declare module "peerjs-server" {
  import { Server } from "http";
  import { RequestHandler } from "express";

  interface ExpressPeerServerConfig {
    debug: boolean;
    path: string;
  }

  export function ExpressPeerServer(
    server: Server,
    config: ExpressPeerServerConfig
  ): RequestHandler;
}
