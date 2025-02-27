"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameManager = void 0;
const Events_1 = require("./Events");
const Game_1 = require("./Game");
const uuid_1 = require("uuid");
class GameManager {
    constructor() {
        this.games = new Map();
        this.pendingUsers = [];
    }
    listenSocket(playerSocket) {
        playerSocket.on("message", (message) => {
            // console.log("Message recieved: ", message.toString());
            const data = JSON.parse(message.toString());
            if (data.type === Events_1.INIT_GAME) {
                console.log("INIT_GAME message recieved");
                this.addPlayer(playerSocket);
            }
            else if (data.type === Events_1.MOVE) {
                const game = this.games.get(data.payload.gameId);
                if (!game) {
                    playerSocket.send(JSON.stringify({
                        type: Events_1.NOT_FOUND,
                        payload: "Game not found"
                    }));
                    return;
                }
                game.makeMove(playerSocket, data.payload.move);
            }
            else if (data.type === Events_1.PLACE_BLOCKER) {
                const game = this.games.get(data.payload.gameId);
                if (!game) {
                    playerSocket.send(JSON.stringify({
                        type: Events_1.NOT_FOUND,
                        payload: "Game not found"
                    }));
                    return;
                }
                game.placeBlocker(playerSocket, data.payload.blocker);
            }
        });
    }
    addPlayer(playerSocket) {
        this.pendingUsers.push(playerSocket);
        if (this.pendingUsers.length >= 4) {
            const players = [...this.pendingUsers];
            this.pendingUsers = [];
            //game board size hardcoded here, change this to make it dynamic later...
            const newGame = new Game_1.Game(players, (0, uuid_1.v4)(), 8);
            this.games.set(newGame.gameId, newGame);
        }
    }
    removePlayer(playerSocket) {
        this.pendingUsers = this.pendingUsers.filter(player => player !== playerSocket);
    }
}
exports.GameManager = GameManager;
