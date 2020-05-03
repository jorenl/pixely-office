export interface TiledJSONMap {
  compressionlevel: number;
  editorsettings: {
    export: {
      format: string;
      target: string;
    };
  };
  height: number;
  infinite: boolean;
  layers: TiledJSONMapLayer[];
  nextlayerid: number;
  nextobjectid: number;
  orientation: string;
  renderorder: string;
  tiledversion: string;
  tileheight: number;
  tilesets: TiledJSONMapTileset[];
  tilewidth: number;
  type: string;
  version: number;
  width: number;
}

export interface TiledJSONMapLayer {
  data: number[];
  height: number;
  id: number;
  name: string;
  opacity: number;
  type: string;
  visible: boolean;
  width: number;
  x: number;
  y: number;
}

export interface TiledJSONMapTileset {
  firstgid: number;
  source: string;
}

export interface TiledJSONTileset {
  columns: number;
  grid: TiledJSONTilesetGrid;
  margin: number;
  name: string;
  spacing: number;
  tilecount: number;
  tiledversion: string;
  tileheight: number;
  tiles: TiledJSONTilesetTile[];
  tilewidth: number;
  type: string;
  version: number;
}

export interface TiledJSONTilesetGrid {
  height: number;
  orientation: string;
  width: number;
}

export interface TiledJSONTilesetTile {
  id: number;
  image: string;
  imageheight: number;
  imagewidth: number;
}

export interface Point {
  x: number;
  y: number;
}
