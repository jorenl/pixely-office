export type Message = ChatMessage | UserJoinedMessage;

interface BaseMessage {
  sender: string;
}

interface ChatMessage extends BaseMessage {
  type: "CHAT";
  text: string;
}

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
