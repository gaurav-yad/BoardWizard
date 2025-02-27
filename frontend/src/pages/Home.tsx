import { useNavigate } from "react-router-dom";

export const Home = () => {
   const navigate = useNavigate();
   return (
      <div>
         <h1>Home Page</h1>
         <button
            className="bg-green-500 py-2 px-4 rounded-lg cursor-pointer"
            onClick={() => navigate("/game")}>
            Play game
         </button>
      </div>
   );
};
