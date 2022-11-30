import express from "express";
import cors from "cors";
import { Server } from "socket.io";
import { Game } from "./classes/Game";
const app = express();
const PORT = 4000;

//New imports
const http = require("http").Server(app);

app.use(cors());

const socketIO = new Server(http, {
  cors: {
    origin: "http://localhost:3000",
  },
});

const games: Game[] = [];
socketIO.on("connection", (socket) => {
  console.log(`⚡: ${socket.id} user just connected!`);

  socket.on("message", (message) => {
    const { type, payload } = message;

    switch (type) {
      case "join":
        socket.join(payload.room);
        const room = socketIO.sockets.adapter.rooms.get(payload.room);

        // Tell to the client that he has joined the room
        socketIO.to(socket.id).emit("message", {
          type: "room",
          payload: {
            room: payload.room,
          },
        });

        // Tell the other players that a new player has joined the room
        socketIO.to(payload.room).emit("message", {
          type: "info",
          payload: `${
            socket.id
          } has joined the room! Partecipants: ${Array.from(room || []).join(
            ", "
          )}`,
        });

        // Send the list of players to the players
        socketIO.to(payload.room).emit("message", {
          type: "players",
          payload: {
            players: Array.from(room || []),
          },
        });
        break;
      case "start":
        const clients = socketIO.sockets.adapter.rooms.get(payload.room);
        if (!clients) break;
        const game = new Game(Array.from(clients), payload.room);
        games.push(game);

        // Tell the players that the game has started
        socketIO.to(payload.room).emit("message", {
          type: "info",
          payload: `${socket.id} has started the game!`,
        });

        // Send the board to the players
        socketIO.to(payload.room).emit("message", {
          type: "board",
          payload: { board: game.getBoard() },
        });
        break;
      case "play":
        const currentGame = games.find((game) => game.getId() === payload.room);
        if (currentGame) {
          currentGame.play(payload.row, payload.col, socket.id);
          socketIO.to(payload.room).emit("message", {
            type: "board",
            payload: { board: currentGame.getBoard() },
          });
        }
      default:
        break;
    }
  });
  socket.on("disconnect", () => {
    console.log("🔥: A user disconnected");
  });
});

app.get("/api", (req, res) => {
  res.json({
    message: "Hello world",
  });
});

http.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
