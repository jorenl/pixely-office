import React from "react";
import Phaser from "phaser";

import Demo from "./Demo";

export default class GameComponent extends React.Component {
  private ref = React.createRef<HTMLDivElement>();
  private game: Phaser.Game;

  public shouldComponentUpdate() {
    return false;
  }
  public componentDidMount() {
    this.game = new Phaser.Game({
      type: Phaser.AUTO,
      backgroundColor: "#125555",
      width: 800,
      height: 600,
      render: {
        pixelArt: true,
      },
      scene: Demo,
      parent: this.ref.current,
    });
  }

  public componentWillUnmount() {
    this.game.destroy(true);
  }

  public render() {
    return <div ref={this.ref} />;
  }
}
