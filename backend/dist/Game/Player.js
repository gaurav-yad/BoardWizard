"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Player = void 0;
class Player {
    constructor(socket, metaData) {
        this.socket = socket;
        this.position = metaData.start;
        this.color = metaData.color;
        this.targets = new Set(metaData.targets);
    }
}
exports.Player = Player;
