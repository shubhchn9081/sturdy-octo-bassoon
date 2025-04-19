import React, { useEffect, useState, useRef } from 'react';

interface ScreenTimeCounterProps {
  className?: string;
  prefix?: string;
}

const ScreenTimeCounter: React.FC<ScreenTimeCounterProps> = ({ 
  className = '', 
  prefix = 'Time:' 
}) => {
  const [time, setTime] = useState<string>('0.0');
  const startTimeRef = useRef<number>(0);
  const requestIdRef = useRef<number | null>(null);

  const updateTime = () => {
    const elapsed = ((performance.now() - startTimeRef.current) / 1000).toFixed(1);
    setTime(elapsed);
    requestIdRef.current = requestAnimationFrame(updateTime);
  };

  useEffect(() => {
    startTimeRef.current = performance.now();
    requestIdRef.current = requestAnimationFrame(updateTime);

    return () => {
      if (requestIdRef.current !== null) {
        cancelAnimationFrame(requestIdRef.current);
      }
    };
  }, []);

  return (
    <div className={`text-white ${className}`}>
      {prefix} {time}s
    </div>
  );
};

export default ScreenTimeCounter;