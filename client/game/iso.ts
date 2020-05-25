import { Point } from "./types";
import { PX_SCALE, TILE } from "./consts";

interface Point3 {
  x: number;
  y: number;
  z: number;
}

interface Point2 {
  x: number;
  y: number;
  depth: number;
}

const TRANSFORM = [1, 0.5];

export function project({ x, y, z }: Point3): Point2 {
  return {
    x: (x - y) * TRANSFORM[0],
    y: (x + y) * TRANSFORM[1] - z,
    depth: x + y + z * 1.25,
  };
}

export function unproject(
  scene: Phaser.Scene,
  screenPos: Point,
  z: number
): Point3 {
  const x = screenPos.x + scene.cameras.main.scrollX;
  const y = screenPos.y + scene.cameras.main.scrollY + z;
  return {
    x: x / (2 * TRANSFORM[0]) + y / (2 * TRANSFORM[1]),
    y: -(x / (2 * TRANSFORM[0])) + y / (2 * TRANSFORM[1]),
    z,
  };
}

export function snapToIsoGrid({ x, y }: Point): Point {
  return {
    x: Math.round(x / (PX_SCALE * TILE)) * (PX_SCALE * TILE),
    y: Math.round(y / (PX_SCALE * TILE) + 1) * (PX_SCALE * TILE),
  };
}

interface PositionableGameObject {
  x: number;
  y: number;
  depth: number;
}

export class IsoPos {
  private parent: PositionableGameObject;
  private x: number;
  private y: number;
  private z: number;

  constructor(parent: PositionableGameObject) {
    this.parent = parent;
  }

  public goto({ x = this.x, y = this.y, z = this.z }: Partial<Point3>) {
    this.x = x;
    this.y = y;
    this.z = z;
    const p = project({ x, y, z });
    this.parent.x = p.x;
    this.parent.y = p.y;
    this.parent.depth = p.depth;
  }

  public pos(): Point3 {
    return {
      x: this.x,
      y: this.y,
      z: this.z,
    };
  }
}
