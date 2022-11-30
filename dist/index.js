"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const socket_io_1 = require("socket.io");
const Game_1 = require("./classes/Game");
const app = (0, express_1.default)();
const PORT = 4000;
//New imports
const http = require("http").Server(app);
app.use((0, cors_1.default)());
const socketIO = new socket_io_1.Server(http, {
    cors: {
        origin: "http://localhost:3000",
    },
});
const games = [];
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
                    payload: `${socket.id} has joined the room! Partecipants: ${Array.from(room || []).join(", ")}`,
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
                if (!clients)
                    break;
                const game = new Game_1.Game(Array.from(clients), payload.room);
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
