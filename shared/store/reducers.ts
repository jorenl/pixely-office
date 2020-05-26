import { State, INITIAL_STATE, Player } from "./state";
import { Action, PlayerAction, PlayersAction } from "./actions";
import { shouldBeNever } from "shared/utils";

export function rootReducer(
  state: State = INITIAL_STATE,
  action: Action
): State {
  switch (action.type) {
    case "SET_ACTIVE_PLAYER":
      return {
        ...state,
        activePlayer: action.uid,
      };
    case "UPDATE_GAME_STATE":
      return {
        ...state,
        players: action.players,
      };
    case "ADD_PLAYER":
    case "REMOVE_PLAYER":
    case "MOVE_PLAYER":
      return {
        ...state,
        players: playersReducer(state.players, action),
      };
    default:
      return state;
  }
}

function playersReducer(players: Player[], action: PlayersAction): Player[] {
  switch (action.type) {
    case "ADD_PLAYER":
      return [
        ...players,
        {
          uid: action.uid,
          name: action.name,
          path: [],
          position: {
            x: action.x,
            y: action.y,
          },
        },
      ];
    case "REMOVE_PLAYER":
      return players.filter((p) => p.uid !== action.uid);
    case "MOVE_PLAYER":
      return players.map((p) =>
        p.uid === action.uid ? playerReducer(p, action) : p
      );
    default:
      shouldBeNever(action);
  }
}

function playerReducer(player: Player, action: PlayerAction): Player {
  switch (action.type) {
    case "MOVE_PLAYER":
      return {
        ...player,
        position: {
          x: action.x,
          y: action.y,
        },
      };
    default:
    // shouldBeNever(action);
  }
}
