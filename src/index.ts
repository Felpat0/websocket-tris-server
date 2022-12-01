import express from "express";
import cors from "cors";
import { Server } from "socket.io";
import { Game } from "./classes/Game";
import { Player } from "./types";
import { getRoomPlayers } from "./utils/socket";
const app = express();
const PORT = 4000;

//New imports
const http = require("http").Server(app);

app.use(cors());

const socketIO = new Server(http, {
  cors: {
    origin: "*",
  },
});

const games: Game[] = [];
const players: Player[] = [];
socketIO.on("connection", (socket) => {
  console.log(`⚡: ${socket.id} user just connected!`);

  socket.on("message", (message) => {
    const { type, payload } = message;

    switch (type) {
      case "join":
        const roomGame = games.find((game) => game.getId() === payload.room);
        if (
          roomGame ||
          getRoomPlayers(socketIO, payload.room, players).length > 1
        )
          return;
        socket.join(payload.room);
        const player: Player = {
          id: socket.id,
          name: payload.name,
        };

        players.push(player);

        // Tell to the client that he has joined the room
        socketIO.to(socket.id).emit("message", {
          type: "room",
          payload: {
            room: payload.room,
          },
        });

        // Send the list of players to the players
        socketIO.to(payload.room).emit("message", {
          type: "players",
          payload: {
            players: getRoomPlayers(socketIO, payload.room, players),
          },
        });
        break;
      case "start":
        const clients = socketIO.sockets.adapter.rooms.get(payload.room);
        if (!clients) break;
        const game = new Game(
          getRoomPlayers(socketIO, payload.room, players),
          payload.room
        );
        games.push(game);

        socketIO.to(payload.room).emit("message", {
          type: "info",
          payload: {
            board: game.getBoard(),
            players: getRoomPlayers(socketIO, payload.room, players),
            currentPlayer: game.getCurrentPlayer(),
            room: game.getId(),
          },
        });
        break;
      case "play":
        const currentGame = games.find((game) => game.getId() === payload.room);
        if (currentGame) {
          const hasWon = currentGame.play(payload.row, payload.col, socket.id);

          socketIO.to(payload.room).emit("message", {
            type: "info",
            payload: {
              board: currentGame.getBoard(),
              players: getRoomPlayers(socketIO, payload.room, players),
              currentPlayer: currentGame.getCurrentPlayer(),
              room: currentGame.getId(),
              winner: hasWon ? currentGame.getCurrentPlayer() : undefined,
              draw: currentGame.isADraw(),
            },
          });
        }
        break;
      case "reset":
        const gameToReset = games.find((game) => game.getId() === payload.room);
        if (gameToReset) {
          gameToReset.reset();
          socketIO.to(payload.room).emit("message", {
            type: "info",
            payload: {
              board: gameToReset.getBoard(),
              players: getRoomPlayers(socketIO, payload.room, players),
              currentPlayer: gameToReset.getCurrentPlayer(),
              room: gameToReset.getId(),
              reset: true,
            },
          });
        }
        break;
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
