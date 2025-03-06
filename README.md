# 🏆 BoardWizard

**BoardWizard** is a strategy-based board game where players can navigate a grid-based board represented as a graph and strategically place blockers to alter paths. 

## 🚀 Features
- **Graph-Based Board:** The board is represented as an `n × n` graph, where each node connects to adjacent nodes (left, right, up, down).
- **Player Movement:** Players can move across connected nodes on the board.
- **Strategic Blocking:** A player standing at a position can place a blocker that removes two edges, following specific game rules.
- **Valid Blocker Mechanism:** Blockers must align horizontally or vertically and follow adjacency constraints.

## 🎮 How to Play
1. The game initializes an `n × n` board where each node is connected to its valid adjacent neighbors.
2. Players can move to connected nodes.
3. Players can place blockers at their current position, removing two edges in a valid manner.
4. The goal is to strategically place blockers to control movement and outmaneuver opponents.

## 🛠️ Installation & Setup
1. **Clone the Repository**
   ```sh
   git clone https://github.com/gaurav-yad/BoardWizard.git
   cd BoardWizard
2. **Instal dependencies**
   ```sh
   cd frontend
   npm i
   ```
   ```
   cd backend
   npm i
   ```
3. **Run the project**

   
   _Run Server_
   ```sh
   cd backend
   node dist/index.js
   ```
   _Run Client_
   ```
   cd frontend
   npm run dev
   ```
