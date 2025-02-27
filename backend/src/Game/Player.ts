import { WebSocket } from "ws";

export class Player{
    public socket: WebSocket;
    public position: number;
    public targets: Set<number>;
    public color : string;  //r, b, g, y

    constructor(socket: WebSocket, metaData : {start: number, targets: number[], color: string}){
        this.socket = socket;
        this.position = metaData.start;
        this.color = metaData.color;
        this.targets = new Set(metaData.targets);
    }
}