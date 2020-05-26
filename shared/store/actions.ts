import { Player } from "./state";

export type Action =
  | SetActivePlayerAction
  | AddPlayerAction
  | RemovePlayerAction
  | MovePlayerAction
  | UpdateGameStateAction;

export interface SetActivePlayerAction {
  type: "SET_ACTIVE_PLAYER";
  uid: string;
}

export type PlayersAction =
  | AddPlayerAction
  | RemovePlayerAction
  | MovePlayerAction;

export interface AddPlayerAction {
  type: "ADD_PLAYER";
  name: string;
  uid: string;
  x: number;
  y: number;
}

export interface RemovePlayerAction {
  type: "REMOVE_PLAYER";
  uid: string;
}

export type PlayerAction = MovePlayerAction;

export interface MovePlayerAction {
  type: "MOVE_PLAYER";
  uid: string;
  x: number;
  y: number;
}

export interface UpdateGameStateAction {
  type: "UPDATE_GAME_STATE";
  players: Player[];
}
