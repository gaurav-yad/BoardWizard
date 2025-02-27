"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
const Board_1 = __importDefault(require("./Board"));
const Events_1 = require("./Events");
const Player_1 = require("./Player");
class Game {
    constructor(playerWs, gameId, size) {
        this.players = [];
        this.board = new Board_1.default(size);
        this.turnIndex = 0;
        this.isOver = false;
        this.gameId = gameId;
        this.winner = null;
        //initialize player starting positions and targets for the given board size
        this.startPosAndTargets = Array.from({ length: 4 }, () => ({ start: 0, targets: [], color: "" }));
        this.initializeStartPosAndTargets(size);
        //initialize players with their starting positions and targets
        playerWs.forEach((socket, index) => {
            this.players.push(new Player_1.Player(socket, this.startPosAndTargets[index]));
        });
        //inform players about game initialization and meta data related to them
        this.players.forEach(player => {
            player.socket.send(JSON.stringify({
                type: Events_1.INIT_GAME,
                payload: {
                    gameId: this.gameId,
                    isOver: this.isOver,
                    winner: this.winner,
                    color: player.color,
                }
            }));
        });
    }
    getBoardState() {
        return this.board.getBoardState();
    }
    makeMove(socket, move) {
        if (this.isOver) {
            socket.send(JSON.stringify({
                type: Events_1.ERROR,
                payload: {
                    gameId: this.gameId,
                    message: "Game is already over",
                }
            }));
            return;
        }
        const player = this.players[this.turnIndex];
        if (player.socket !== socket || player.position !== move.from) {
            socket.send(JSON.stringify({
                type: Events_1.ERROR,
                payload: {
                    gameId: this.gameId,
                    message: "It's not your turn",
                }
            }));
            return;
        }
        if (!this.board.canMove(move.from, move.to)) {
            socket.send(JSON.stringify({
                type: Events_1.ERROR,
                payload: {
                    gameId: this.gameId,
                    message: "Invalid move",
                }
            }));
            return;
        }
        player.position = move.to;
        this.turnIndex = (this.turnIndex + 1) % this.players.length;
        //inform all other players about the move
        this.players.forEach(playr => {
            if (playr.socket !== socket) {
                playr.socket.send(JSON.stringify({
                    type: Events_1.MOVE,
                    payload: {
                        gameId: this.gameId,
                        playerColor: player.color,
                        move: move,
                        turn: this.players[this.turnIndex].color,
                    }
                }));
            }
        });
        //game over conidtion
        if (player.targets.has(player.position)) {
            this.isOver = true;
            this.winner = player;
            this.players.forEach(playr => {
                var _a;
                playr.socket.send(JSON.stringify({
                    type: Events_1.GAME_OVER,
                    payload: {
                        gameId: this.gameId,
                        isOver: this.isOver,
                        winner: (_a = this.winner) === null || _a === void 0 ? void 0 : _a.color,
                    }
                }));
            });
        }
    }
    placeBlocker(socket, blocker) {
        if (this.isOver) {
            socket.send(JSON.stringify({
                type: Events_1.ERROR,
                payload: {
                    gameId: this.gameId,
                    message: "Game is already over",
                }
            }));
            return;
        }
        const player = this.players[this.turnIndex];
        if (player.socket !== socket) {
            socket.send(JSON.stringify({
                type: Events_1.ERROR,
                payload: {
                    gameId: this.gameId,
                    message: "It's not your turn",
                }
            }));
            return;
        }
        if (!this.board.placeBlocker(blocker, player.position)) {
            socket.send(JSON.stringify({
                type: Events_1.ERROR,
                payload: {
                    gameId: this.gameId,
                    message: "Invalid blocker placement",
                }
            }));
            return;
        }
        this.turnIndex = (this.turnIndex + 1) % this.players.length;
        //inform all other players about the blocker placement
        this.players.forEach(plyr => {
            if (plyr.socket !== socket) {
                plyr.socket.send(JSON.stringify({
                    type: Events_1.PLACE_BLOCKER,
                    payload: {
                        gameId: this.gameId,
                        blocker: blocker,
                        turn: this.players[this.turnIndex].color,
                        playerColor: player.color,
                    }
                }));
            }
        });
    }
    generateTargets(start, end, d) {
        const targets = [];
        for (let idx = start; idx <= end; idx += d) {
            targets.push(idx);
        }
        return targets;
    }
    initializeStartPosAndTargets(N) {
        this.startPosAndTargets[0].start = N / 2;
        this.startPosAndTargets[0].targets = this.generateTargets(N * (N - 1), N * N - 1, 1);
        this.startPosAndTargets[0].color = "r";
        this.startPosAndTargets[1].start = N * (N - 1) + N / 2 - 1;
        this.startPosAndTargets[1].targets = this.generateTargets(0, N - 1, 1);
        this.startPosAndTargets[1].color = "g";
        this.startPosAndTargets[2].start = (N / 2 - 1) * N;
        this.startPosAndTargets[2].targets = this.generateTargets(N - 1, N * N - 1, N);
        this.startPosAndTargets[2].color = "b";
        this.startPosAndTargets[3].start = N * N / 2 + N - 1;
        this.startPosAndTargets[3].targets = this.generateTargets(0, N * (N - 1), N);
        this.startPosAndTargets[3].color = "y";
    }
}
exports.Game = Game;
