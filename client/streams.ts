import Peer, { MediaConnection } from "peerjs";
import { useEffect } from "react";

import store, { observeStore, getState } from "client/game/store";

export function useStreamManager(enabled: boolean) {
  useEffect(() => {
    if (!enabled) {
      return;
    }
    const localUid = getState().activePlayer;
    const sm = new StreamManager(localUid);
    sm.init();
    const unsub = observeStore(
      store,
      (s) => s.players.map((p) => p.uid).filter((uid) => uid !== localUid),
      (remoteUids) => sm.shouldHaveCallsWith(remoteUids)
    );

    const cleanup = () => {
      unsub();
      sm.close();
    };
    return cleanup;
  }, [enabled]);
}

export class StreamManager {
  private localUid: string;
  private localStream: MediaStream;
  private peer: Peer;

  private streams: { [remoteUid: string]: Stream } = {};

  constructor(localUid: string) {
    this.localUid = localUid;
  }

  public init() {
    this.initLocalPeer();
    this.initLocalStream();
  }

  private initLocalPeer() {
    const secure = window.location.protocol === "https:";
    const port =
      window.location.port === ""
        ? secure
          ? 443
          : 80
        : parseInt(window.location.port);

    this.peer = new Peer(this.localUid, {
      host: "/",
      path: "/peer/app",
      debug: 3,
      secure,
      port,
      config: { iceServers: [{ urls: ["stun:stun.l.google.com:19302"] }] },
    });

    this.peer.on("call", this.onCall);
  }

  private initLocalStream() {
    navigator.getUserMedia(
      { audio: true },
      (stream) => {
        this.localStream = stream;
      },
      (err) => {
        console.log("[StreamManager] Failed to get local stream", err);
      }
    );
  }

  private shouldInitiateCallWith(remoteUid: string) {
    return [this.localUid, remoteUid].sort()[0] === this.localUid;
  }

  private initiateCallWith(remoteUid: string) {
    console.log(`[StreamManager] Initiating call to ${remoteUid}`);
    const call = this.peer.call(remoteUid, this.localStream);
    this.addStream(call);
  }

  private onCall = (call: MediaConnection) => {
    console.log(`[StreamManager] Incoming call from ${call.peer}`);
    call.answer(this.localStream);
    this.addStream(call);
  };

  private addStream(call: MediaConnection) {
    this.streams[call.peer] = new Stream(this, call);
  }

  public removeStream(remoteUid: string) {
    delete this.streams[remoteUid];
  }

  public shouldHaveCallsWith(remoteUids: string[]) {
    if (this.peer && this.localStream) {
      for (const remoteUid of remoteUids) {
        if (
          !this.streams[remoteUid] &&
          this.shouldInitiateCallWith(remoteUid)
        ) {
          this.initiateCallWith(remoteUid);
        }
      }
    } else {
      console.log("[StreamManager] Peer not initialized, retrying in 1s...");
      setTimeout(() => this.shouldHaveCallsWith(remoteUids), 1000);
    }
  }

  public close() {
    // TODO: implement
  }
}

class Stream {
  private manager: StreamManager;
  private call: MediaConnection;
  private stream: MediaStream;
  private audio: HTMLAudioElement;

  constructor(manager: StreamManager, call: MediaConnection) {
    this.manager = manager;
    this.call = call;
    call.on("stream", this.onStream);
    call.on("close", this.onClose);
    call.on("error", this.onError);
  }

  private onStream = (stream: MediaStream) => {
    this.stream = stream;
    this.audio = new Audio();
    this.audio.autoplay = true;
    this.audio.srcObject = this.stream;
  };

  private onClose = () => {
    this.manager.removeStream(this.call.peer);
  };

  private onError = (e: any) => {
    console.error(`Error in Stream with peer ${this.call.peer}`, e);
    this.manager.removeStream(this.call.peer);
  };
}
