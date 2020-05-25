import Phaser from "phaser";
import { PX_SCALE } from "./consts";
import { unproject, snapToIsoGrid, project, IsoPos } from "./iso";

export class Cursor extends Phaser.GameObjects.Polygon {
  public iso: IsoPos;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    const points = [
      [0 * PX_SCALE, 8 * PX_SCALE],
      [16 * PX_SCALE, 16 * PX_SCALE],
      [32 * PX_SCALE, 8 * PX_SCALE],
      [16 * PX_SCALE, 0 * PX_SCALE],
    ];

    super(scene, x, y, points);

    this.closePath = true;
    this.depth = 9999;
    this.isFilled = false;
    this.isStroked = true;
    this.lineWidth = 2;
    this.strokeColor = 0;
    this.setOrigin(0, 1);

    this.iso = new IsoPos(this);
  }

  public update() {
    const mousePos = this.scene.game.input.activePointer.position;
    const mousePosIso = unproject(this.scene, mousePos, 0);
    const snapped = snapToIsoGrid(mousePosIso);
    this.iso.goto({ x: snapped.x, y: snapped.y, z: 0 });
    this.depth = 9999;
  }
}
