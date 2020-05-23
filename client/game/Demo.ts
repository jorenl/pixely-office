import "phaser";
import IsoPlugin, { IsoObj, WithIsoSpriteFn } from "phaser3-plugin-isometric";
import {
  TiledJSONMap,
  TiledJSONTileset,
  TiledJSONTilesetTile,
  Point,
} from "./types";

import range from "lodash/range";

const PX_SCALE = 3;
const TILE = 16;

export default class Demo extends Phaser.Scene {
  private dragOrigin: Point | null = null;

  // These hacky declarations specify how IsoPlugin extends the scene:
  public declare add: Phaser.GameObjects.GameObjectFactory & WithIsoSpriteFn;
  public declare iso: IsoObj;

  private cursor: Phaser.GameObjects.Polygon;

  constructor() {
    super({ key: "demo", mapAdd: { isoPlugin: "iso" } });
  }

  preload() {
    this.load.image("logo", "assets/phaser3-logo.png");
    this.load.image("libs", "assets/libs.png");

    this.load.json("map", "assets/tiled/map.json");
    this.load.json("tiles", "assets/tiled/impira_tiles/impira.json");

    this.load.spritesheet("dude", "assets/sprites/dude_32x55.png", {
      frameWidth: 32,
      frameHeight: 55,
    });

    this.load.scenePlugin({
      key: "IsoPlugin",
      url: IsoPlugin,
      sceneKey: "iso",
    });

    this.load.on("filecomplete", (key: string) => {
      console.log("filecomplete", key);
      if (key === "tiles") {
        var data: TiledJSONTileset = this.cache.json.get("tiles");
        data.tiles.map((tile) => {
          this.load.image(
            `tile-${tile.image}`,
            `assets/tiled/impira_tiles/${tile.image}`
          );
        });
      }
    });
  }

  create() {
    // Set the origin of the isometric projection to the mid top of the screen
    this.iso.projector.origin.setTo(0.5, 0.1);
    // override the projection to be exactly 2:1
    this.iso.projector._transform = [1, 0.5];

    this.buildIsoMap();

    const dude = this.add.isoSprite(
      25 * PX_SCALE * TILE,
      25 * PX_SCALE * TILE,
      1,
      "dude",
      undefined,
      6
    );
    dude.setOrigin(0, 58 / 55); // 3px below bottom edge of sprite
    dude.scale = 3;

    this.input.on("pointerdown", () => {
      console.log("pointerdown");
      const clickPos = this.game.input.activePointer.position;
      const clickPosIso = this.iso.projector.unproject(clickPos);
      const { x, y } = this.snapToIsoGrid(clickPosIso);
      dude.isoX = x;
      dude.isoY = y;
      console.log(dude.isoX, dude.isoY);
    });

    const c = this.add.polygon(dude.x, dude.y, [
      [0 * PX_SCALE, 8 * PX_SCALE],
      [16 * PX_SCALE, 16 * PX_SCALE],
      [32 * PX_SCALE, 8 * PX_SCALE],
      [16 * PX_SCALE, 0 * PX_SCALE],
    ]);
    c.closePath = true;
    c.depth = 9999;
    c.isFilled = false;
    c.isStroked = true;
    c.lineWidth = 2;
    c.strokeColor = 0;
    c.setOrigin(0, 1);
    this.cursor = c;
  }

  update() {
    if (this.game.input.activePointer.isDown) {
      if (this.dragOrigin) {
        // move the camera by the amount the mouse has moved since last update
        const { x: ox, y: oy } = this.dragOrigin;
        const { x: px, y: py } = this.game.input.activePointer.position;
        this.cameras.main.scrollX += ox - px;
        this.cameras.main.scrollY += oy - py;
      } // set new drag origin to current position
      this.dragOrigin = this.game.input.activePointer.position.clone();
    } else {
      this.dragOrigin = null;
    }

    // update cursor
    const mousePos = this.game.input.activePointer.position;
    const mousePosIso = this.iso.projector.unproject(mousePos);
    const { x: isoX, y: isoY } = this.snapToIsoGrid(mousePosIso);
    const { x, y } = this.iso.projector.project({ x: isoX, y: isoY, z: 0 });
    this.cursor.setPosition(x, y);
  }

  private snapToIsoGrid({ x, y }: Point): Point {
    return {
      x: Math.round(x / (PX_SCALE * TILE)) * (PX_SCALE * TILE),
      y: Math.round(y / (PX_SCALE * TILE) + 1) * (PX_SCALE * TILE),
    };
  }

  private buildIsoMap() {
    var map: TiledJSONMap = this.cache.json.get("map");
    var tiles: TiledJSONTileset = this.cache.json.get("tiles");

    const tileWidth = map.tilewidth * PX_SCALE;
    const tileHeight = map.tileheight * PX_SCALE;

    const tileDefinitions: { [id: number]: TiledJSONTilesetTile } = {};
    tiles.tiles.map((tile) => {
      tileDefinitions[tile.id] = tile;
    });

    // var centerX = (map.width * tileWidth) / 2;
    var centerX = 400;
    var centerY = 16;

    range(0, map.width).map((x) => {
      range(0, map.height).map((y) => {
        map.layers.map((layer) => {
          var tx = (x - y) * (tileWidth / 2);
          var ty = (x + y) * (tileHeight / 2);

          if (
            x >= layer.x &&
            x < layer.x + layer.width &&
            y >= layer.y &&
            y < layer.y + layer.height
          ) {
            const tileId = layer.data[y * layer.width + x];

            if (tileId !== 0) {
              const tile = tileDefinitions[tileId - 1];

              // this.add.group;

              const sprite = this.add.isoSprite(
                x * TILE * PX_SCALE,
                y * TILE * PX_SCALE,
                0,
                `tile-${tile.image}`
              );

              sprite.scale = PX_SCALE;
              sprite.setOrigin(0, 1);

              // const img = this.add.image(
              //   centerX + tx,
              //   centerY + ty,
              //   `tile-${tile.image}`
              // );
              // img.setOrigin(0, 1);
              // img.depth = centerY + ty;
              // img.scale = PX_SCALE;
            }
          }
        });
      });
    });
  }
}
