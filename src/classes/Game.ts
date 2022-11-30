import { Player, Board } from "../types";

export class Game {
  private id: string;
  private players: Player[];
  private board: Board;
  private currentPlayerId: Player["id"] | undefined;
  private isOver: boolean = false;

  constructor(players: Player[], id: string) {
    this.id = id;
    this.players = players;
    this.currentPlayerId = players[0].id;
    let squares = [
      [undefined, undefined, undefined],
      [undefined, undefined, undefined],
      [undefined, undefined, undefined],
    ];

    this.board = { squares };
  }

  getId() {
    return this.id;
  }

  getPlayers() {
    return this.players;
  }

  getBoard() {
    return this.board;
  }

  getPlayerCharacter(playerId: Player["id"]) {
    return this.players.findIndex((p) => p.id === playerId) === 0 ? "X" : "O";
  }

  getCurrentPlayer() {
    return this.players.find((p) => p.id === this.currentPlayerId);
  }

  getNextPlayer() {
    const currentIndex = this.players.findIndex(
      (player) => player.id === this.currentPlayerId
    );
    return this.players[(currentIndex + 1) % this.players.length];
  }

  hasPlayerWon(playerId: Player["id"]) {
    const { squares } = this.board;
    // Check if the player has won in any row or column or diagonal
    return (
      squares.some((row) => row.every((square) => square === playerId)) ||
      squares[0].some((_, i) => squares.every((row) => row[i] === playerId)) ||
      squares.every((_, i) => squares[i][i] === playerId) ||
      squares.every((_, i) => squares[i][2 - i] === playerId)
    );
  }

  play(row: number, col: number, player: Player["id"]): boolean {
    if (
      !this.isOver &&
      player === this.currentPlayerId &&
      !this.board.squares[row][col]
    ) {
      this.board.squares[row][col] = player;

      if (this.hasPlayerWon(player)) {
        this.isOver = true;
        return true;
      } else {
        this.currentPlayerId = this.getNextPlayer().id;
        return false;
      }
    }
    return false;
  }

  reset() {
    this.board.squares = this.board.squares.map((row) =>
      row.map(() => undefined)
    );
    this.currentPlayerId = this.players[0].id;
    this.isOver = false;
  }
}
