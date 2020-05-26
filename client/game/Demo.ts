import "phaser";
import {
  TiledJSONMap,
  TiledJSONTileset,
  TiledJSONTilesetTile,
  Point,
} from "./types";

import range from "lodash/range";
import Player from "./Player";
import { PX_SCALE, TILE, DRAG_THRESHOLD } from "./consts";
import { Cursor } from "./Cursor";
import { Tile } from "./Tile";
import { unproject, snapToIsoGrid } from "./iso";
import store, { observeStore, dispatchAndSend, getState } from "./store";

const distanceBetweenPoints = Phaser.Math.Distance.BetweenPoints;

export default class Demo extends Phaser.Scene {
  private cursor: Phaser.GameObjects.Polygon;
  // private player: Player;

  private playersGroup: Phaser.GameObjects.Group;
  private playersByUid: { [uid: string]: Player };
  private activePlayer: Player;

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

    this.playersGroup = this.add.group([], { runChildUpdate: true });
    this.playersByUid = {};

    this.cursor = new Cursor(this, 0, 0);
    this.add.existing(this.cursor);

    this.input.on("pointerdown", () => {
      let dragging = false;
      const pointerDownPos = this.game.input.activePointer.position.clone();
      const pointerDownScrollX = this.cameras.main.scrollX;
      const pointerDownScrollY = this.cameras.main.scrollY;

      const onPointerMove = () => {
        const pointerPos = this.game.input.activePointer.position;
        if (
          !dragging &&
          distanceBetweenPoints(pointerDownPos, pointerPos) > DRAG_THRESHOLD
        ) {
          dragging = true;
        }
        if (dragging) {
          this.cameras.main.setScroll(
            pointerDownScrollX + (pointerDownPos.x - pointerPos.x),
            pointerDownScrollY + (pointerDownPos.y - pointerPos.y)
          );
        }
      };

      const onPointerUp = () => {
        const pointerPos = this.game.input.activePointer.position;
        if (!dragging) {
          // handle click
          const clickPosIso = unproject(this, pointerPos, 0);
          const snapped = snapToIsoGrid(clickPosIso);
          console.log("pointerup as click", snapped);

          dispatchAndSend({
            type: "MOVE_PLAYER",
            uid: this.activePlayer.uid,
            x: snapped.x,
            y: snapped.y,
          });
        }
        this.input.off("pointermove", onPointerMove);
        this.input.off("pointerup", onPointerUp);
      };
      this.input.on("pointermove", onPointerMove);
      this.input.on("pointerup", onPointerUp);
    });

    const unsub = observeStore(
      store,
      (s) => s.players,
      (playersState) => {
        const uids = new Set<string>();
        playersState.forEach((playerState) => {
          uids.add(playerState.uid);
          // create player if it does not exist
          if (!this.playersByUid[playerState.uid]) {
            const sprite = new Player(this, playerState.uid);
            this.playersGroup.add(sprite, true);
            this.playersByUid[playerState.uid] = sprite;
          }
        });
        Object.keys(this.playersByUid).map((uid) => {
          if (!uids.has(uid)) {
            // remove player, it's no longer in state
            const sprite = this.playersByUid[uid];
            this.playersGroup.remove(sprite, true, true);
          }
        });

        if (!this.activePlayer) {
          this.activePlayer = this.playersByUid[getState().activePlayer];
        }
      }
    );
    this.events.on(Phaser.Scenes.Events.DESTROY, unsub);
  }

  update() {
    this.cursor.update();
    // this.player.update();
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
