import "phaser";
import {
  TiledJSONMap,
  TiledJSONTileset,
  TiledJSONTilesetTile,
  Point,
} from "./types";

import range from "lodash/range";
import Player from "./Player";
import { PX_SCALE, TILE } from "./consts";
import { Cursor } from "./Cursor";
import { Tile } from "./Tile";
import { unproject, snapToIsoGrid } from "./iso";

export default class Demo extends Phaser.Scene {
  private dragOrigin: Point | null = null;

  private cursor: Phaser.GameObjects.Polygon;
  private player: Player;

  constructor() {
    super({ key: "demo", mapAdd: {} });
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
    this.buildIsoMap();

    this.player = new Player(
      this,
      25 * PX_SCALE * TILE,
      25 * PX_SCALE * TILE,
      1
    );
    this.add.existing(this.player);

    this.input.on("pointerdown", () => {
      console.log("pointerdown");
      const mousePos = this.game.input.activePointer.position;
      const clickPosIso = unproject(this, mousePos, 0);
      const snapped = snapToIsoGrid(clickPosIso);
      this.player.path.push(snapped);
    });

    this.cursor = new Cursor(this, this.player.x, this.player.y);
    this.add.existing(this.cursor);
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

    this.cursor.update();
    this.player.update();
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
              const tileDef = tileDefinitions[tileId - 1];
              const depthOffset = layer.name === "floor" ? -64 : 0;
              const tile = new Tile(
                this,
                x * TILE * PX_SCALE,
                y * TILE * PX_SCALE,
                `tile-${tileDef.image}`,
                depthOffset
              );
              this.add.existing(tile);
            }
          }
        });
      });
    });
  }
}
