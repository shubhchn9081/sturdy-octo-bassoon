import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useBalance } from '@/hooks/use-balance';
import { useProvablyFair } from '@/hooks/use-provably-fair';
import { gsap } from 'gsap';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import {
  History,
  RotateCw,
  CornerUpLeft,
  Plus,
  X,
  RefreshCw,
  Zap
} from 'lucide-react';
import { formatCrypto } from '@/lib/utils';

// European Roulette Configuration
const ROULETTE_NUMBERS = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
];

// Color mapping (0=green, 1=red, 2=black)
const NUMBER_COLORS = {
  0: 'green',
  1: 'red', 2: 'black', 3: 'red', 4: 'black',
  5: 'red', 6: 'black', 7: 'red', 8: 'black',
  9: 'red', 10: 'black', 11: 'black', 12: 'red',
  13: 'black', 14: 'red', 15: 'black', 16: 'red',
  17: 'black', 18: 'red', 19: 'red', 20: 'black',
  21: 'red', 22: 'black', 23: 'red', 24: 'black',
  25: 'red', 26: 'black', 27: 'red', 28: 'black',
  29: 'black', 30: 'red', 31: 'black', 32: 'red',
  33: 'black', 34: 'red', 35: 'black', 36: 'red'
};

// Types of bets
interface BetType {
  name: string;
  payout: number;
  description: string;
  numbers: number[];
}

interface Bet {
  type: BetType;
  amount: number;
}

interface BetChip {
  amount: number;
  position: { x: number, y: number };
  betType: BetType;
}

interface GameResult {
  number: number;
  color: string;
  multiplier: number;
  winAmount: number;
  betAmount: number;
}

// Define bet types
const BET_TYPES: Record<string, BetType> = {
  // Straight bets (Single numbers)
  ...Array.from({ length: 37 }, (_, i) => ({
    [`number_${i}`]: {
      name: `Number ${i}`,
      payout: 36,
      description: `Bet on number ${i}`,
      numbers: [i]
    }
  })).reduce((acc, obj) => ({ ...acc, ...obj }), {}),
  
  // Outside bets
  red: {
    name: 'Red',
    payout: 2,
    description: 'Bet on red numbers',
    numbers: Object.entries(NUMBER_COLORS)
      .filter(([_, color]) => color === 'red')
      .map(([num]) => parseInt(num))
  },
  black: {
    name: 'Black',
    payout: 2,
    description: 'Bet on black numbers',
    numbers: Object.entries(NUMBER_COLORS)
      .filter(([_, color]) => color === 'black')
      .map(([num]) => parseInt(num))
  },
  odd: {
    name: 'Odd',
    payout: 2,
    description: 'Bet on odd numbers',
    numbers: Array.from({ length: 36 }, (_, i) => i + 1).filter(num => num % 2 === 1)
  },
  even: {
    name: 'Even',
    payout: 2,
    description: 'Bet on even numbers',
    numbers: Array.from({ length: 36 }, (_, i) => i + 1).filter(num => num % 2 === 0)
  },
  low: {
    name: '1-18',
    payout: 2,
    description: 'Bet on numbers 1-18',
    numbers: Array.from({ length: 18 }, (_, i) => i + 1)
  },
  high: {
    name: '19-36',
    payout: 2,
    description: 'Bet on numbers 19-36',
    numbers: Array.from({ length: 18 }, (_, i) => i + 19)
  },
  first_dozen: {
    name: '1st Dozen',
    payout: 3,
    description: 'Bet on numbers 1-12',
    numbers: Array.from({ length: 12 }, (_, i) => i + 1)
  },
  second_dozen: {
    name: '2nd Dozen',
    payout: 3,
    description: 'Bet on numbers 13-24',
    numbers: Array.from({ length: 12 }, (_, i) => i + 13)
  },
  third_dozen: {
    name: '3rd Dozen',
    payout: 3,
    description: 'Bet on numbers 25-36',
    numbers: Array.from({ length: 12 }, (_, i) => i + 25)
  },
  first_column: {
    name: '1st Column',
    payout: 3,
    description: 'Bet on numbers 1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34',
    numbers: [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34]
  },
  second_column: {
    name: '2nd Column',
    payout: 3,
    description: 'Bet on numbers 2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35',
    numbers: [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35]
  },
  third_column: {
    name: '3rd Column',
    payout: 3,
    description: 'Bet on numbers 3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36',
    numbers: [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36]
  }
};

// Define bet amount values
const BET_AMOUNTS = [1, 5, 10, 25, 50, 100, 500, 1000];

