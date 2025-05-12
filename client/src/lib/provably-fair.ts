import CryptoJS from 'crypto-js';

// Basic implementation of provably fair algorithms
// In a real-world scenario, this would be more complex
// and would need to match the server-side implementation

// Generate a random server seed (server only)
export function generateServerSeed(): string {
  const randomBytes = new Uint8Array(32);
  window.crypto.getRandomValues(randomBytes);
  return Array.from(randomBytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

// Generate a client seed
export function generateClientSeed(): string {
  return Math.random().toString(36).substring(2, 15);
}

// Hash a server seed to send to client (hiding the actual value)
export function hashServerSeed(serverSeed: string): string {
  return CryptoJS.SHA256(serverSeed).toString(CryptoJS.enc.Hex);
}

// Generate a roulette result (0-36)
export function generateRouletteResult(serverSeed: string, clientSeed: string, nonce: number): number {
  const random = generateRandomNumber(serverSeed, clientSeed, nonce);
  return Math.floor(random * 37); // 0-36 for European roulette
}

// Generate a random number between 0 and 1 based on seeds
export function generateRandomNumber(serverSeed: string, clientSeed: string, nonce: number): number {
  const combinedSeed = `${serverSeed}-${clientSeed}-${nonce}`;
  const hash = CryptoJS.SHA256(combinedSeed).toString(CryptoJS.enc.Hex);
  
  // Use the first 8 characters of the hash as a hexadecimal number
  // and convert to a number between 0 and 1
  const decimal = parseInt(hash.substr(0, 8), 16);
  return decimal / 0xffffffff; // Divide by max 32-bit integer to get 0-1
}

// Generate random number for dice (0-100)
export function generateDiceNumber(serverSeed: string, clientSeed: string, nonce: number): number {
  const random = generateRandomNumber(serverSeed, clientSeed, nonce);
  return parseFloat((random * 100).toFixed(2));
}

// Generate Crash result
export function generateCrashResult(serverSeed: string, clientSeed: string, nonce: number): number {
  const random = generateRandomNumber(serverSeed, clientSeed, nonce);
  // Math for 99% RTP as per stake's algorithm
  const houseEdgeModifier = 0.99;
  const result = Math.max(1, 1 / (1 - (random * houseEdgeModifier)));
  return parseFloat(result.toFixed(2));
}

// Generate Plinko path
export function generatePlinkoPath(
  serverSeed: string, 
  clientSeed: string, 
  nonce: number, 
  rows: number,
  pathCount: number = rows
): number[] {
  const path: number[] = [];
  // Start at the center position
  let position = Math.floor(rows / 2);
  
  for (let i = 0; i < pathCount; i++) {
    // Generate a new random for each row
    const combinedSeed = `${serverSeed}-${clientSeed}-${nonce}-${i}`;
    const hash = CryptoJS.SHA256(combinedSeed).toString(CryptoJS.enc.Hex);
    const randomBit = parseInt(hash.charAt(0), 16) % 2; // 0 or 1
    
    // Move either left (-1) or right (+1)
    const direction = randomBit === 1 ? 1 : -1;
    position += direction;
    
    // Ensure we don't go out of bounds
    position = Math.max(0, Math.min(rows, position));
    
    path.push(position);
  }
  
  return path;
}

// Generate mines positions
export function generateMinePositions(
  serverSeed: string, 
  clientSeed: string, 
  nonce: number, 
  totalSquares: number,
  mineCount: number
): number[] {
  const positions: number[] = [];
  const available = Array.from({ length: totalSquares }, (_, i) => i);
  
  for (let i = 0; i < mineCount; i++) {
    const combinedSeed = `${serverSeed}-${clientSeed}-${nonce}-${i}`;
    const hash = CryptoJS.SHA256(combinedSeed).toString(CryptoJS.enc.Hex);
    const randomIndex = parseInt(hash.substr(0, 8), 16) % available.length;
    
    positions.push(available[randomIndex]);
    available.splice(randomIndex, 1);
  }
  
  return positions.sort((a, b) => a - b);
}

// Verify a game result (client can use this to check server's result)
export function verifyResult(
  hashedServerSeed: string, 
  revealedServerSeed: string, 
  clientSeed: string, 
  nonce: number
): boolean {
  // Hash the revealed server seed and compare to the hashed seed we received
  const checkHash = hashServerSeed(revealedServerSeed);
  return checkHash === hashedServerSeed;
}
