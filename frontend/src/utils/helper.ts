import { Player } from "../Game/Player";


let startPosAndTargets = Array.from({length: 4}, () => ({start: 0, targets: [0], color: ""}));

const generateTargets = (start: number, end : number, d : number) : number[] => {
    const targets = [];
    for(let idx = start; idx <= end; idx += d){
        targets.push(idx);
    }
    return targets;
}

const initializeStartPosAndTargets = (N: number) => {
    startPosAndTargets[0].start = N / 2;
    startPosAndTargets[0].targets = generateTargets(N * (N - 1), N * N - 1, 1);
    startPosAndTargets[0].color = "r";
    
    startPosAndTargets[1].start = N * (N - 1) + N / 2 - 1;
    startPosAndTargets[1].targets = generateTargets(0, N - 1, 1);
    startPosAndTargets[1].color = "g";
    
    startPosAndTargets[2].start = (N / 2 - 1) * N;
    startPosAndTargets[2].targets = generateTargets(N - 1, N * N - 1, N);
    startPosAndTargets[2].color = "b";
    
    startPosAndTargets[3].start = N * N / 2 + N - 1;
    startPosAndTargets[3].targets = generateTargets(0, N * (N - 1), N);
    startPosAndTargets[3].color = "y";
}

export const getInitialisedPlayers = (N: number) : Player[] => {
    initializeStartPosAndTargets(N);
    return startPosAndTargets.map(metaData => new Player(metaData));
}
