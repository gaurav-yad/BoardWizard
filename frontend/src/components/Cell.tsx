import { useEffect, useState } from "react";
import Board from "../Game/Board";
import redPlayer from "../assets/red.webp";
import bluePlayer from "../assets/blue.webp";
import greenPlayer from "../assets/green.webp";
import yellowPlayer from "../assets/yellow.webp";

//board size hardcoded, change later

const Cell = ({
   index,
   board,
   player,
   cellClicked,
   currPlayer
}: {
   index: number;
   board: Board;
   player: string;
   cellClicked: Function;
   currPlayer: string | null;
}) => {
   const playerImages: Record<string, string> = {
      r: redPlayer,
      b: bluePlayer,
      g: greenPlayer,
      y: yellowPlayer,
   };

   const [row, _setRow] = useState(Math.floor(index / 8));
   const [col, _setCol] = useState(index % 8);

   const [borderTop, setBorderTop] = useState(false);
   const [borderBottom, setBorderBottom] = useState(false);
   const [borderLeft, setBorderLeft] = useState(false);
   const [borderRight, setBorderRight] = useState(false);
   
   const inSameRow = (cell: number, nebr: number): boolean => {
      return Math.floor(cell / 8) === Math.floor(nebr / 8);
   };

   const directions = [-8, 8, -1, 1];

   
   useEffect(() => {
      for (const dir of directions) {
         const nebr = index + dir;
         if (nebr >= 0 && nebr < 64) {
            if (!board.canMove(index, nebr)) {
               if (dir === -8) { // UP direction in the original board
                  if (currPlayer === "r") { // Rotated 180°
                     setBorderBottom(true);
                  } else if (currPlayer === "b") { // Rotated 270° (Left becomes Up)
                     setBorderLeft(true);
                  } else if (currPlayer === "y") { // Rotated 90° (Right becomes Up)
                     setBorderRight(true);
                  } else { // Default
                     setBorderTop(true);
                  }
               } else if (dir === 8) { // DOWN direction in the original board
                  if (currPlayer === "r") { // Rotated 180°
                     setBorderTop(true);
                  } else if (currPlayer === "b") { // Rotated 270° (Left becomes Down)
                     setBorderRight(true);
                  } else if (currPlayer === "y") { // Rotated 90° (Right becomes Down)
                     setBorderLeft(true);
                  } else { // Default
                     setBorderBottom(true);
                  }
               } else if (dir === -1 && inSameRow(index, nebr)) { // LEFT direction in original board
                  if (currPlayer === "r") { // Rotated 180°
                     setBorderRight(true);
                  } else if (currPlayer === "b") { // Rotated 270° (Bottom becomes Left)
                     setBorderBottom(true);
                  } else if (currPlayer === "y") { // Rotated 90° (Top becomes Left)
                     setBorderTop(true);
                  } else { // Default
                     setBorderLeft(true);
                  }
               } else if (dir === 1 && inSameRow(index, nebr)) { // RIGHT direction in original board
                  if (currPlayer === "r") { // Rotated 180°
                     setBorderLeft(true);
                  } else if (currPlayer === "b") { // Rotated 270° (Top becomes Right)
                     setBorderTop(true);
                  } else if (currPlayer === "y") { // Rotated 90° (Bottom becomes Right)
                     setBorderBottom(true);
                  } else { // Default
                     setBorderRight(true);
                  }
               }
            }
         }
      }
   }, [board, index]);
   
   return (
      <div
         onClick={() => cellClicked(index)}
         className={`${ 
            (row + col) % 2 === 0 ? "bg-amber-900 text-white" : "bg-white"
         } w-22 h-22 flex justify-center items-center
         ${borderTop && "border-t-4 border-red-600"} ${
            borderBottom && "border-b-4 border-red-600"
         } ${borderLeft && "border-l-4 border-red-600"} ${
            borderRight && "border-r-4 border-red-600"
         } ${currPlayer === "r" ? "rotate-180" : currPlayer === "y" ? "rotate-270" : currPlayer === "b" ? "rotate-90" : ""}`}>
         {player && <img src={playerImages[player]} alt="" />}
      </div>
   );
};

export default Cell;
//${currPlayer === "r" ? "rotate-180" : currPlayer === "y" ? "rotate-270" : currPlayer === "b" ? "rotate-90" : ""}


