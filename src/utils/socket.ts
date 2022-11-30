import { Server } from "socket.io";
import { Player } from "../types";

export const getRoomPlayers = (
  socket: Server,
  room: string,
  players: Player[]
): Player[] => {
  const clients = socket.sockets.adapter.rooms.get(room);
  return players.filter((player) => clients?.has(player.id));
};
