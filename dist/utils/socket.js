"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRoomPlayers = void 0;
const getRoomPlayers = (socket, room, players) => {
    const clients = socket.sockets.adapter.rooms.get(room);
    return players.filter((player) => clients === null || clients === void 0 ? void 0 : clients.has(player.id));
};
exports.getRoomPlayers = getRoomPlayers;
