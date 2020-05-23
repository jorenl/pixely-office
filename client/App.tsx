import React, { useState } from "react";

import { useWsConnection } from "./useWsConnection";
import GameComponent from "./game/GameComponent";

const App = () => {
  const [show, setShow] = useState(false);
  const wsRef = useWsConnection();
  return (
    <div>
      <h1>It worked!</h1>
      <p>Now lets build some stuff</p>

      {show ? (
        <button onClick={() => setShow(false)}>Stop</button>
      ) : (
        <button onClick={() => setShow(true)}>Play</button>
      )}
      {show && <GameComponent />}
    </div>
  );
};

export default App;
