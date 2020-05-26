import { Action } from "shared/store";

export type Message =
  | UserJoinedMessage
  | UserLeftMessage
  | ReduxActionMessage
  | RequestGameStateMessage;

interface BaseMessage {}

interface UserJoinedMessage extends BaseMessage {
  type: "USER_JOINED";
  uid: string;
  username: string;
}

interface UserLeftMessage extends BaseMessage {
  type: "USER_LEFT";
  uid: string;
  username: string;
}

interface ReduxActionMessage extends BaseMessage {
  type: "REDUX_ACTION";
  action: Action;
}

interface RequestGameStateMessage extends BaseMessage {
  type: "REQUEST_GAME_STATE";
}
