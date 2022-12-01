"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const socket_io_1 = require("socket.io");
const Game_1 = require("./classes/Game");
const socket_1 = require("./utils/socket");
const app = (0, express_1.default)();
const PORT = 4000;
//New imports
const http = require("http").Server(app);
app.use((0, cors_1.default)());
const socketIO = new socket_io_1.Server(http, {
    cors: {
        origin: "*",
    },
});
const games = [];
const players = [];
socketIO.on("connection", (socket) => {
    console.log(`⚡: ${socket.id} user just connected!`);
    socket.on("message", (message) => {
        const { type, payload } = message;
        switch (type) {
            case "join":
                const roomGame = games.find((game) => game.getId() === payload.room);
                if (roomGame ||
                    (0, socket_1.getRoomPlayers)(socketIO, payload.room, players).length > 1)
                    return;
                socket.join(payload.room);
                const player = {
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
                        players: (0, socket_1.getRoomPlayers)(socketIO, payload.room, players),
                    },
                });
                break;
            case "start":
                const clients = socketIO.sockets.adapter.rooms.get(payload.room);
                if (!clients)
                    break;
                const game = new Game_1.Game((0, socket_1.getRoomPlayers)(socketIO, payload.room, players), payload.room);
                games.push(game);
                socketIO.to(payload.room).emit("message", {
                    type: "info",
                    payload: {
                        board: game.getBoard(),
                        players: (0, socket_1.getRoomPlayers)(socketIO, payload.room, players),
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
                            players: (0, socket_1.getRoomPlayers)(socketIO, payload.room, players),
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
                            players: (0, socket_1.getRoomPlayers)(socketIO, payload.room, players),
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
