import React, { useState, useEffect } from 'react';
import { formatCrypto } from '@/lib/utils';
import GameLayout, { GameControls, GameTabs } from '@/components/games/GameLayout';
import { Button } from '@/components/ui/button';
import { useProvablyFair } from '@/hooks/use-provably-fair';
import { useBalance } from '@/hooks/use-balance';

const SUITS = ['♠️', '♥️', '♦️', '♣️'];
const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

// Convert card index to rank and suit
const getCardDetails = (cardIndex: number) => {
  const suit = Math.floor(cardIndex / 13);
  const rank = cardIndex % 13;
  return {
    suit: SUITS[suit],
    rank: RANKS[rank],
    value: rank,
    color: (suit === 0 || suit === 3) ? 'text-black' : 'text-red-500'
  };
};

const HiloGame = () => {
  const { getGameResult } = useProvablyFair('hilo');
  const { balance, placeBet } = useBalance();
  
  const [betAmount, setBetAmount] = useState('0.00000001');
  const [gameActive, setGameActive] = useState(false);
  const [currentCard, setCurrentCard] = useState<number | null>(null);
  const [nextCard, setNextCard] = useState<number | null>(null);
  const [prediction, setPrediction] = useState<'higher' | 'lower' | null>(null);
  const [currentMultiplier, setCurrentMultiplier] = useState(1.00);
  const [profit, setProfit] = useState('0.00000000');
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [round, setRound] = useState(0);
  
  // Update profit calculation when betAmount or multiplier changes
  useEffect(() => {
    const amount = parseFloat(betAmount) || 0;
    const profitValue = amount * (currentMultiplier - 1);
    setProfit(formatCrypto(profitValue));
  }, [betAmount, currentMultiplier]);
  
  const handleBetAmountChange = (value: string) => {
    if (gameActive) return;
    setBetAmount(value);
  };
  
  const handleHalfBet = () => {
    if (gameActive) return;
    const amount = parseFloat(betAmount) || 0;
    setBetAmount(formatCrypto(amount / 2));
  };
  
  const handleDoubleBet = () => {
    if (gameActive) return;
    const amount = parseFloat(betAmount) || 0;
    setBetAmount(formatCrypto(amount * 2));
  };
  
  const startGame = () => {
    if (gameActive) return;
    
    // Reset game state
    setGameActive(true);
    setGameOver(false);
    setWon(false);
    setPrediction(null);
    setNextCard(null);
    setCurrentMultiplier(1.00);
    setRound(0);
    
    // Deal initial card (0-51)
    const initialCard = Math.floor(Math.random() * 52);
    setCurrentCard(initialCard);
    
    // In a real app, this would call the API to place a bet
    // placeBet.mutate({
    //   amount: parseFloat(betAmount),
    //   gameId: 9, // Hilo game id
    //   clientSeed: 'seed',
    //   options: {}
    // });
  };
  
  const calculateMultiplier = (currentCardRank: number, predictionType: 'higher' | 'lower') => {
    // Calculate how many cards would win
    let winningCards = 0;
    if (predictionType === 'higher') {
      // Cards higher than current rank
      winningCards = 52 - ((currentCardRank + 1) * 4);
    } else {
      // Cards lower than current rank
      winningCards = currentCardRank * 4;
    }
    
    // Return multiplier based on probability (52 total cards, 4 of each rank)
    // Example: predicting higher on a 2 is 48/52 = 92.3% chance, so multiplier is low
    // Adjust for house edge (99% RTP)
    return parseFloat(((52 / winningCards) * 0.99).toFixed(2));
  };
  
  const makePrediction = async (predictionType: 'higher' | 'lower') => {
    if (!gameActive || gameOver || !currentCard) return;
    
    setPrediction(predictionType);
    
    // Deal next card
    let nextCardValue;
    do {
      nextCardValue = Math.floor(Math.random() * 52);
    } while (nextCardValue === currentCard);
    
    setNextCard(nextCardValue);
    
    // Get card ranks
    const currentCardDetails = getCardDetails(currentCard);
    const nextCardDetails = getCardDetails(nextCardValue);
    
    // Check if prediction was correct
    const isCorrect = predictionType === 'higher' 
      ? nextCardDetails.value > currentCardDetails.value
      : nextCardDetails.value < currentCardDetails.value;
    
    if (isCorrect) {
      // Win - increase multiplier
      const newMultiplier = calculateMultiplier(currentCardDetails.value, predictionType);
      const updatedMultiplier = currentMultiplier * newMultiplier;
      setCurrentMultiplier(updatedMultiplier);
      
      // Move to next round after delay
      setTimeout(() => {
        setCurrentCard(nextCardValue);
        setNextCard(null);
        setPrediction(null);
        setRound(round + 1);
      }, 1500);
      
    } else {
      // Lose
      setGameOver(true);
      setWon(false);
      setGameActive(false);
      
      // In a real app, this would call the API to complete the bet
      // completeBet.mutate({
      //   betId: currBetId!,
      //   outcome: { 
      //     initialCard: currentCard,
      //     nextCard: nextCardValue,
      //     prediction: predictionType,
      //     win: false
      //   }
      // });
    }
  };
  
  const cashout = () => {
    if (!gameActive || gameOver) return;
    
    setGameOver(true);
    setWon(true);
    setGameActive(false);
    
    // In a real app, this would call the API to complete the bet
    // completeBet.mutate({
    //   betId: currBetId!,
    //   outcome: { 
    //     initialCard: currentCard,
    //     nextCard: null,
    //     prediction: null,
    //     win: true
    //   }
    // });
  };
  
  // Render a card
  const renderCard = (cardIndex: number | null, highlighted: boolean = false) => {
    if (cardIndex === null) {
      return (
        <div className="w-40 h-56 bg-panel-bg rounded-lg border border-border flex items-center justify-center">
          <span className="text-2xl text-muted-foreground">?</span>
        </div>
      );
    }
    
    const card = getCardDetails(cardIndex);
    
    return (
      <div className={`
        w-40 h-56 bg-white rounded-lg shadow-md flex flex-col items-center justify-center
        ${highlighted ? 'ring-2 ring-accent animate-pulse' : ''}
      `}>
        <div className={`text-4xl ${card.color}`}>{card.suit}</div>
        <div className={`text-5xl font-bold mt-2 ${card.color}`}>{card.rank}</div>
      </div>
    );
  };
  
  // Game visualization panel
  const gamePanel = (
    <div>
      {/* Game status display */}
      <div className="mb-4 flex justify-between items-center">
        <div className="text-lg">
          Round: {round}
        </div>
        <div className="text-lg">
          Multiplier: {currentMultiplier.toFixed(2)}x
        </div>
      </div>
      
      {/* Result message */}
      {gameOver && (
        <div className={`text-center mb-6 p-3 rounded-lg ${won ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
          <div className="text-2xl font-bold">
            {won ? 'You Won!' : 'You Lost!'}
          </div>
          {won && <div>{profit} profit</div>}
        </div>
      )}
      
      {/* Card display */}
      <div className="flex flex-col items-center mb-6">
        <div className="flex justify-center space-x-8 mb-4">
          {renderCard(currentCard, false)}
          {renderCard(nextCard, nextCard !== null)}
        </div>
        
        {!gameActive && !gameOver && (
          <Button 
            className="mt-4 bg-accent text-accent-foreground px-8"
            onClick={startGame}
          >
            Deal Card
          </Button>
        )}
        
        {gameActive && !gameOver && nextCard === null && (
          <div className="flex space-x-4 mt-4">
            <Button 
              className="bg-red-500 hover:bg-red-600 text-white px-8"
              onClick={() => makePrediction('lower')}
            >
              Lower
            </Button>
            <Button 
              className="bg-green-500 hover:bg-green-600 text-white px-8"
              onClick={() => makePrediction('higher')}
            >
              Higher
            </Button>
          </div>
        )}
        
        {gameActive && round > 0 && nextCard === null && (
          <Button 
            className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-white px-8"
            onClick={cashout}
          >
            Cashout ({currentMultiplier.toFixed(2)}x)
          </Button>
        )}
      </div>
      
      {/* Prediction indicators */}
      {prediction && (
        <div className="text-center mb-4">
          <div className="text-lg">
            Predicting: <span className="font-bold">{prediction === 'higher' ? 'Higher' : 'Lower'}</span>
          </div>
        </div>
      )}
      
      {/* Game Stats */}
      {currentCard !== null && nextCard === null && (
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="bg-panel-bg p-3 rounded">
            <div className="text-muted-foreground mb-1 text-xs">Lower Multiplier</div>
            <div className="text-foreground font-medium">
              {calculateMultiplier(getCardDetails(currentCard).value, 'lower')}x
            </div>
          </div>
          <div className="bg-panel-bg p-3 rounded">
            <div className="text-muted-foreground mb-1 text-xs">Higher Multiplier</div>
            <div className="text-foreground font-medium">
              {calculateMultiplier(getCardDetails(currentCard).value, 'higher')}x
            </div>
          </div>
        </div>
      )}
    </div>
  );
  
  // Game controls panel
  const controlsPanel = (
    <GameControls
      betAmount={betAmount}
      onBetAmountChange={handleBetAmountChange}
      onHalfBet={handleHalfBet}
      onDoubleBet={handleDoubleBet}
      onBet={startGame}
      betButtonText={gameActive ? 'Game in Progress' : 'Start Game'}
      betButtonDisabled={gameActive}
    >
      <div className="mb-4">
        <label className="block text-muted-foreground mb-2">Current Multiplier</label>
        <Input
          type="text"
          value={`${currentMultiplier.toFixed(2)}x`}
          readOnly
          className="w-full bg-panel-bg text-foreground"
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-muted-foreground mb-2">Potential Profit</label>
        <Input
          type="text"
          value={profit}
          readOnly
          className="w-full bg-panel-bg text-foreground"
        />
      </div>
    </GameControls>
  );
  
  return (
    <GameLayout
      title="Hilo"
      controlsPanel={controlsPanel}
      gamePanel={gamePanel}
    />
  );
};

export default HiloGame;
