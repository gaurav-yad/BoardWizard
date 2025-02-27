
export class Player{
    public position: number;
    public targets: Set<number>;
    public color : string;  //r, b, g, y

    constructor( metaData : {start: number, targets: number[], color: string}){
        this.position = metaData.start;
        this.color = metaData.color;
        this.targets = new Set(metaData.targets);
    }
}