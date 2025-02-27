"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Board {
    constructor(size, board, bridges) {
        if (size <= 0 || size % 2 !== 0) {
            throw new Error("Board size must be a positive even number.");
        }
        this.size = size;
        this.adjList = Array.from({ length: size * size }, () => new Set());
        this.bridges = Array.from({ length: size * size }, () => new Set());
        if (board && bridges) {
            for (const [node, neighbors] of Object.entries(board)) {
                this.adjList[parseInt(node)] = new Set(neighbors);
            }
            for (const [node, neighbors] of Object.entries(bridges)) {
                this.bridges[parseInt(node)] = new Set(neighbors);
            }
        }
        else {
            this.initializeEdges();
        }
    }
    initializeEdges() {
        for (let rowStart = 0; rowStart < this.size * this.size; rowStart += this.size) {
            for (let curr = rowStart; curr < rowStart + this.size; curr++) {
                if (curr + 1 < rowStart + this.size)
                    this.adjList[curr].add(curr + 1);
                if (curr - 1 >= rowStart)
                    this.adjList[curr].add(curr - 1);
                if (curr + this.size < this.size * this.size)
                    this.adjList[curr].add(curr + this.size);
                if (curr - this.size >= 0)
                    this.adjList[curr].add(curr - this.size);
            }
        }
    }
    findBridges(disc, low, visited, curr, parent, time) {
        disc[curr] = low[curr] = time.value++;
        visited[curr] = true;
        for (const nebr of this.adjList[curr]) {
            if (nebr === parent)
                continue;
            if (visited[nebr]) {
                // Back edge
                low[curr] = Math.min(low[curr], disc[nebr]);
            }
            else {
                this.findBridges(disc, low, visited, nebr, curr, time);
                low[curr] = Math.min(low[curr], low[nebr]);
                if (low[nebr] > disc[curr]) {
                    this.bridges[curr].add(nebr);
                }
            }
        }
    }
    findBridgesUtil() {
        const n = this.size * this.size;
        const visited = new Array(n).fill(false);
        const low = new Array(n).fill(-1);
        const disc = new Array(n).fill(-1);
        let time = { value: 0 };
        for (let i = 0; i < n; i++) {
            if (!visited[i]) {
                this.findBridges(disc, low, visited, i, -1, time);
            }
        }
    }
    isValidNode(node) {
        return node >= 0 && node < this.size * this.size;
    }
    canRemoveEdge(u, v) {
        if (!this.isValidNode(u) || !this.isValidNode(v))
            return false;
        if (!this.adjList[u].has(v) || !this.adjList[v].has(u))
            return false;
        return !this.bridges[u].has(v) && !this.bridges[v].has(u);
    }
    placeBlocker(blocker, playerPos) {
        const { rmvEdge1, rmvEdge2 } = blocker;
        //in case any of the node is invalid
        if (!this.isValidNode(rmvEdge1.from) ||
            !this.isValidNode(rmvEdge1.to) ||
            !this.isValidNode(rmvEdge2.from) ||
            !this.isValidNode(rmvEdge2.to) ||
            !this.isValidNode(playerPos)) {
            return false;
        }
        if (!this.isValidBlocker(blocker, playerPos)) {
            return false;
        }
        //if either of the edges can't be removed
        if (!this.canRemoveEdge(rmvEdge1.from, rmvEdge1.to) ||
            !this.canRemoveEdge(rmvEdge2.from, rmvEdge2.to)) {
            return false;
        }
        this.adjList[rmvEdge1.from].delete(rmvEdge1.to);
        this.adjList[rmvEdge1.to].delete(rmvEdge1.from);
        this.adjList[rmvEdge2.from].delete(rmvEdge2.to);
        this.adjList[rmvEdge2.to].delete(rmvEdge2.from);
        this.findBridgesUtil();
        return true;
    }
    isValidBlocker(blocker, playerPos) {
        const validBlockers = this.getValidBlockers(playerPos); // Get all possible valid blockers
        // Check if any valid blocker matches the given one
        return validBlockers.some((valid) => (valid.rmvEdge1.from === blocker.rmvEdge1.from &&
            valid.rmvEdge1.to === blocker.rmvEdge1.to &&
            valid.rmvEdge2.from === blocker.rmvEdge2.from &&
            valid.rmvEdge2.to === blocker.rmvEdge2.to) ||
            (valid.rmvEdge1.from === blocker.rmvEdge2.from &&
                valid.rmvEdge1.to === blocker.rmvEdge2.to &&
                valid.rmvEdge2.from === blocker.rmvEdge1.from &&
                valid.rmvEdge2.to === blocker.rmvEdge1.to));
    }
    getValidBlockers(playerPos) {
        const validBlockers = [];
        //valid blockers are:
        //(i, i + 1) and (i + size, i + size + 1)
        validBlockers.push({
            rmvEdge1: { from: playerPos, to: playerPos + 1 },
            rmvEdge2: {
                from: playerPos + this.size,
                to: playerPos + this.size + 1,
            },
        });
        //(i, i - 1) and (i + size, i + size - 1)
        validBlockers.push({
            rmvEdge1: { from: playerPos, to: playerPos - 1 },
            rmvEdge2: {
                from: playerPos + this.size,
                to: playerPos + this.size - 1,
            },
        });
        //(i, i + size) and (i + 1, i + size + 1)
        validBlockers.push({
            rmvEdge1: { from: playerPos, to: playerPos + this.size },
            rmvEdge2: {
                from: playerPos + 1,
                to: playerPos + this.size + 1,
            },
        });
        //(i, i + size) and (i - 1, i + size - 1)
        validBlockers.push({
            rmvEdge1: { from: playerPos, to: playerPos + this.size },
            rmvEdge2: {
                from: playerPos - 1,
                to: playerPos + this.size - 1,
            },
        });
        //(i, i + 1) and (i - size, i - size + 1)
        validBlockers.push({
            rmvEdge1: { from: playerPos, to: playerPos + 1 },
            rmvEdge2: {
                from: playerPos - this.size,
                to: playerPos - this.size + 1,
            },
        });
        //(i, i - 1) and (i - size, i - size - 1)
        validBlockers.push({
            rmvEdge1: { from: playerPos, to: playerPos - 1 },
            rmvEdge2: {
                from: playerPos - this.size,
                to: playerPos - this.size - 1,
            },
        });
        //(i, i - size) and (i + 1, i - size + 1)
        validBlockers.push({
            rmvEdge1: { from: playerPos, to: playerPos - this.size },
            rmvEdge2: {
                from: playerPos + 1,
                to: playerPos - this.size + 1,
            },
        });
        //(i, i - size) and (i - 1, i - size - 1)
        validBlockers.push({
            rmvEdge1: { from: playerPos, to: playerPos - this.size },
            rmvEdge2: {
                from: playerPos - 1,
                to: playerPos - this.size - 1,
            },
        });
        return validBlockers;
    }
    canMove(u, v) {
        return (this.isValidNode(u) &&
            this.isValidNode(v) &&
            this.adjList[u].has(v) &&
            this.adjList[v].has(u));
    }
    getBoardState() {
        return {
            size: this.size,
            board: Object.fromEntries(this.adjList.map((neighbors, node) => [node, Array.from(neighbors)])),
            bridges: Object.fromEntries(this.bridges.map((neighbors, node) => [node, Array.from(neighbors)])),
        };
    }
}
exports.default = Board;
