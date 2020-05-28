import React, { createRef } from "react";
import Peer from "peerjs";

interface Props {
  peer: Peer;
  localUid: string;
  localStream: MediaStream;
  remoteUid: string;
}
class Stream extends React.Component<Props> {
  private ref = createRef<HTMLAudioElement>();
  private call: Peer.MediaConnection;

  private shouldInitiate(): boolean {
    const { localUid, remoteUid } = this.props;
    return [localUid, remoteUid].sort()[0] === localUid;
  }

  private attachCall(call: Peer.MediaConnection) {
    call.on("stream", (remoteStream) => {
      this.ref.current.srcObject = remoteStream;
    });
    this.call = call;
  }

  private onCall(call: Peer.MediaConnection) {
    if (call.peer === this.props.remoteUid) {
      this.attachCall(call);
    }
  }

  public componentDidMount() {
    const { peer, remoteUid, localStream } = this.props;
    if (this.shouldInitiate()) {
      this.attachCall(peer.call(remoteUid, localStream));
    } else {
      peer.on("call", this.onCall);
    }
  }

  public componentWillUnmount() {
    this.props.peer.off("call", this.onCall);
    if (this.call) {
      this.call.close();
    }
  }

  render() {
    return <audio ref={this.ref} autoPlay />;
  }
}

export default Stream;
