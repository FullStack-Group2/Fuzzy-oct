// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author: 
// ID: 

// @ts-ignore
import brokenChair from "../../assets/icon/broken-chair.png";

import { useNavigate } from "react-router-dom";


const NotFound = () => {    const navigate = useNavigate();

  return (
    <div className="flex flex-col justify-center items-center py-20">
      <div className="absolute top-0 left-0 w-full h-[80px] bg-[#1E7A5A] shadow-md"></div>

      <div className="flex items-center justify-center bg-white relative">
        
        <div className="relative w-[300px] h-[300px] flex items-center justify-center">
          
          <span className="absolute text-[300px] font-bold text-gray-200 opacity-40 select-none z-0 leading-none">
            404
          </span>

          <img
            src={brokenChair}
            alt="Broken Chair"
            className="relative top-6 z-10  scale-150"
          />
        </div>
      </div>

      <span className="text-2xl md:text-3xl font-bold text-gray-900 mt-2 relative ">
        Page not found
      </span>

      <p className="text-gray-500 text-sm md:text-base mt-2 text-center max-w-[300px] md:max-w-md relative">
        Sorry, but the page that you requested doesn't exist.
      </p>

      <button 
              onClick={() => navigate("/")}

      className="mt-6 bg-[#1E7A5A] hover:bg-[#238462] text-white font-semibold py-2 px-6 rounded-full shadow-md transition-all duration-300 relative">
        Back to home →
      </button>
    </div>
  );
};

export default NotFound;
