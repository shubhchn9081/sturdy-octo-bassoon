import crypto from 'crypto';

// Generate a random server seed
export function createServerSeed(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Hash a server seed
export function hashServerSeed(serverSeed: string): string {
  return crypto.createHash('sha256').update(serverSeed).digest('hex');
}

// Generate a random number between 0 and 1 from seeds
export function generateRandomNumber(serverSeed: string, clientSeed: string, nonce: number): number {
  const combinedSeed = `${serverSeed}-${clientSeed}-${nonce}`;
  const hash = crypto.createHash('sha256').update(combinedSeed).digest('hex');
  
  // Use the first 8 characters of the hash as a hexadecimal number
  // and convert to a number between 0 and 1
  const decimal = parseInt(hash.substring(0, 8), 16);
  return decimal / 0xffffffff; // Divide by max 32-bit integer to get 0-1
}

// Calculate a dice roll (0-100)
export function calculateDiceRoll(serverSeed: string, clientSeed: string, nonce: number): number {
  const random = generateRandomNumber(serverSeed, clientSeed, nonce);
  return parseFloat((random * 100).toFixed(2));
}

// Calculate crash point
export function calculateCrashPoint(serverSeed: string, clientSeed: string, nonce: number): number {
  const random = generateRandomNumber(serverSeed, clientSeed, nonce);
  // Math for 99% RTP as per stake's algorithm
  const houseEdgeModifier = 0.99;
  const result = Math.max(1, 1 / (1 - (random * houseEdgeModifier)));
  return parseFloat(result.toFixed(2));
}

// Calculate limbo result
export function calculateLimboResult(serverSeed: string, clientSeed: string, nonce: number): number {
  // Similar to crash but with different distribution
  const random = generateRandomNumber(serverSeed, clientSeed, nonce);
  return parseFloat((1 / (1 - (random * 0.99))).toFixed(2));
}

// Generate plinko path
export function generatePlinkoPath(serverSeed: string, clientSeed: string, nonce: number, rows: number): number[] {
  const path: number[] = [];
  let position = 0;
  
  for (let i = 0; i < rows; i++) {
    // Generate a new random for each row
    const combinedSeed = `${serverSeed}-${clientSeed}-${nonce}-${i}`;
    const hash = crypto.createHash('sha256').update(combinedSeed).digest('hex');
    const randomBit = parseInt(hash.charAt(0), 16) % 2; // 0 or 1
    
    if (randomBit === 1) {
      position += 1;
    }
    
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
    const hash = crypto.createHash('sha256').update(combinedSeed).digest('hex');
    const randomIndex = parseInt(hash.substring(0, 8), 16) % available.length;
    
    positions.push(available[randomIndex]);
    available.splice(randomIndex, 1);
  }
  
  return positions.sort((a, b) => a - b);
}

// Verify a bet result
export function verifyBet(
  hashedServerSeed: string, 
  revealedServerSeed: string, 
  clientSeed: string, 
  nonce: number
): boolean {
  // Hash the revealed server seed and compare to the hashed seed we received
  const checkHash = hashServerSeed(revealedServerSeed);
  return checkHash === hashedServerSeed;
}
