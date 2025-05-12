import { useState, useEffect } from "react";
import { 
  generateServerSeed, 
  generateClientSeed, 
  hashServerSeed,
  generateRandomNumber,
  generateDiceNumber,
  generateCrashResult,
  generatePlinkoPath,
  generateMinePositions,
  generateRouletteResult
} from "@/lib/provably-fair";

export function useProvablyFair(gameType: string) {
  const [serverSeed, setServerSeed] = useState("");
  const [clientSeed, setClientSeed] = useState("");
  const [hashedServerSeed, setHashedServerSeed] = useState("");
  const [nonce, setNonce] = useState(0);

  // Generate initial seeds when component mounts
  useEffect(() => {
    const newServerSeed = generateServerSeed();
    const newClientSeed = generateClientSeed();
    
    setServerSeed(newServerSeed);
    setClientSeed(newClientSeed);
    setHashedServerSeed(hashServerSeed(newServerSeed));
    setNonce(0);
  }, []);

  // Regenerate server seed and reset nonce
  const regenerateServerSeed = () => {
    const newServerSeed = generateServerSeed();
    setServerSeed(newServerSeed);
    setHashedServerSeed(hashServerSeed(newServerSeed));
    setNonce(0);
  };

  // Change client seed
  const changeClientSeed = (seed: string) => {
    setClientSeed(seed);
    setNonce(0);
  };

  // Increment nonce for next bet
  const incrementNonce = () => {
    setNonce(prev => prev + 1);
  };

  // Get result based on game type
  const getGameResult = () => {
    incrementNonce();
    
    switch (gameType) {
      case "dice":
        return generateDiceNumber(serverSeed, clientSeed, nonce);
        
      case "crash":
        return generateCrashResult(serverSeed, clientSeed, nonce);
        
      case "plinko": 
        return (rows: number, pathCount?: number) => generatePlinkoPath(serverSeed, clientSeed, nonce, rows, pathCount);
        
      case "mines":
        return (totalSquares: number, mineCount: number) => 
          generateMinePositions(serverSeed, clientSeed, nonce, totalSquares, mineCount);
      
      case "roulette":
        return generateRouletteResult(serverSeed, clientSeed, nonce);
        
      default:
        return generateRandomNumber(serverSeed, clientSeed, nonce);
    }
  };

  return {
    serverSeed,
    clientSeed,
    hashedServerSeed,
    nonce,
    regenerateServerSeed,
    changeClientSeed,
    getGameResult
  };
}
