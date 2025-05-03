import crypto from 'crypto';

// Generate a hash of the given data
export function generateHash(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

// Create a server seed for provably fair gameplay
export function createServerSeed(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Hash a server seed for sharing with clients
export function hashServerSeed(serverSeed: string): string {
  return generateHash(serverSeed);
}

// Combine server seed, client seed, and nonce to generate a random number
export function generateRandomNumber(
  serverSeed: string,
  clientSeed: string,
  nonce: number,
  min = 0,
  max = 1
): number {
  // Create a unique combination of all inputs
  const combinedInput = `${serverSeed}:${clientSeed}:${nonce}`;
  
  // Generate a hash of the combined input
  const hash = generateHash(combinedInput);
  
  // Use the first 8 characters of the hash as a hex number
  const hexSubstring = hash.substring(0, 8);
  
  // Convert hex to a decimal number between 0 and 1
  const decimal = parseInt(hexSubstring, 16) / 0xffffffff;
  
  // Scale to range between min and max
  return min + decimal * (max - min);
}