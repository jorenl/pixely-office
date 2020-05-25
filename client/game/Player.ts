import Phaser from "phaser";
import { IsoSprite } from "phaser3-plugin-isometric";
import { project, IsoPos } from "./iso";

export default class Player extends Phaser.GameObjects.Sprite {
  public iso: IsoPos;

  constructor(scene: Phaser.Scene, x: number, y: number, z: number) {
    super(scene, 0, 0, "dude", 6);
    this.iso = new IsoPos(this);
    this.iso.goto({ x, y, z });

    this.setOrigin(0, 58 / 55); // 3px below bottom edge of sprite
    this.scale = 3;
  }
}
