export interface State {
  activePlayer: string | null;
  players: Player[];
}

export interface Player {
  uid: string;
  name: string;
  position: Position;
  path: Position[];
}

export interface Position {
  x: number;
  y: number;
}

export const INITIAL_STATE: State = {
  activePlayer: null,
  players: [],
};
