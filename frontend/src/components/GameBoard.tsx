import { useState } from "react";
import Board from "../Game/Board";
import '@ant-design/v5-patch-for-react-19';
import Cell from "./Cell";
import { Player } from "../Game/Player";
import { MOVE, PLACE_BLOCKER } from "../Game/Events";
import { message } from "antd";

export const GameBoard = ({
   blockerReq,
   setBlockerReq,
   board,
   setBoard,
   players,
   setPlayers,
   turn,
   currPlayer,
   socket,
   gameId
}: {
   blockerReq: boolean;
   setBlockerReq: Function;
   board: Board;
   setBoard: Function;
   players: Player[];
   setPlayers: Function;
   turn: string | null;
   currPlayer: string | null;
   socket: WebSocket;
   gameId: string | null
}) => {
   const [from, setFrom] = useState<number | null>(null);
   const [blocker, setBlocker] = useState({
      rmvEdge1: { from: -1, to: -1 },
      rmvEdge2: { from: -1, to: -1 },
   });

   const makeBlocker = (
      blocker: {
         rmvEdge1: { from: number; to: number };
         rmvEdge2: { from: number; to: number };
      },
      playerPos: number
   ) => {
      const newBoard = new Board(8, board.getBoardState().board, board.getBoardState().bridges);

      if (newBoard.placeBlocker(blocker, playerPos)) {
         socket.send(
            JSON.stringify({
               type: PLACE_BLOCKER,
               payload: {
                  gameId: gameId,
                  blocker: blocker,
               },
            })
         )
         setBoard(newBoard);
      } else {
         message.error("Invalid Blocker placement");
      }
   };

   const cellHasPlayer = (index: number): string => {
      for (const player of players) {
         if (player.position === index) {
            return player.color;
         }
      }
      return "";
   };

   const updatePlayerPosition = (
      playerColor: string,
      from: number,
      to: number
   ) => {
      if (!board.canMove(from, to)) {
         message.error("Invalid move");
         return;
      }

      const newPlayers = players.map((player) => {
         if (player.color === playerColor) {
            player.position = to;
         }
         return player;
      });

      socket.send(JSON.stringify({
         type: MOVE,
         payload: {
            gameId: gameId,
            move: {
               from: from,
               to: to,
            }
         }
      }))

      setPlayers(newPlayers);
   };

   const cellClicked = (index: number) => {
      console.log(board.getBoardState());
      if (turn !== currPlayer) {
         message.error("Not your turn");
         return;
      }

      if (blockerReq) {
         const currPlayerPosition = players.find(
            (player) => player.color === currPlayer
         )!.position;

         if (blocker.rmvEdge1.to === -1) {
            setBlocker({
               ...blocker,
               rmvEdge1: { from: currPlayerPosition, to: index },
            });
         } else if (blocker.rmvEdge2.from === -1) {
            setBlocker({
               ...blocker,
               rmvEdge2: { from: index, to: -1 },
            });
         } else if (blocker.rmvEdge2.to === -1) {
            makeBlocker(
               {
                  ...blocker,
                  rmvEdge2: { ...blocker.rmvEdge2, to: index },
               },
               currPlayerPosition
            );
            setBlockerReq(false);
            setBlocker({
               rmvEdge1: { from: -1, to: -1 },
               rmvEdge2: { from: -1, to: -1 },
            });
         }

         return;
      }

      if (from === null) {
         if(cellHasPlayer(index) !== currPlayer) {
            message.error("Not your piece");
            return;
         }
         setFrom(index);
      } else {
         if (cellHasPlayer(index) || !board.canMove(from, index)) {
            message.error("Invalid move");
            setFrom(null);
            return;
         } 
         updatePlayerPosition(currPlayer!, from, index);
         setFrom(null);
      }
   };

   return (
      <div className={`grid grid-cols-8 w-[44rem] ${currPlayer === "r" ? "rotate-180" : currPlayer === "y" ? "rotate-90" : currPlayer === "b" ? "rotate-270" : ""}
`}>
         {Array.from({ length: 64 }, (_, i) => {
            return (
               <Cell
                  key={i}
                  index={i}
                  board={board}
                  player={cellHasPlayer(i)}
                  cellClicked={cellClicked}
                  currPlayer={currPlayer}
               />
            );
         })}
      </div>
   );
};

//${currPlayer === "r" ? "rotate-180" : currPlayer === "y" ? "rotate-90" : currPlayer === "b" ? "rotate-270" : ""}
