# Cup and Ball Game Component

A standalone React component implementing the classic cup and ball game (shell game) with animations, sound effects, and customizable styling.

![Cup Game Demo](https://i.imgur.com/example.gif)

## Features

- Animated cup shuffling with configurable speed and complexity
- Three difficulty levels (easy, medium, hard)
- Sound effects for hits and success (can be muted)
- Responsive design for all screen sizes
- Easily customizable styling
- Callback functions for game events
- No external dependencies other than React

## Installation

### Option 1: Copy the component file

1. Copy the `CupGame.jsx` file into your project's components directory
2. Import it from your component directory:

```jsx
import CupGame from './components/CupGame';
```

### Option 2: Install from npm

Coming soon!

## Basic Usage

```jsx
import React from 'react';
import CupGame from './components/CupGame';

function App() {
  return (
    <div className="App">
      <h1>Cup and Ball Game</h1>
      <CupGame />
    </div>
  );
}

export default App;
```

## Props

The component accepts the following props:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onCorrectGuess` | Function | undefined | Callback function when player guesses correctly |
| `onWrongGuess` | Function | undefined | Callback function when player guesses incorrectly |
| `difficulty` | String | 'medium' | Game difficulty: 'easy', 'medium', or 'hard' |
| `soundsEnabled` | Boolean | true | Whether to enable game sounds |
| `customStyles` | Object | {} | Custom styling overrides (see Customization) |

## Advanced Usage

### With Callbacks and Custom Difficulty

```jsx
import React, { useState } from 'react';
import CupGame from './components/CupGame';

function GameContainer() {
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  
  const handleCorrectGuess = () => {
    setScore(score + 1);
    setAttempts(attempts + 1);
  };
  
  const handleWrongGuess = () => {
    setAttempts(attempts + 1);
  };
  
  return (
    <div className="game-container">
      <h1>Cup and Ball Game</h1>
      <div className="score-board">
        <p>Score: {score} / {attempts}</p>
      </div>
      
      <CupGame 
        difficulty="hard"
        onCorrectGuess={handleCorrectGuess}
        onWrongGuess={handleWrongGuess}
        soundsEnabled={true}
      />
    </div>
  );
}

export default GameContainer;
```

## Customization

You can customize the appearance of the component by passing a `customStyles` object:

```jsx
const customStyles = {
  container: {
    background: '#f5f5f5',
    borderRadius: '20px',
  },
  cup: {
    backgroundColor: '#9c27b0', // Purple cups
  },
  ball: {
    backgroundColor: '#ffeb3b', // Yellow ball
  },
  playButton: {
    backgroundColor: '#4caf50', // Green button
    borderRadius: '30px',
  }
};

<CupGame customStyles={customStyles} />
```

The following style keys are available for customization:

- `container` - The main game container
- `gameArea` - The game play area
- `cupsContainer` - The container for cups
- `cup` - The cup elements
- `cupOverlay` - The highlight overlay on cups
- `ball` - The ball element
- `ballHighlight` - The highlight on the ball
- `gameResult` - The game result message
- `controls` - The controls container
- `playButton` - The play/play again button
- `disabledButton` - The disabled state of the play button
- `soundButton` - The sound toggle button
- `instructions` - The game instructions

## Support

For questions or issues, please open an issue in the repository.

## License

MIT