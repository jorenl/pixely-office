import Phaser from "phaser";
import { IsoPos } from "./iso";
import { Point } from "./types";
import { PX_SCALE, TILE } from "./consts";
import store, { observeStore } from "./store";

const STEP = 2;

export default class Player extends Phaser.GameObjects.Sprite {
  public iso: IsoPos;

  public path: Point[] = [];

  private badge: Phaser.GameObjects.Text;

  public uid: string;

  constructor(scene: Phaser.Scene, uid: string) {
    super(scene, 0, 0, "dude", 6);
    this.iso = new IsoPos(this);

    this.uid = uid;

    this.setOrigin(0, 58 / 55); // 3px below bottom edge of sprite
    this.scale = 3;

    this.badge = this.scene.add.text(0, 0, "");
    this.badge.setShadow(1, 1, "#000", 0, false, true);
    this.badge.depth = 9999;

    const unsub = observeStore(
      store,
      (s) => s.players.find((p) => p.uid === this.uid),
      (playerState) => {
        this.iso.goto({
          x: playerState.position.x,
          y: playerState.position.y,
          z: 0,
        });

        this.path = playerState.path;

        if (playerState.name !== this.badge.text) {
          this.badge.setText(playerState.name);
        }
      }
    );
    this.on(Phaser.GameObjects.Events.DESTROY, () => {
      this.badge.destroy();
      unsub();
    });
  }

  public update() {
    if (this.path.length) {
      const pos = this.iso.pos();
      const dest = this.path[0];
      if (Math.abs(pos.x - dest.x) > STEP) {
        const speed = pos.x < dest.x ? STEP : -STEP;
        this.iso.goto({ x: pos.x + speed });
        this.setFrame(speed > 0 ? 6 : 10);
      } else if (Math.abs(pos.y - dest.y) > STEP) {
        const speed = pos.y < dest.y ? STEP : -STEP;
        this.iso.goto({ y: pos.y + speed });
        this.setFrame(speed > 0 ? 8 : 4);
      } else {
        this.path.splice(0, 1);
      }
    }

    // update badge
    this.badge.x = this.x + TILE * PX_SCALE - this.badge.width / 2;
    this.badge.y = this.y - 200;
  }
}
