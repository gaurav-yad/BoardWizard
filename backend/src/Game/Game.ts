import { WebSocket } from "ws";
import Board from "./Board";
import { ERROR, GAME_OVER, INIT_GAME, MOVE, PLACE_BLOCKER } from "./Events";
import { Player } from "./Player";

export class Game{
    public players: Player[];
    public board: Board;
    public turnIndex: number;
    public isOver: boolean;
    public winner: Player | null;
    public gameId: string;
    private startPosAndTargets: {start: number, targets: number[], color: string}[];
    
    constructor(playerWs: WebSocket[], gameId: string, size: number){
        this.players = []; 
        this.board = new Board(size);
        this.turnIndex = 0;
        this.isOver = false;
        this.gameId = gameId;
        this.winner = null;
        
        //initialize player starting positions and targets for the given board size
        this.startPosAndTargets = Array.from({length: 4}, () => ({start: 0, targets: [], color: ""}));
        this.initializeStartPosAndTargets(size);

        //initialize players with their starting positions and targets
        playerWs.forEach((socket, index) => {
            this.players.push(new Player(socket, this.startPosAndTargets[index]));
        });

        //inform players about game initialization and meta data related to them
        this.players.forEach(player => {
            player.socket.send(JSON.stringify({
                type: INIT_GAME,
                payload: {
                    gameId: this.gameId,
                    isOver: this.isOver,
                    winner: this.winner,
                    color: player.color,
                }
            }));
        })

    }

    public getBoardState(){
        return this.board.getBoardState();
    }

    public makeMove(socket: WebSocket, move: {from: number, to: number}){
        if(this.isOver){
            socket.send(JSON.stringify({
                type: ERROR,
                payload: {
                    gameId: this.gameId,
                    message: "Game is already over",
                }
            }));
            return;
        }

        const player = this.players[this.turnIndex];

        if(player.socket !== socket || player.position !== move.from){
            socket.send(JSON.stringify({
                type: ERROR,
                payload: {
                    gameId: this.gameId,
                    message: "It's not your turn",
                }
            }));
            return;
        }

        if(!this.board.canMove(move.from, move.to)){
            socket.send(JSON.stringify({
                type: ERROR,
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
            if(playr.socket !== socket){
                playr.socket.send(JSON.stringify({
                    type: MOVE,
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
        if(player.targets.has(player.position)){
            this.isOver = true;
            this.winner = player;

            this.players.forEach(playr => {
                playr.socket.send(JSON.stringify({
                    type: GAME_OVER,
                    payload: {
                        gameId: this.gameId,
                        isOver: this.isOver,
                        winner: this.winner?.color,
                    }
                }));
            });
        }

        
    }

    public placeBlocker(socket: WebSocket, blocker: {rmvEdge1 : {from: number, to: number}, rmvEdge2 : {from: number, to: number}}){
        if(this.isOver){
            socket.send(JSON.stringify({
                type: ERROR,
                payload: {
                    gameId: this.gameId,
                    message: "Game is already over",
                }
            }));
            return;
        }

        const player = this.players[this.turnIndex];

        if(player.socket !== socket){
            socket.send(JSON.stringify({
                type: ERROR,
                payload: {
                    gameId: this.gameId,
                    message: "It's not your turn",
                }
            }));
            return;
        }

        if(!this.board.placeBlocker(blocker, player.position)){
            socket.send(JSON.stringify({
                type: ERROR,
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
            if(plyr.socket !== socket){
                plyr.socket.send(JSON.stringify({
                    type: PLACE_BLOCKER,
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

    private generateTargets(start: number, end : number, d : number) : number[]{
        const targets = [];
        for(let idx = start; idx <= end; idx += d){
            targets.push(idx);
        }
        return targets;
    }

    private initializeStartPosAndTargets(N: number){
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