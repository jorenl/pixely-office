import React from "react";
import { connect } from "react-redux";
import { State as StoreState } from "shared/store";
import Peer from "peerjs";
import Stream from "./Stream";

interface ConnectedProps {
  localUid: string;
  remoteUids: string[];
}
interface State {
  localStreamReady: boolean;
}
type Props = ConnectedProps;
class Streams extends React.Component<Props, State> {
  public state: State = {
    localStreamReady: false,
  };

  private peer: Peer;
  private localStream: MediaStream;

  constructor(props: Props) {
    super(props);

    this.peer = new Peer(props.localUid, {
      host: "/",
      path: "/peerjs/app",
      debug: 3,
    });
  }

  public componentDidMount() {
    navigator.getUserMedia(
      { audio: true },
      (stream) => {
        this.localStream = stream;
        this.setState({ localStreamReady: true });
      },
      (err) => {
        console.log("Failed to get local stream", err);
      }
    );
  }

  public render() {
    const { localStreamReady } = this.state;
    const { localUid, remoteUids } = this.props;

    return (
      localStreamReady &&
      remoteUids.map((remoteUid) => (
        <Stream
          key={`Stream-${remoteUid}`}
          peer={this.peer}
          localStream={this.localStream}
          localUid={localUid}
          remoteUid={remoteUid}
        />
      ))
    );
  }
}

function stateToProps(s: StoreState): ConnectedProps {
  return {
    localUid: s.activePlayer,
    remoteUids: s.players
      .map((p) => p.uid)
      .filter((uid) => uid !== s.activePlayer),
  };
}

export default connect(stateToProps)(Streams);
