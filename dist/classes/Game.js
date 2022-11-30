"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
class Game {
    constructor(players, id) {
        this.isOver = false;
        this.id = id;
        this.players = players;
        this.currentPlayerId = players[0];
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
    getPlayerCharacter(playerId) {
        return this.players.indexOf(playerId) === 0 ? "X" : "O";
    }
    getNextPlayer() {
        const currentIndex = this.players.findIndex((player) => player === this.currentPlayerId);
        return this.players[(currentIndex + 1) % this.players.length];
    }
    hasPlayerWon(playerId) {
        const { squares } = this.board;
        // Check if the player has won in any row or column or diagonal
        return (squares.some((row) => row.every((square) => square === playerId)) ||
            squares[0].some((_, i) => squares.every((row) => row[i] === playerId)) ||
            squares.every((_, i) => squares[i][i] === playerId) ||
            squares.every((_, i) => squares[i][2 - i] === playerId));
    }
    play(row, col, player) {
        if (!this.isOver && player === this.currentPlayerId) {
            console.log(player, this.currentPlayerId);
            this.board.squares[row][col] = player;
            if (this.hasPlayerWon(player)) {
                console.log(`${player} has won!`);
                this.currentPlayerId = undefined;
                this.isOver = true;
                this.board.squares = this.board.squares.map((row) => row.map(() => undefined));
            }
            else {
                this.currentPlayerId = this.getNextPlayer();
            }
        }
        return false;
    }
}
exports.Game = Game;
