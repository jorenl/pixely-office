import React, { useState, useEffect } from "react";
import { v4 as uuid } from "uuid";

import GameComponent from "./game/GameComponent";
import { dispatch, dispatchAndSend } from "./game/store";
import { getWsConnection, OnMessageHandler, OnOpenHandler } from "./socket";

import Streams from "./streams";

const App = () => {
  const [show, setShow] = useState(false);
  const [name, setName] = useState<string>("");

  // Link our websocket handler to the redux store
  useEffect(() => {
    const wsc = getWsConnection();
    const onMessageHandler: OnMessageHandler = (message) => {
      if (message.type === "REDUX_ACTION") {
        dispatch(message.action);
      }
    };
    const onOpenHandler: OnOpenHandler = () => {
      wsc.send({ type: "REQUEST_GAME_STATE" });
    };
    wsc.onMessage(onMessageHandler);
    wsc.onOpen(onOpenHandler);
    const cleanup = () => {
      wsc.removeOnMessage(onMessageHandler);
      wsc.removeOnOpen(onOpenHandler);
    };
    return cleanup;
  });

  const joinGame = () => {
    const uid = uuid();
    dispatchAndSend({ type: "ADD_PLAYER", name, uid, x: 1008, y: 1200 });
    dispatch({ type: "SET_ACTIVE_PLAYER", uid });
    setShow(true);
  };

  return (
    <div>
      <h1>Pixely Office!</h1>

      {show ? (
        <>
          <GameComponent />
          <Streams />
        </>
      ) : (
        <div>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button onClick={joinGame}>Play</button>
        </div>
      )}
    </div>
  );
};

export default App;
