import Phaser from "phaser";
import { IsoPos } from "./iso";
import { PX_SCALE } from "./consts";

export class Tile extends Phaser.GameObjects.Image {
  public iso: IsoPos;
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    depthOffset: number = 0
  ) {
    super(scene, 0, 0, texture);
    this.iso = new IsoPos(this);
    this.iso.depthOffset = depthOffset;
    this.iso.goto({ x, y, z: 0 });

    this.scale = PX_SCALE;
    this.setOrigin(0, 1);
  }
}
