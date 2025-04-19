import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';

// Custom hook for GSAP animations
export const useGsapAnimation = <T extends HTMLElement>(
  animationFunction: (element: T, gsapInstance: typeof gsap) => gsap.core.Timeline | void,
  dependencies: any[] = []
) => {
  const ref = useRef<T>(null);

  useLayoutEffect(() => {
    const element = ref.current;
    
    if (!element) return;
    
    // Create GSAP context to auto-cleanup animations when component unmounts
    const ctx = gsap.context(() => {
      const animation = animationFunction(element, gsap);
      return animation;
    }, element);
    
    return () => ctx.revert(); // Cleanup animations on unmount
  }, dependencies);

  return ref;
};

// Predefined animations for common game scenarios
export const gameAnimations = {
  // For splash effects, winning animations
  splash: (element: HTMLElement, duration: number = 0.5) => {
    return gsap.timeline()
      .fromTo(element, 
        { scale: 0, opacity: 0 }, 
        { scale: 1, opacity: 1, duration, ease: "elastic.out(1, 0.5)" }
      )
      .to(element, { opacity: 0, duration: 0.3, delay: 0.2 });
  },
  
  // For rapid number changes (win amount, multiplier)
  counterAnimation: (element: HTMLElement, startValue: number, endValue: number, duration: number = 1.5) => {
    const obj = { value: startValue };
    
    return gsap.timeline()
      .to(obj, {
        value: endValue,
        duration,
        ease: "power1.inOut",
        onUpdate: () => {
          if (element) {
            element.textContent = obj.value.toFixed(2);
          }
        }
      });
  },
  
  // For crash game rocket movement
  rocketMovement: (element: HTMLElement, multiplier: number, duration: number = 8) => {
    // Calculate the curve path
    const pathHeight = Math.min(multiplier * 30, 1000);  // Cap the height to prevent going too far
    
    return gsap.timeline()
      .to(element, {
        motionPath: {
          path: [
            {x: 0, y: 0},
            {x: 100, y: -pathHeight * 0.3},
            {x: 200, y: -pathHeight * 0.7},
            {x: 300, y: -pathHeight}
          ],
          curviness: 1.5
        },
        duration,
        ease: "power1.in"
      });
  },
  
  // For plinko ball drop animation
  plinkoDrop: (element: HTMLElement, path: number[], duration: number = 3) => {
    const timeline = gsap.timeline();
    const totalSteps = path.length;
    const stepDuration = duration / totalSteps;
    
    // Create animation points based on the path
    path.forEach((position, index) => {
      // Convert position into x coordinate (adjust based on your game board)
      const xPos = (position - 8) * 30; // Assuming 16 slots with 30px width
      const yPos = index * 50; // Each row is 50px apart
      
      timeline.to(element, {
        x: xPos,
        y: yPos,
        duration: stepDuration,
        ease: index === 0 ? "power1.in" : "bounce.out"
      });
    });
    
    return timeline;
  },
  
  // For mines reveal animation
  mineReveal: (element: HTMLElement, isWin: boolean) => {
    return gsap.timeline()
      .to(element, { 
        rotationY: 180, 
        duration: 0.5, 
        ease: "power2.inOut" 
      })
      .to(element, { 
        backgroundColor: isWin ? "#4CAF50" : "#F44336",
        scale: isWin ? 1.1 : 1.2,
        duration: 0.3,
        yoyo: true,
        repeat: 1
      }, "-=0.2");
  },
  
  // For dice roll animation
  diceRoll: (element: HTMLElement, finalValue: number) => {
    // Random intermediate values for realistic rolling effect
    const intermediateValues = Array.from({length: 10}, () => Math.floor(Math.random() * 100) + 1);
    const timeline = gsap.timeline();
    
    // Shake and rotate dice
    timeline.to(element, {
      rotation: "random(-360, 360)",
      x: "random(-10, 10)",
      y: "random(-10, 10)",
      duration: 0.1,
      repeat: 10,
      ease: "none"
    });
    
    // Display final value
    timeline.to(element, { 
      rotation: 0, 
      x: 0, 
      y: 0, 
      duration: 0.5, 
      ease: "power2.out" 
    });
    
    return timeline;
  }
};