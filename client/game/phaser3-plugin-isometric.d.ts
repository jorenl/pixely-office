declare module "phaser3-plugin-isometric" {
  type IsoPlugin = () => null; // TODO

  class Point3 {
    public x: number;
    public y: number;
    public z: number;

    constructor(x: number, y: number, z: number);

    equals(a: Point3): boolean;
    set(x: number, y: number, z: number): void;
    setTo(x: number, y: number, z: number): void;
    add(x: number, y: number, z: number): this;
    subtract(x: number, y: number, z: number): this;
    multiply(x: number, y: number, z: number): this;
    divide(x: number, y: number, z: number): this;
  }

  class Cube {
    // TODO
  }

  class Projector {
    public origin: Phaser.Geom.Point;
    public _transform: number[];
    get projectionAngle(): number;
    set projectionAngle(value: number);

    unproject(
      point: { x: number; y: number },
      out?: Point3,
      z?: number
    ): Point3;

    project(point: { x: number; y: number; z: number }, out?: Point3): Point3;
  }

  class IsoSprite extends Phaser.GameObjects.Sprite {
    get isoX(): number;
    set isoX(value: number);
    get isoY(): number;
    set isoY(value: number);
    get isoZ(): number;
    set isoZ(value: number);

    get isoPosition(): Point3;

    get isoBounds(): Cube;
  }

  export type IsoSpriteFn = (
    x: number,
    y: number,
    z: number,
    texture: string,
    group?: Phaser.GameObjects.Group,
    frame?: number
  ) => IsoSprite;

  export interface WithIsoSpriteFn {
    isoSprite: IsoSpriteFn;
  }

  export interface IsoObj {
    projector: Projector;
  }

  const isoPlugin: IsoPlugin;
  export default isoPlugin;
}
