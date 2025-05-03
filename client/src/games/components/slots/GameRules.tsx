import React from 'react';

// Slot game rules component
const GameRules: React.FC = () => {
  return (
    <div className="bg-[#172B3A] p-4 rounded-lg border border-[#243442] text-gray-300 text-sm">
      <h3 className="text-white font-bold text-lg mb-3">Slots Game Rules</h3>
      
      <div className="space-y-4">
        <p>
          Slots is a game of chance where three reels spin and stop on random numbers. 
          Place your bet and spin the reels to win!
        </p>
        
        <div className="my-4">
          <h4 className="text-white font-bold mb-2">Winning Combinations:</h4>
          <ul className="space-y-3">
            <li className="flex items-center justify-between border-b border-[#243442] pb-2">
              <div className="flex space-x-1">
                <div className="w-8 h-8 flex items-center justify-center bg-[#243442] rounded font-bold text-white">7</div>
                <div className="w-8 h-8 flex items-center justify-center bg-[#243442] rounded font-bold text-white">7</div>
                <div className="w-8 h-8 flex items-center justify-center bg-[#243442] rounded font-bold text-white">7</div>
              </div>
              <div className="text-green-400 font-bold">10x</div>
            </li>
            
            <li className="flex items-center justify-between border-b border-[#243442] pb-2">
              <div className="flex space-x-1">
                <div className="w-8 h-8 flex items-center justify-center bg-[#243442] rounded font-bold text-white">Any</div>
                <div className="w-8 h-8 flex items-center justify-center bg-[#243442] rounded font-bold text-white">Same</div>
                <div className="w-8 h-8 flex items-center justify-center bg-[#243442] rounded font-bold text-white">Number</div>
              </div>
              <div className="text-green-400 font-bold">5x</div>
            </li>
            
            <li className="flex items-center justify-between border-b border-[#243442] pb-2">
              <div className="flex space-x-1">
                <div className="w-8 h-8 flex items-center justify-center bg-[#243442] rounded font-bold text-white">Sequential</div>
              </div>
              <div className="text-green-400 font-bold">3x</div>
            </li>
            
            <li className="flex items-center justify-between border-b border-[#243442] pb-2">
              <div className="flex space-x-1">
                <div className="w-8 h-8 flex items-center justify-center bg-[#243442] rounded font-bold text-white">Two</div>
                <div className="w-8 h-8 flex items-center justify-center bg-[#243442] rounded font-bold text-white">Same</div>
              </div>
              <div className="text-green-400 font-bold">2x</div>
            </li>
          </ul>
        </div>
        
        <div>
          <h4 className="text-white font-bold mb-2">Examples:</h4>
          <ul className="space-y-3">
            <li className="flex items-center space-x-3">
              <div className="flex space-x-1">
                <div className="w-8 h-8 flex items-center justify-center bg-[#243442] rounded font-bold text-white">7</div>
                <div className="w-8 h-8 flex items-center justify-center bg-[#243442] rounded font-bold text-white">7</div>
                <div className="w-8 h-8 flex items-center justify-center bg-[#243442] rounded font-bold text-white">7</div>
              </div>
              <span>Three 7s - 10x multiplier</span>
            </li>
            
            <li className="flex items-center space-x-3">
              <div className="flex space-x-1">
                <div className="w-8 h-8 flex items-center justify-center bg-[#243442] rounded font-bold text-white">5</div>
                <div className="w-8 h-8 flex items-center justify-center bg-[#243442] rounded font-bold text-white">5</div>
                <div className="w-8 h-8 flex items-center justify-center bg-[#243442] rounded font-bold text-white">5</div>
              </div>
              <span>Three of any same number - 5x multiplier</span>
            </li>
            
            <li className="flex items-center space-x-3">
              <div className="flex space-x-1">
                <div className="w-8 h-8 flex items-center justify-center bg-[#243442] rounded font-bold text-white">3</div>
                <div className="w-8 h-8 flex items-center justify-center bg-[#243442] rounded font-bold text-white">4</div>
                <div className="w-8 h-8 flex items-center justify-center bg-[#243442] rounded font-bold text-white">5</div>
              </div>
              <span>Sequential numbers - 3x multiplier</span>
            </li>
            
            <li className="flex items-center space-x-3">
              <div className="flex space-x-1">
                <div className="w-8 h-8 flex items-center justify-center bg-[#243442] rounded font-bold text-white">2</div>
                <div className="w-8 h-8 flex items-center justify-center bg-[#243442] rounded font-bold text-white">2</div>
                <div className="w-8 h-8 flex items-center justify-center bg-[#243442] rounded font-bold text-white">8</div>
              </div>
              <span>Two same numbers - 2x multiplier</span>
            </li>
          </ul>
        </div>
        
        <div className="pt-2">
          <h4 className="text-white font-bold mb-2">How to Play:</h4>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Set your bet amount</li>
            <li>Click the SPIN button to start the game</li>
            <li>Wait for all three reels to stop</li>
            <li>If you get a winning combination, your bet will be multiplied accordingly</li>
            <li>Use Auto Spin to continuously play without clicking each time</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default GameRules;