// Main Roulette Component
const Roulette = () => {
  // Canvas references
  const wheelCanvasRef = useRef<HTMLCanvasElement>(null);
  const tableCanvasRef = useRef<HTMLCanvasElement>(null);
  
  // State management
  const [selectedAmount, setSelectedAmount] = useState<number>(1);
  const [placedChips, setPlacedChips] = useState<BetChip[]>([]);
  const [bets, setBets] = useState<Bet[]>([]);
  const [totalBet, setTotalBet] = useState<number>(0);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [gameResult, setGameResult] = useState<GameResult | null>(null);
  const [gameHistory, setGameHistory] = useState<GameResult[]>([]);
  const [activeBetType, setActiveBetType] = useState<string | null>(null);
  const [autoSpin, setAutoSpin] = useState<boolean>(false);
  const [spinCount, setSpinCount] = useState<number>(0);
  const [activeCurrency, setActiveCurrency] = useState<'BTC' | 'USD' | 'INR' | 'ETH' | 'USDT'>('INR');
  
  // References for animation
  const animationFrameRef = useRef<number>(0);
  const wheelRotationRef = useRef<number>(0);
  const ballPositionRef = useRef({ x: 0, y: 0 });
  const ballRotationRef = useRef<number>(0);
  const finalNumberRef = useRef<number>(0);
  
  // Hooks for game functionality
  const { toast } = useToast();
  const { balance, rawBalance, placeBet, completeBet } = useBalance("INR"); // Fixed to INR for now
  const { getGameResult } = useProvablyFair("roulette");
  
  // Initialize the canvas when component mounts
  useEffect(() => {
    drawWheel();
    drawTable();
    
    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  // Update total bet when chips change
  useEffect(() => {
    const total = bets.reduce((sum, bet) => sum + bet.amount, 0);
    setTotalBet(total);
  }, [bets]);

  // Function to draw the roulette wheel with enhanced visuals
  const drawWheel = () => {
    const canvas = wheelCanvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    const size = Math.min(window.innerWidth * 0.9, 500);
    canvas.width = size;
    canvas.height = size;
    
    const centerX = size / 2;
    const centerY = size / 2;
    const outerRadius = size / 2 - 10;
    const wheelRadius = outerRadius - 15; // Actual wheel radius, slightly smaller than outer rim
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Create a circular drop shadow for the entire wheel
    ctx.beginPath();
    ctx.arc(centerX + 5, centerY + 5, outerRadius, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fill();
    
    // Draw outer decorative rim (wooden color with gold trim)
    const rimGradient = ctx.createRadialGradient(
      centerX, centerY, outerRadius - 20,
      centerX, centerY, outerRadius
    );
    rimGradient.addColorStop(0, '#8B4513'); // SaddleBrown
    rimGradient.addColorStop(0.7, '#A0522D'); // Sienna
    rimGradient.addColorStop(1, '#5D2906'); // Darker brown
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, outerRadius, 0, 2 * Math.PI);
    ctx.fillStyle = rimGradient;
    ctx.fill();
    
    // Add decorative gold border
    ctx.beginPath();
    ctx.arc(centerX, centerY, outerRadius, 0, 2 * Math.PI);
    ctx.strokeStyle = '#d4af37'; // Gold border
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Add inner gold circle to separate rim from wheel
    ctx.beginPath();
    ctx.arc(centerX, centerY, wheelRadius + 5, 0, 2 * Math.PI);
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw wheel base (dark surface)
    ctx.beginPath();
    ctx.arc(centerX, centerY, wheelRadius, 0, 2 * Math.PI);
    ctx.fillStyle = '#222222';
    ctx.fill();
    
    // Add subtle texture to wheel
    const textureSize = 2;
    const textureOpacity = 0.03;
    ctx.fillStyle = `rgba(255, 255, 255, ${textureOpacity})`;
    for(let x = 0; x < size; x += textureSize) {
      for(let y = 0; y < size; y += textureSize) {
        // Only add texture within wheel radius
        const dx = x - centerX;
        const dy = y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < wheelRadius && Math.random() > 0.8) {
          ctx.fillRect(x, y, textureSize, textureSize);
        }
      }
    }
    
    // Draw number segments with enhanced 3D effect
    const segmentAngle = (2 * Math.PI) / ROULETTE_NUMBERS.length;
    ROULETTE_NUMBERS.forEach((number, i) => {
      const startAngle = i * segmentAngle - wheelRotationRef.current;
      const endAngle = (i + 1) * segmentAngle - wheelRotationRef.current;
      
      // Draw segment
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, wheelRadius, startAngle, endAngle);
      ctx.closePath();
      
      // Color based on number with gradient for 3D effect
      let baseColor;
      if (number === 0) {
        baseColor = '#008000'; // Green for zero
      } else if (NUMBER_COLORS[number as keyof typeof NUMBER_COLORS] === 'red') {
        baseColor = '#d40000'; // Red
      } else {
        baseColor = '#000000'; // Black
      }
      
      // Create gradient for segment to add depth
      const segmentGradient = ctx.createRadialGradient(
        centerX, centerY, wheelRadius * 0.6,
        centerX, centerY, wheelRadius
      );
      
      // Compute lighter and darker variations of the base color
      const lightenColor = (color: string, percent: number): string => {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const r = Math.min(255, (num >> 16) + amt);
        const g = Math.min(255, ((num >> 8) & 0x00FF) + amt);
        const b = Math.min(255, (num & 0x0000FF) + amt);
        return '#' + (0x1000000 + (r << 16) + (g << 8) + b).toString(16).slice(1);
      };
      
      const darkenColor = (color: string, percent: number): string => {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const r = Math.max(0, (num >> 16) - amt);
        const g = Math.max(0, ((num >> 8) & 0x00FF) - amt);
        const b = Math.max(0, (num & 0x0000FF) - amt);
        return '#' + (0x1000000 + (r << 16) + (g << 8) + b).toString(16).slice(1);
      };
      
      const lighterColor = lightenColor(baseColor, 15);
      const darkerColor = darkenColor(baseColor, 15);
      
      segmentGradient.addColorStop(0, lighterColor);
      segmentGradient.addColorStop(1, darkerColor);
      
      ctx.fillStyle = segmentGradient;
      ctx.fill();
      
      // Add glossy highlight to each segment
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, wheelRadius, startAngle, endAngle);
      ctx.closePath();
      
      const glossGradient = ctx.createRadialGradient(
        centerX - wheelRadius * 0.3, centerY - wheelRadius * 0.3, 0,
        centerX, centerY, wheelRadius
      );
      glossGradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
      glossGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.05)');
      glossGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      
      ctx.fillStyle = glossGradient;
      ctx.fill();
      
      // Gold segment dividers with shadow
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(
        centerX + wheelRadius * Math.cos(startAngle),
        centerY + wheelRadius * Math.sin(startAngle)
      );
      // Add shadow effect
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 3;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;
      ctx.strokeStyle = '#d4af37'; // Gold dividers
      ctx.lineWidth = 1.5;
      ctx.stroke();
      
      // Reset shadow for text
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      
      // Draw number text with shadow for better readability
      ctx.save();
      const textRadius = wheelRadius * 0.75;
      ctx.translate(
        centerX + textRadius * Math.cos(startAngle + segmentAngle / 2),
        centerY + textRadius * Math.sin(startAngle + segmentAngle / 2)
      );
      ctx.rotate(startAngle + segmentAngle / 2 + Math.PI / 2);
      
      // Text shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(number.toString(), 1, 1);
      
      // Main text
      ctx.fillStyle = '#ffffff';
      ctx.fillText(number.toString(), 0, 0);
      ctx.restore();
    });
    
    // Draw decorative center hub with metallic effect
    const hubRadius = wheelRadius * 0.25;
    const hubGradient = ctx.createRadialGradient(
      centerX - hubRadius * 0.3, centerY - hubRadius * 0.3, 0,
      centerX, centerY, hubRadius
    );
    hubGradient.addColorStop(0, '#888888');
    hubGradient.addColorStop(0.7, '#555555');
    hubGradient.addColorStop(1, '#333333');
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, hubRadius, 0, 2 * Math.PI);
    ctx.fillStyle = hubGradient;
    ctx.fill();
    
    // Hub border with drop shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 5;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    // Add decorative spokes to the hub
    for (let i = 0; i < 8; i++) {
      const angle = i * Math.PI / 4;
      ctx.beginPath();
      ctx.moveTo(
        centerX + (hubRadius * 0.7) * Math.cos(angle),
        centerY + (hubRadius * 0.7) * Math.sin(angle)
      );
      ctx.lineTo(
        centerX + (hubRadius * 1.3) * Math.cos(angle),
        centerY + (hubRadius * 1.3) * Math.sin(angle)
      );
      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
    
    // Draw ball if spinning with enhanced lighting and shadow effects
    if (isSpinning && ballPositionRef.current.x !== 0) {
      // Ball shadow
      ctx.beginPath();
      ctx.arc(
        ballPositionRef.current.x + 2,
        ballPositionRef.current.y + 2,
        9,
        0,
        2 * Math.PI
      );
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fill();
      
      // Main ball with gradient for 3D effect
      const ballGradient = ctx.createRadialGradient(
        ballPositionRef.current.x - 3, 
        ballPositionRef.current.y - 3, 
        0,
        ballPositionRef.current.x, 
        ballPositionRef.current.y, 
        9
      );
      ballGradient.addColorStop(0, '#ffffff');
      ballGradient.addColorStop(0.7, '#e0e0e0');
      ballGradient.addColorStop(1, '#c0c0c0');
      
      ctx.beginPath();
      ctx.arc(
        ballPositionRef.current.x,
        ballPositionRef.current.y,
        8,
        0,
        2 * Math.PI
      );
      ctx.fillStyle = ballGradient;
      ctx.fill();
      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // Ball highlight (small white circle to simulate light reflection)
      ctx.beginPath();
      ctx.arc(
        ballPositionRef.current.x - 3,
        ballPositionRef.current.y - 3,
        2.5,
        0,
        2 * Math.PI
      );
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fill();
    }
  };

  // Function to draw the betting table
  const drawTable = () => {
    const canvas = tableCanvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Adjust based on screen size
    const isMobile = window.innerWidth < 768;
    const width = isMobile ? window.innerWidth - 40 : 800;
    const height = isMobile ? 500 : 300;
    
    canvas.width = width;
    canvas.height = height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw table background
    ctx.fillStyle = '#006400'; // Dark green felt
    ctx.fillRect(0, 0, width, height);
    
    // Draw grid lines
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    
    // Calculate cell dimensions
    const cellWidth = width / 14;
    const cellHeight = height / 4;
    
    // Draw number grid (3 rows x 12 columns)
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 12; col++) {
        const number = col * 3 + (3 - row);
        const x = cellWidth + col * cellWidth;
        const y = row * cellHeight;
        
        // Fill with red or black
        if (number > 0 && number <= 36) {
          const color = NUMBER_COLORS[number as keyof typeof NUMBER_COLORS];
          ctx.fillStyle = color === 'red' ? '#d40000' : '#000000';
          ctx.fillRect(x, y, cellWidth, cellHeight);
          
          // Add number text
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 20px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(number.toString(), x + cellWidth / 2, y + cellHeight / 2);
        }
      }
    }
    
    // Draw 0
    ctx.fillStyle = '#008000'; // Green
    ctx.fillRect(0, 0, cellWidth, cellHeight * 3);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('0', cellWidth / 2, cellHeight * 1.5);
    
    // Draw outside bets
    // First row: 1-18, Even, Red, Black, Odd, 19-36
    const bottomY = cellHeight * 3;
    const bottomCellWidth = cellWidth * 2;
    
    // 1-18
    ctx.fillStyle = '#006400';
    ctx.fillRect(cellWidth, bottomY, bottomCellWidth, cellHeight);
    ctx.strokeRect(cellWidth, bottomY, bottomCellWidth, cellHeight);
    ctx.fillStyle = '#ffffff';
    ctx.fillText('1-18', cellWidth + bottomCellWidth / 2, bottomY + cellHeight / 2);
    
    // Even
    ctx.fillStyle = '#006400';
    ctx.fillRect(cellWidth + bottomCellWidth, bottomY, bottomCellWidth, cellHeight);
    ctx.strokeRect(cellWidth + bottomCellWidth, bottomY, bottomCellWidth, cellHeight);
    ctx.fillStyle = '#ffffff';
    ctx.fillText('EVEN', cellWidth + bottomCellWidth * 1.5, bottomY + cellHeight / 2);
    
    // Red diamond
    ctx.fillStyle = '#d40000';
    ctx.fillRect(cellWidth + bottomCellWidth * 2, bottomY, bottomCellWidth, cellHeight);
    ctx.strokeRect(cellWidth + bottomCellWidth * 2, bottomY, bottomCellWidth, cellHeight);
    
    // Black diamond
    ctx.fillStyle = '#000000';
    ctx.fillRect(cellWidth + bottomCellWidth * 3, bottomY, bottomCellWidth, cellHeight);
    ctx.strokeRect(cellWidth + bottomCellWidth * 3, bottomY, bottomCellWidth, cellHeight);
    
    // Odd
    ctx.fillStyle = '#006400';
    ctx.fillRect(cellWidth + bottomCellWidth * 4, bottomY, bottomCellWidth, cellHeight);
    ctx.strokeRect(cellWidth + bottomCellWidth * 4, bottomY, bottomCellWidth, cellHeight);
    ctx.fillStyle = '#ffffff';
    ctx.fillText('ODD', cellWidth + bottomCellWidth * 4.5, bottomY + cellHeight / 2);
    
    // 19-36
    ctx.fillStyle = '#006400';
    ctx.fillRect(cellWidth + bottomCellWidth * 5, bottomY, bottomCellWidth, cellHeight);
    ctx.strokeRect(cellWidth + bottomCellWidth * 5, bottomY, bottomCellWidth, cellHeight);
    ctx.fillStyle = '#ffffff';
    ctx.fillText('19-36', cellWidth + bottomCellWidth * 5.5, bottomY + cellHeight / 2);
    
    // Draw dozens (2 to 1 bets)
    const dozensY = cellHeight * 3 + cellHeight;
    
    // First dozen (1-12)
    ctx.fillStyle = '#006400';
    ctx.fillRect(cellWidth, dozensY, cellWidth * 4, cellHeight);
    ctx.strokeRect(cellWidth, dozensY, cellWidth * 4, cellHeight);
    ctx.fillStyle = '#ffffff';
    ctx.fillText('1st 12', cellWidth + cellWidth * 2, dozensY + cellHeight / 2);
    
    // Second dozen (13-24)
    ctx.fillStyle = '#006400';
    ctx.fillRect(cellWidth + cellWidth * 4, dozensY, cellWidth * 4, cellHeight);
    ctx.strokeRect(cellWidth + cellWidth * 4, dozensY, cellWidth * 4, cellHeight);
    ctx.fillStyle = '#ffffff';
    ctx.fillText('2nd 12', cellWidth + cellWidth * 6, dozensY + cellHeight / 2);
    
    // Third dozen (25-36)
    ctx.fillStyle = '#006400';
    ctx.fillRect(cellWidth + cellWidth * 8, dozensY, cellWidth * 4, cellHeight);
    ctx.strokeRect(cellWidth + cellWidth * 8, dozensY, cellWidth * 4, cellHeight);
    ctx.fillStyle = '#ffffff';
    ctx.fillText('3rd 12', cellWidth + cellWidth * 10, dozensY + cellHeight / 2);
    
    // Draw columns
    const columnsX = cellWidth + cellWidth * 12;
    
    // First column
    ctx.fillStyle = '#006400';
    ctx.fillRect(columnsX, 0, cellWidth, cellHeight);
    ctx.strokeRect(columnsX, 0, cellWidth, cellHeight);
    ctx.fillStyle = '#ffffff';
    ctx.fillText('2-1', columnsX + cellWidth / 2, 0 + cellHeight / 2);
    
    // Second column
    ctx.fillStyle = '#006400';
    ctx.fillRect(columnsX, cellHeight, cellWidth, cellHeight);
    ctx.strokeRect(columnsX, cellHeight, cellWidth, cellHeight);
    ctx.fillStyle = '#ffffff';
    ctx.fillText('2-1', columnsX + cellWidth / 2, cellHeight + cellHeight / 2);
    
    // Third column
    ctx.fillStyle = '#006400';
    ctx.fillRect(columnsX, cellHeight * 2, cellWidth, cellHeight);
    ctx.strokeRect(columnsX, cellHeight * 2, cellWidth, cellHeight);
    ctx.fillStyle = '#ffffff';
    ctx.fillText('2-1', columnsX + cellWidth / 2, cellHeight * 2 + cellHeight / 2);
    
    // Draw placed chips
    placedChips.forEach(chip => {
      ctx.beginPath();
      ctx.arc(chip.position.x, chip.position.y, 15, 0, 2 * Math.PI);
      ctx.fillStyle = getChipColor(chip.amount);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Draw chip value
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(chip.amount.toString(), chip.position.x, chip.position.y);
    });
  };

  // Function to get chip color based on value
  const getChipColor = (value: number): string => {
    switch (value) {
      case 1: return '#ffffff'; // White
      case 5: return '#ff0000'; // Red
      case 10: return '#0000ff'; // Blue
      case 25: return '#00ff00'; // Green
      case 50: return '#ffa500'; // Orange
      case 100: return '#000000'; // Black
      case 500: return '#800080'; // Purple
      case 1000: return '#ffff00'; // Yellow
      default: return '#cccccc';
    }
  };

  // Function to handle canvas clicks for placing bets
  const handleTableClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isSpinning) return;
    
    const canvas = tableCanvasRef.current;
    if (!canvas) return;
    
    // Get click position
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calculate cell dimensions
    const cellWidth = canvas.width / 14;
    const cellHeight = canvas.height / 4;
    
    // Check if click is on a number cell
    const col = Math.floor((x - cellWidth) / cellWidth);
    const row = Math.floor(y / cellHeight);
    
    if (x > cellWidth && x < cellWidth * 13 && y < cellHeight * 3) {
      // It's a number bet
      if (col >= 0 && col < 12 && row >= 0 && row < 3) {
        const number = col * 3 + (3 - row);
        if (number > 0 && number <= 36) {
          placeBetOnNumber(number, { x, y });
        }
      }
    } 
    // Check if it's the 0 cell
    else if (x < cellWidth && y < cellHeight * 3) {
      placeBetOnNumber(0, { x: cellWidth / 2, y: cellHeight * 1.5 });
    }
    // Check if it's an outside bet
    else if (y > cellHeight * 3 && y < cellHeight * 4) {
      const sectionWidth = cellWidth * 2;
      const section = Math.floor((x - cellWidth) / sectionWidth);
      
      if (section >= 0 && section < 6) {
        const betPositionX = cellWidth + sectionWidth * section + sectionWidth / 2;
        const betPositionY = cellHeight * 3 + cellHeight / 2;
        
        // 1-18, Even, Red, Black, Odd, 19-36
        switch(section) {
          case 0:
            placeBetOnOutside("low", { x: betPositionX, y: betPositionY });
            break;
          case 1:
            placeBetOnOutside("even", { x: betPositionX, y: betPositionY });
            break;
          case 2:
            placeBetOnOutside("red", { x: betPositionX, y: betPositionY });
            break;
          case 3:
            placeBetOnOutside("black", { x: betPositionX, y: betPositionY });
            break;
          case 4:
            placeBetOnOutside("odd", { x: betPositionX, y: betPositionY });
            break;
          case 5:
            placeBetOnOutside("high", { x: betPositionX, y: betPositionY });
            break;
        }
      }
    }
    // Check if it's a dozen bet
    else if (y > cellHeight * 4) {
      const dozenWidth = cellWidth * 4;
      const dozen = Math.floor((x - cellWidth) / dozenWidth);
      
      if (dozen >= 0 && dozen < 3) {
        const betPositionX = cellWidth + dozenWidth * dozen + dozenWidth / 2;
        const betPositionY = cellHeight * 4 + cellHeight / 2;
        
        // 1st 12, 2nd 12, 3rd 12
        switch(dozen) {
          case 0:
            placeBetOnOutside("first_dozen", { x: betPositionX, y: betPositionY });
            break;
          case 1:
            placeBetOnOutside("second_dozen", { x: betPositionX, y: betPositionY });
            break;
          case 2:
            placeBetOnOutside("third_dozen", { x: betPositionX, y: betPositionY });
            break;
        }
      }
    }
    // Check if it's a column bet
    else if (x > cellWidth * 13) {
      const columnRow = Math.floor(y / cellHeight);
      
      if (columnRow >= 0 && columnRow < 3) {
        const betPositionX = cellWidth * 13 + cellWidth / 2;
        const betPositionY = columnRow * cellHeight + cellHeight / 2;
        
        // 1st column, 2nd column, 3rd column
        switch(columnRow) {
          case 0:
            placeBetOnOutside("first_column", { x: betPositionX, y: betPositionY });
            break;
          case 1:
            placeBetOnOutside("second_column", { x: betPositionX, y: betPositionY });
            break;
          case 2:
            placeBetOnOutside("third_column", { x: betPositionX, y: betPositionY });
            break;
        }
      }
    }
  };

  // Function to place a bet on a specific number
  const placeBetOnNumber = (number: number, position: { x: number, y: number }) => {
    if (rawBalance < selectedAmount) {
      toast({
        variant: "destructive",
        title: "Insufficient balance",
        description: "Add money to your wallet to place this bet.",
      });
      return;
    }
    
    const betType = BET_TYPES[`number_${number}`];
    
    // Add chip to visual representation
    setPlacedChips(prev => [...prev, { 
      amount: selectedAmount,
      position,
      betType
    }]);
    
    // Add bet to list
    setBets(prev => {
      const existingBet = prev.find(b => b.type.name === betType.name);
      if (existingBet) {
        return prev.map(b => 
          b.type.name === betType.name 
            ? { ...b, amount: b.amount + selectedAmount } 
            : b
        );
      } else {
        return [...prev, { type: betType, amount: selectedAmount }];
      }
    });
  };

  // Function to place a bet on an outside bet area
  const placeBetOnOutside = (betKey: string, position: { x: number, y: number }) => {
    if (rawBalance < selectedAmount) {
      toast({
        variant: "destructive",
        title: "Insufficient balance",
        description: "Add money to your wallet to place this bet.",
      });
      return;
    }
    
    const betType = BET_TYPES[betKey];
    
    // Add chip to visual representation
    setPlacedChips(prev => [...prev, { 
      amount: selectedAmount,
      position,
      betType
    }]);
    
    // Add bet to list
    setBets(prev => {
      const existingBet = prev.find(b => b.type.name === betType.name);
      if (existingBet) {
        return prev.map(b => 
          b.type.name === betType.name 
            ? { ...b, amount: b.amount + selectedAmount } 
            : b
        );
      } else {
        return [...prev, { type: betType, amount: selectedAmount }];
      }
    });
  };

  // Function to spin the wheel
  const spinWheel = async () => {
    if (isSpinning) return;
    
    if (totalBet <= 0) {
      toast({
        variant: "destructive",
        title: "No bets placed",
        description: "Please place at least one bet before spinning.",
      });
      return;
    }
    
    if (totalBet > rawBalance) {
      toast({
        variant: "destructive",
        title: "Insufficient balance",
        description: "Total bet amount exceeds your balance.",
      });
      return;
    }
    
    try {
      setIsSpinning(true);
      setGameResult(null);
      
      // Call the API to place bet
      const response = await placeBet.mutateAsync({
        gameId: 300, // Roulette game ID (defined in games/index.ts)
        amount: totalBet,
        clientSeed: Math.random().toString(36).substring(2, 15),
        options: { 
          bets: bets.map(bet => ({
            type: bet.type.name,
            amount: bet.amount
          })),
          currency: activeCurrency
        }
      });
      
      if (!response || !response.betId) {
        throw new Error("Invalid response from server");
      }
      
      // Generate a random result (0-36)
      const gameResult = getGameResult();
      const randomNumber = Math.floor((typeof gameResult === 'number' ? gameResult : Math.random()) * 37);
      finalNumberRef.current = randomNumber;
      
      // Animate wheel spin
      const startAngle = wheelRotationRef.current;
      const targetAngle = startAngle + (Math.PI * 8) + findAngleForNumber(randomNumber);
      
      // Setup ball animation
      const canvas = wheelCanvasRef.current;
      if (!canvas) return;
      
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const outerRadius = canvas.width / 2 - 10;
      const wheelRadius = outerRadius - 15;
      const ballTrackRadius = wheelRadius - 15; // Ball runs slightly inside the wheel edge
      
      // Initialize ball position
      ballPositionRef.current = {
        x: centerX,
        y: centerY - ballTrackRadius
      };
      
      // Set spin durations for realistic physics
      const wheelSpinDuration = 6000; // Wheel spins longer
      const ballSpinDuration = 4500;  // Ball slows down faster
      const ballSlideDuration = 1500; // Ball slides into final pocket
      
      // Create master GSAP animation timeline
      const tl = gsap.timeline({
        onComplete: () => {
          processResult(randomNumber, response.betId!);
        }
      });
      
      // Wheel spin animation - starts fast and gradually slows down
      tl.to(wheelRotationRef, {
        current: targetAngle,
        duration: wheelSpinDuration / 1000,
        ease: "power2.out", // Smooth deceleration
        onUpdate: () => drawWheel()
      }, 0); // Start at timeline beginning (0)
      
      // Ball animation in 3 phases:
      
      // Phase 1: Ball spins rapidly in opposite direction to wheel
      tl.to(ballRotationRef, {
        current: Math.PI * 20, // Ball makes several full rotations
        duration: ballSpinDuration / 1000 * 0.6, // First 60% of total ball spin time
        ease: "power1.in", // Ball accelerates slightly at start
        onUpdate: () => {
          // Calculate ball position - ball moves in opposite direction to wheel
          const wheelAngle = wheelRotationRef.current;
          const ballAngle = ballRotationRef.current - wheelAngle * 0.5; // Ball moves opposite to wheel at different rate
          ballPositionRef.current = {
            x: centerX + ballTrackRadius * Math.sin(ballAngle),
            y: centerY - ballTrackRadius * Math.cos(ballAngle)
          };
          drawWheel();
        }
      }, 0); // Start at timeline beginning (0)
      
      // Phase 2: Ball starts to slow down more rapidly than the wheel
      tl.to(ballRotationRef, {
        current: Math.PI * 24, // Continue rotation but slower
        duration: ballSpinDuration / 1000 * 0.4, // Last 40% of total ball spin time
        ease: "power3.out", // Strong deceleration
        onUpdate: () => {
          // Calculate position - still moving opposite to wheel
          const wheelAngle = wheelRotationRef.current;
          const ballAngle = ballRotationRef.current - wheelAngle * 0.3; // Ball syncs more with wheel as it slows
          ballPositionRef.current = {
            x: centerX + ballTrackRadius * Math.sin(ballAngle),
            y: centerY - ballTrackRadius * Math.cos(ballAngle)
          };
          drawWheel();
        }
      }, `<+${ballSpinDuration / 1000 * 0.6}`); // Start after Phase 1
      
      // Phase 3: Ball slides into pocket (coming to final rest)
      tl.to({}, {
        duration: ballSlideDuration / 1000,
        ease: "bounce.out", // Bouncy effect as ball settles in pocket
        onUpdate: () => {
          // Calculate final position - gradually move toward the final number pocket
          const progress = tl.progress();
          const finalProgress = Math.min(1, (progress - 0.75) * 4); // Normalized progress for final phase
          
          // Current rotation from wheel
          const wheelAngle = wheelRotationRef.current;
          
          // Find angle for the winning number
          const segmentAngle = (2 * Math.PI) / ROULETTE_NUMBERS.length;
          const numberIndex = ROULETTE_NUMBERS.indexOf(finalNumberRef.current);
          const finalAngle = numberIndex * segmentAngle - wheelAngle;
          
          // Current ball angle
          const currentBallAngle = ballRotationRef.current - wheelAngle * 0.3;
          
          // Interpolate between current position and final pocket position
          const interpolatedAngle = currentBallAngle + (finalAngle - currentBallAngle) * finalProgress;
          
          // Calculate ball radius that gradually decreases (ball moves toward center)
          const currentBallRadius = ballTrackRadius - (finalProgress * 15);
          
          // Update ball position
          ballPositionRef.current = {
            x: centerX + currentBallRadius * Math.sin(interpolatedAngle),
            y: centerY - currentBallRadius * Math.cos(interpolatedAngle)
          };
          
          drawWheel();
        }
      }, `>-0.5`); // Overlap with Phase 2 for smooth transition
      
      // At the end, snap ball to the winning number position
      tl.to(ballRotationRef, {
        current: findAngleForNumber(randomNumber),
        duration: 0.5,
        ease: "power1.inOut",
        onUpdate: () => {
          const ballAngle = ballRotationRef.current;
          ballPositionRef.current = {
            x: centerX + ballRadius * Math.sin(ballAngle),
            y: centerY - ballRadius * Math.cos(ballAngle)
          };
          drawWheel();
        }
      });
    } catch (error) {
      console.error("Error spinning wheel:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to spin the wheel. Please try again.",
      });
      setIsSpinning(false);
    }
  };

  // Find the angle for a specific number on the wheel
  const findAngleForNumber = (number: number): number => {
    const index = ROULETTE_NUMBERS.indexOf(number);
    if (index === -1) return 0;
    
    const segmentAngle = (2 * Math.PI) / ROULETTE_NUMBERS.length;
    return index * segmentAngle;
  };

  // Process the result of the spin
  const processResult = async (number: number, betId: number) => {
    // Determine which bets won
    const winningBets = bets.filter(bet => bet.type.numbers.includes(number));
    
    // Calculate winnings
    let totalWin = 0;
    winningBets.forEach(bet => {
      totalWin += bet.amount * bet.type.payout;
    });
    
    // Complete the bet with the server
    try {
      await completeBet.mutateAsync({
        betId,
        outcome: {
          number,
          color: NUMBER_COLORS[number as keyof typeof NUMBER_COLORS] || 'green',
          winAmount: totalWin,
          betAmount: totalBet
        }
      });
      
      // Update game result and history
      const result: GameResult = {
        number,
        color: NUMBER_COLORS[number as keyof typeof NUMBER_COLORS] || 'green',
        multiplier: totalWin > 0 ? totalWin / totalBet : 0,
        winAmount: totalWin,
        betAmount: totalBet
      };
      
      setGameResult(result);
      setGameHistory(prev => [result, ...prev.slice(0, 9)]);
      
      // Show toast with result
      if (totalWin > 0) {
        toast({
          title: "You won!",
          description: `Number ${number} - You won ${formatCrypto(totalWin)} ${activeCurrency}!`,
          variant: "default",
          className: "bg-green-500 text-white border-green-600",
        });
      } else {
        toast({
          title: "Better luck next time",
          description: `Number ${number} - You lost ${formatCrypto(totalBet)} ${activeCurrency}.`,
          variant: "default",
          className: "bg-red-500 text-white border-red-600",
        });
      }
      
      // Auto-spin logic
      if (autoSpin) {
        const autoSpinDelay = setTimeout(() => {
          resetBets();
          spinWheel();
          setSpinCount(prev => prev + 1);
        }, 3000);
        
        return () => clearTimeout(autoSpinDelay);
      }
    } catch (error) {
      console.error("Error completing bet:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to complete the bet. Please contact support.",
      });
    } finally {
      setIsSpinning(false);
    }
  };

  // Reset all bets
  const resetBets = () => {
    if (isSpinning) return;
    
    setBets([]);
    setPlacedChips([]);
    setGameResult(null);
    
    drawTable();
  };

  // Double all bets
  const doubleBets = () => {
    if (isSpinning || totalBet <= 0) return;
    
    if (totalBet * 2 > rawBalance) {
      toast({
        variant: "destructive",
        title: "Insufficient balance",
        description: "Cannot double bets - would exceed your balance.",
      });
      return;
    }
    
    // Double each bet amount
    setBets(prev => prev.map(bet => ({
      ...bet,
      amount: bet.amount * 2
    })));
    
    // Double each chip
    setPlacedChips(prev => prev.map(chip => ({
      ...chip,
      amount: chip.amount * 2
    })));
    
    drawTable();
  };

  // Format the number for display in history
  const formatNumberDisplay = (number: number, color: string) => {
    let bgColor = '';
    switch (color) {
      case 'red':
        bgColor = 'bg-red-600';
        break;
      case 'black':
        bgColor = 'bg-black';
        break;
      case 'green':
        bgColor = 'bg-green-600';
        break;
      default:
        bgColor = 'bg-green-600';
    }
    
    return (
      <div className={`${bgColor} w-8 h-8 rounded-full flex items-center justify-center text-white font-bold`}>
        {number}
      </div>
    );
  };

  // Render the component
  return (
    <div className="min-h-screen bg-[#0B131C] text-white flex flex-col">
      {/* Game header with balance and controls */}
      <div className="flex flex-col md:flex-row items-center justify-between p-4 bg-[#172B3A] border-b border-[#243442]">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold">European Roulette</h1>
        </div>
        
        <div className="flex items-center gap-2 mt-2 md:mt-0">
          <div className="bg-[#0F212E] px-4 py-2 rounded-md border border-[#243442]">
            <p className="text-[#7F8990] text-xs">Balance</p>
            <p className="font-bold">{balance} {activeCurrency}</p>
          </div>
          
          <Button 
            size="sm" 
            className="bg-green-600 hover:bg-green-700"
            onClick={() => {
              // Navigate to deposit page or show deposit modal
              console.log("Navigate to deposit");
            }}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Funds
          </Button>
        </div>
      </div>
      
      {/* Main game area */}
      <div className="flex flex-col md:flex-row flex-1 p-4 gap-4">
        {/* Left side - Wheel */}
        <div className="w-full md:w-1/2 flex flex-col items-center justify-center">
          <canvas 
            ref={wheelCanvasRef} 
            className="max-w-full border-4 border-[#243442] rounded-full bg-[#0F212E] shadow-lg"
          />
          
          {gameResult && (
            <div className="mt-4 p-3 bg-[#172B3A] rounded-md border border-[#243442] text-center">
              <h3 className="text-xl font-bold flex items-center justify-center gap-2">
                Result: {formatNumberDisplay(gameResult.number, gameResult.color)}
                <span className={`${gameResult.winAmount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {gameResult.winAmount > 0 
                    ? `+${formatCrypto(gameResult.winAmount)} ${activeCurrency}` 
                    : `-${formatCrypto(gameResult.betAmount)} ${activeCurrency}`}
                </span>
              </h3>
            </div>
          )}
        </div>
        
        {/* Right side - Betting table and controls */}
        <div className="w-full md:w-1/2 flex flex-col">
          {/* Betting table */}
          <div className="relative border-2 border-[#243442] rounded-md overflow-hidden bg-[#0F212E]">
            <canvas 
              ref={tableCanvasRef} 
              className="w-full cursor-pointer"
              onClick={handleTableClick}
            />
            
            {isSpinning && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="text-white text-xl font-bold">Spinning...</div>
              </div>
            )}
          </div>
          
          {/* Amount selection and bet controls */}
          <div className="mt-4 bg-[#172B3A] rounded-md border border-[#243442] p-3">
            <div className="flex flex-wrap gap-2 justify-center">
              {BET_AMOUNTS.map(amount => (
                <button
                  key={amount}
                  className={`px-4 py-2 rounded flex items-center justify-center font-medium text-white ${
                    selectedAmount === amount 
                      ? 'bg-primary shadow-lg scale-105 font-bold' 
                      : 'bg-secondary hover:bg-primary/80'
                  }`}
                  onClick={() => setSelectedAmount(amount)}
                  disabled={isSpinning}
                >
                  ₹{amount}
                </button>
              ))}
            </div>
            
            <div className="flex flex-wrap gap-2 mt-4 justify-center">
              <Button
                variant="outline"
                className="border-[#243442] text-white hover:bg-[#243442]"
                onClick={resetBets}
                disabled={isSpinning || bets.length === 0}
              >
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
              
              <Button
                variant="outline"
                className="border-[#243442] text-white hover:bg-[#243442]"
                onClick={doubleBets}
                disabled={isSpinning || bets.length === 0}
              >
                <Plus className="h-4 w-4 mr-1" />
                Double
              </Button>
              
              <Button
                onClick={spinWheel}
                className="bg-green-600 hover:bg-green-700 w-full mt-2"
                disabled={isSpinning || totalBet <= 0}
              >
                {isSpinning ? (
                  <span className="flex items-center">
                    <RotateCw className="h-4 w-4 mr-2 animate-spin" />
                    Spinning...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <Zap className="h-4 w-4 mr-2" />
                    Spin ({formatCrypto(totalBet)} {activeCurrency})
                  </span>
                )}
              </Button>
            </div>
          </div>
          
          {/* History and auto-play tabs */}
          <div className="mt-4">
            <Tabs defaultValue="history">
              <TabsList className="w-full bg-[#172B3A] border border-[#243442]">
                <TabsTrigger value="history" className="data-[state=active]:bg-[#243442] text-white w-1/2">
                  <History className="h-4 w-4 mr-2" />
                  History
                </TabsTrigger>
                <TabsTrigger value="auto" className="data-[state=active]:bg-[#243442] text-white w-1/2">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Auto Spin
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="history" className="p-3 bg-[#172B3A] border border-[#243442] border-t-0 min-h-[160px]">
                {gameHistory.length > 0 ? (
                  <div className="grid grid-cols-5 gap-2">
                    {gameHistory.map((result, i) => (
                      <div key={i} className="flex flex-col items-center">
                        {formatNumberDisplay(result.number, result.color)}
                        <span className={`text-xs mt-1 ${
                          result.winAmount > 0 ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {result.winAmount > 0 ? 'WIN' : 'LOSS'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-[120px] text-[#7F8990]">
                    No game history yet
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="auto" className="p-3 bg-[#172B3A] border border-[#243442] border-t-0 min-h-[160px]">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span>Auto Spin</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer"
                        checked={autoSpin}
                        onChange={() => setAutoSpin(!autoSpin)}
                        disabled={isSpinning}
                      />
                      <div className="w-11 h-6 bg-[#243442] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                  </div>
                  
                  <div className="text-center text-[#7F8990] text-sm">
                    {autoSpin 
                      ? `Auto-spin is active. Completed spins: ${spinCount}`
                      : 'Enable auto-spin to automatically spin after each game.'}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Roulette;