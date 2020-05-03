import "phaser";
import IsoPlugin from "phaser3-plugin-isometric";
import {
  TiledJSONMap,
  TiledJSONTileset,
  TiledJSONTilesetTile,
  Point,
} from "./types";

import _ from "lodash";

const PX_SCALE = 3;

export default class Demo extends Phaser.Scene {
  private dragOrigin: Point | null = null;

  constructor() {
    super("demo");
  }

  preload() {
    this.load.image("logo", "assets/phaser3-logo.png");
    this.load.image("libs", "assets/libs.png");

    this.load.json("map", "assets/tiled/map.json");
    this.load.json("tiles", "assets/tiled/impira_tiles/impira.json");

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
    this.buildIsoMap();
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

    _.range(0, map.width).map((x) => {
      _.range(0, map.height).map((y) => {
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
              const img = this.add.image(
                centerX + tx,
                centerY + ty,
                `tile-${tile.image}`
              );
              img.setOrigin(0, 1);
              img.depth = centerY + ty;
              img.scale = PX_SCALE;
            }
          }
        });
      });
    });
  }
}

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  backgroundColor: "#125555",
  width: 800,
  height: 600,
  render: {
    pixelArt: true,
  },
  scene: Demo,
};

const game = new Phaser.Game(config);
