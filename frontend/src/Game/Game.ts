import Board from "./Board";
import { Player } from "./Player";

export class Game{
    public players: Player[];
    public board: Board;
    public turnIndex: number;
    public isOver: boolean;
    public winner: Player | null;
    public gameId: string;
    private startPosAndTargets: {start: number, targets: number[], color: string}[];
    
    constructor(gameId: string, size: number){
        this.players = []; 
        this.board = new Board(size);
        this.turnIndex = 0;
        this.isOver = false;
        this.gameId = gameId;
        this.winner = null;
        
        //initialize player starting positions and targets for the given board size
        this.startPosAndTargets = Array.from({length: 4}, () => ({start: 0, targets: [], color: ""}));
        this.initializeStartPosAndTargets(size);

        for(let index = 0; index < 4; index++){
            this.players.push(new Player(this.startPosAndTargets[index]));
        }
    }

    public makeMove(playerColor: string, move: {from: number, to: number}){
        if(this.isOver){
            console.log("Game is already over");
            return;
        }

        const player = this.players[this.turnIndex];

        if(player.color !== playerColor || player.position !== move.from){
            console.log("Its not this player turn");
            return;
        }

        if(!this.board.canMove(move.from, move.to)){
            console.log("Invalid move");
            return;
        }

        player.position = move.to;
        
        //game over conidtion
        if(player.targets.has(player.position)){
            this.isOver = true;
            this.winner = player;
        }

        this.turnIndex = (this.turnIndex + 1) % this.players.length;
    }

    public placeBlocker(playerColor: string, blocker: {rmvEdge1 : {from: number, to: number}, rmvEdge2 : {from: number, to: number}}){
        if(this.isOver){
            console.log("Game is already over");
            return;
        }

        const player = this.players[this.turnIndex];

        if(player.color !== playerColor){
            console.log("Its not this player turn");
            return;
        }

        if(!this.board.placeBlocker(blocker)){
            console.log("Invalid blocker placement");
            return;
        }

        this.turnIndex = (this.turnIndex + 1) % this.players.length;
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