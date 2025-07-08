import { WebSocketServer, WebSocket } from "ws";

const wss = new WebSocketServer({ port: 8080 });
const user = new Map<number, WebSocket[]>();

wss.on("connection", (socket) => {
  socket.on("message", (msg) => {
    try {
      const data = JSON.parse(msg.toString());
     // console.log(data)
      if (data.type === "create") {
        const code = Math.floor(Math.random() * 10000);
        user.set(code, [socket]);
        socket.send(code);
        return;
      }

      if (data.type === "join") {
        const room = user.get(data.code);
        if (!room) {
          socket.send("invalid code");
          return;
        }
        room.push(socket);
        return;
      }

      if (data.type === "message") {
        const room = user.get(data.code)!;
        for (let client of room) {
          if (client !== socket && client.readyState === WebSocket.OPEN) {
            console.log(data.msg);
            client.send(JSON.stringify({
              username: data.username,
              msg: data.msg
            }));
          }
        }
      }

    } catch (err) {
      console.error("❌ Error handling message:", err);
      socket.send(JSON.stringify({ error: "Invalid message format" }));
    }
  });
});
