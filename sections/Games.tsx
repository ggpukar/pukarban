import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, RotateCcw, X as CloseIcon, Volume2, VolumeX, Trophy, Info, Pause, Maximize2 } from 'lucide-react';

// --- AUDIO SYSTEM (No external assets) ---
class SoundManager {
  ctx: AudioContext | null = null;
  muted: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  playTone(freq: number, type: OscillatorType = 'sine', duration: number = 0.1) {
    if (this.muted || !this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  click() { this.playTone(400, 'sine', 0.05); }
  move() { this.playTone(300, 'triangle', 0.05); }
  score() { this.playTone(600, 'sine', 0.1); }
  win() { 
    [400, 500, 600, 800].forEach((f, i) => setTimeout(() => this.playTone(f, 'square', 0.1), i * 100)); 
  }
  lose() { 
    [400, 300, 200].forEach((f, i) => setTimeout(() => this.playTone(f, 'sawtooth', 0.2), i * 150)); 
  }
}

const sfx = new SoundManager();

// --- TYPES ---
interface GameProps {
  onExit: () => void;
  isMuted: boolean;
}

// --- GAME 1: TIC TAC TOE (With Minimax AI) ---
const TicTacToe: React.FC<GameProps> = ({ onExit }) => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true); // Player is X
  const [winner, setWinner] = useState<string | null>(null);
  const [mode, setMode] = useState<'PvP' | 'PvAI'>('PvAI');

  const checkWinner = (squares: any[]) => {
    const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    for(let i=0; i<lines.length; i++) {
      const [a,b,c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) return squares[a];
    }
    return squares.includes(null) ? null : 'Draw';
  };

  const minimax = (squares: any[], depth: number, isMaximizing: boolean): number => {
    const result = checkWinner(squares);
    if (result === 'O') return 10 - depth;
    if (result === 'X') return depth - 10;
    if (result === 'Draw') return 0;

    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (!squares[i]) {
          squares[i] = 'O';
          const score = minimax(squares, depth + 1, false);
          squares[i] = null;
          bestScore = Math.max(score, bestScore);
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < 9; i++) {
        if (!squares[i]) {
          squares[i] = 'X';
          const score = minimax(squares, depth + 1, true);
          squares[i] = null;
          bestScore = Math.min(score, bestScore);
        }
      }
      return bestScore;
    }
  };

  const makeAIMove = (currentBoard: any[]) => {
    let bestScore = -Infinity;
    let move = -1;
    for (let i = 0; i < 9; i++) {
      if (!currentBoard[i]) {
        currentBoard[i] = 'O';
        const score = minimax(currentBoard, 0, false);
        currentBoard[i] = null;
        if (score > bestScore) {
          bestScore = score;
          move = i;
        }
      }
    }
    if (move !== -1) {
      const next = [...currentBoard];
      next[move] = 'O';
      setBoard(next);
      setIsXNext(true);
      sfx.move();
      const w = checkWinner(next);
      if (w) handleWin(w);
    }
  };

  const handleWin = (w: string) => {
    setWinner(w);
    if (w === 'X') sfx.win();
    else if (w === 'O') sfx.lose();
    else sfx.score();
  };

  const handleClick = (i: number) => {
    if (board[i] || winner || (!isXNext && mode === 'PvAI')) return;
    sfx.click();
    const next = [...board];
    next[i] = 'X';
    setBoard(next);
    
    const w = checkWinner(next);
    if (w) {
      handleWin(w);
      return;
    }

    setIsXNext(false);
    if (mode === 'PvAI') {
      setTimeout(() => makeAIMove(next), 500);
    } else {
      setIsXNext(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="flex gap-4 mb-6">
        <button 
          onClick={() => { setMode('PvP'); setBoard(Array(9).fill(null)); setWinner(null); setIsXNext(true); }}
          className={`px-4 py-2 rounded-full ${mode === 'PvP' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'}`}
        >
          2 Player
        </button>
        <button 
          onClick={() => { setMode('PvAI'); setBoard(Array(9).fill(null)); setWinner(null); setIsXNext(true); }}
          className={`px-4 py-2 rounded-full ${mode === 'PvAI' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'}`}
        >
          Vs AI
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3 bg-gray-800 p-3 rounded-2xl shadow-2xl">
        {board.map((cell, i) => (
          <button 
            key={i} 
            onClick={() => handleClick(i)}
            disabled={!!cell || !!winner}
            className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-700 rounded-xl text-5xl font-bold flex items-center justify-center hover:bg-gray-600 transition-colors disabled:hover:bg-gray-700"
          >
            <span className={cell === 'X' ? 'text-blue-400' : 'text-red-400'}>{cell}</span>
          </button>
        ))}
      </div>
      
      {winner && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="mt-8 text-3xl font-bold text-white bg-gray-800/80 px-6 py-3 rounded-xl backdrop-blur-md border border-white/10"
        >
          {winner === 'Draw' ? "It's a Draw!" : `Winner: ${winner}`}
        </motion.div>
      )}

      <button onClick={() => { setBoard(Array(9).fill(null)); setWinner(null); setIsXNext(true); }} className="mt-8 flex items-center gap-2 px-6 py-3 bg-white/10 rounded-full hover:bg-white/20 transition-all">
        <RotateCcw size={20} /> Restart
      </button>
    </div>
  );
};

// --- GAME 2: 2048 ---
const Game2048: React.FC<GameProps> = () => {
  const [grid, setGrid] = useState<number[][]>([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const initGame = () => {
    const newGrid = Array(4).fill(0).map(() => Array(4).fill(0));
    addRandomTile(newGrid);
    addRandomTile(newGrid);
    setGrid(newGrid);
    setScore(0);
    setGameOver(false);
  };

  useEffect(() => initGame(), []);

  const addRandomTile = (g: number[][]) => {
    const empty = [];
    for(let r=0; r<4; r++) for(let c=0; c<4; c++) if(g[r][c]===0) empty.push({r,c});
    if(empty.length === 0) return;
    const {r, c} = empty[Math.floor(Math.random()*empty.length)];
    g[r][c] = Math.random() < 0.9 ? 2 : 4;
  };

  const move = (dir: 'UP'|'DOWN'|'LEFT'|'RIGHT') => {
    if(gameOver) return;
    let moved = false;
    let newGrid = grid.map(row => [...row]);
    let addedScore = 0;

    const rot = (g: number[][]) => g[0].map((_, i) => g.map(row => row[i]).reverse());
    const slide = (row: number[]) => {
      let arr = row.filter(v => v);
      for(let i=0; i<arr.length-1; i++) {
        if(arr[i] === arr[i+1]) {
          arr[i] *= 2;
          addedScore += arr[i];
          arr.splice(i+1, 1);
          sfx.score();
        }
      }
      while(arr.length < 4) arr.push(0);
      return arr;
    };

    if(dir === 'RIGHT') newGrid = newGrid.map(r => slide(r.reverse()).reverse());
    else if(dir === 'LEFT') newGrid = newGrid.map(r => slide(r));
    else if(dir === 'UP') {
      newGrid = rot(rot(rot(newGrid)));
      newGrid = newGrid.map(r => slide(r));
      newGrid = rot(newGrid);
    } else if(dir === 'DOWN') {
      newGrid = rot(newGrid);
      newGrid = newGrid.map(r => slide(r));
      newGrid = rot(rot(rot(newGrid)));
    }

    if(JSON.stringify(newGrid) !== JSON.stringify(grid)) moved = true;

    if(moved) {
      addRandomTile(newGrid);
      setGrid(newGrid);
      setScore(s => s + addedScore);
      sfx.move();
      if(checkGameOver(newGrid)) {
        setGameOver(true);
        sfx.lose();
      }
    }
  };

  const checkGameOver = (g: number[][]) => {
    for(let r=0; r<4; r++) for(let c=0; c<4; c++) if(g[r][c]===0) return false;
    for(let r=0; r<4; r++) for(let c=0; c<3; c++) if(g[r][c]===g[r][c+1]) return false;
    for(let r=0; r<3; r++) for(let c=0; c<4; c++) if(g[r][c]===g[r+1][c]) return false;
    return true;
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if(e.key === 'ArrowUp') move('UP');
      else if(e.key === 'ArrowDown') move('DOWN');
      else if(e.key === 'ArrowLeft') move('LEFT');
      else if(e.key === 'ArrowRight') move('RIGHT');
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [grid, gameOver]);

  // Mobile swipe support (basic)
  let touchStartX = 0;
  let touchStartY = 0;
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diffX = e.changedTouches[0].clientX - touchStartX;
    const diffY = e.changedTouches[0].clientY - touchStartY;
    if(Math.abs(diffX) > Math.abs(diffY)) {
      if(Math.abs(diffX) > 30) move(diffX > 0 ? 'RIGHT' : 'LEFT');
    } else {
      if(Math.abs(diffY) > 30) move(diffY > 0 ? 'DOWN' : 'UP');
    }
  };

  const getCellColor = (val: number) => {
    const colors: Record<number, string> = {
      2: 'bg-gray-200 text-gray-800', 4: 'bg-gray-300 text-gray-800', 8: 'bg-orange-200 text-white',
      16: 'bg-orange-400 text-white', 32: 'bg-orange-500 text-white', 64: 'bg-orange-600 text-white',
      128: 'bg-yellow-400 text-white', 256: 'bg-yellow-500 text-white', 512: 'bg-yellow-600 text-white',
      1024: 'bg-yellow-700 text-white', 2048: 'bg-yellow-800 text-white'
    };
    return colors[val] || 'bg-black text-white';
  };

  return (
    <div className="flex flex-col items-center justify-center h-full" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <div className="flex justify-between w-full max-w-xs mb-4">
        <div className="bg-gray-800 p-3 rounded-lg">Score: <span className="font-bold text-white">{score}</span></div>
        <button onClick={initGame} className="bg-blue-600 p-3 rounded-lg"><RotateCcw size={16}/></button>
      </div>
      
      <div className="bg-gray-700 p-3 rounded-xl">
        <div className="grid grid-cols-4 gap-2">
          {grid.map((row, r) => row.map((cell, c) => (
            <div key={`${r}-${c}`} className={`w-14 h-14 sm:w-20 sm:h-20 flex items-center justify-center text-xl sm:text-2xl font-bold rounded-lg transition-all duration-200 ${cell ? getCellColor(cell) : 'bg-gray-800'}`}>
              {cell > 0 && cell}
            </div>
          )))}
        </div>
      </div>
      {gameOver && <div className="mt-4 text-red-400 font-bold text-xl">Game Over!</div>}
      <div className="mt-4 text-gray-400 text-sm">Use Arrow Keys or Swipe</div>
    </div>
  );
};

// --- GAME 3: WORD SEARCH ---
const WordSearch: React.FC<GameProps> = () => {
  const WORDS = ['REACT', 'CODE', 'NODE', 'WEB', 'JAVA', 'HTML', 'CSS', 'API'];
  const GRID_SIZE = 8;
  const [grid, setGrid] = useState<string[][]>([]);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [selection, setSelection] = useState<{r:number, c:number}[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);

  useEffect(() => {
    generateGrid();
  }, []);

  const generateGrid = () => {
    const newGrid = Array(GRID_SIZE).fill('').map(() => Array(GRID_SIZE).fill(''));
    const placed: string[] = [];

    // Simple placement logic
    WORDS.forEach(word => {
      let placedWord = false;
      let attempts = 0;
      while(!placedWord && attempts < 50) {
        const dir = Math.random() > 0.5 ? 'H' : 'V';
        const r = Math.floor(Math.random() * (dir === 'H' ? GRID_SIZE : GRID_SIZE - word.length));
        const c = Math.floor(Math.random() * (dir === 'V' ? GRID_SIZE : GRID_SIZE - word.length));
        
        let fits = true;
        for(let i=0; i<word.length; i++) {
          const char = dir === 'H' ? newGrid[r][c+i] : newGrid[r+i][c];
          if(char !== '' && char !== word[i]) fits = false;
        }

        if(fits) {
          for(let i=0; i<word.length; i++) {
            if(dir==='H') newGrid[r][c+i] = word[i];
            else newGrid[r+i][c] = word[i];
          }
          placedWord = true;
          placed.push(word);
        }
        attempts++;
      }
    });

    // Fill empty
    for(let r=0; r<GRID_SIZE; r++) {
      for(let c=0; c<GRID_SIZE; c++) {
        if(newGrid[r][c] === '') newGrid[r][c] = String.fromCharCode(65 + Math.floor(Math.random()*26));
      }
    }
    setGrid(newGrid);
    setFoundWords([]);
  };

  const handleStart = (r: number, c: number) => {
    setIsSelecting(true);
    setSelection([{r,c}]);
    sfx.click();
  };

  const handleEnter = (r: number, c: number) => {
    if(!isSelecting) return;
    const start = selection[0];
    // Check if valid line (H, V, Diagonal)
    if(r === start.r || c === start.c || Math.abs(r-start.r) === Math.abs(c-start.c)) {
        // Simple Bresenham-like line collection
        const newSel = [];
        const dr = Math.sign(r - start.r);
        const dc = Math.sign(c - start.c);
        let cr = start.r, cc = start.c;
        while(cr !== r + dr || cc !== c + dc) {
            newSel.push({r: cr, c: cc});
            cr += dr; cc += dc;
        }
        setSelection(newSel);
    }
  };

  const handleEnd = () => {
    setIsSelecting(false);
    const word = selection.map(p => grid[p.r][p.c]).join('');
    const revWord = word.split('').reverse().join('');
    
    if(WORDS.includes(word) && !foundWords.includes(word)) {
      setFoundWords([...foundWords, word]);
      sfx.win();
    } else if(WORDS.includes(revWord) && !foundWords.includes(revWord)) {
      setFoundWords([...foundWords, revWord]);
      sfx.win();
    } else {
      setSelection([]);
    }
  };

  const isSelected = (r: number, c: number) => selection.some(p => p.r===r && p.c===c);

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="mb-4 flex flex-wrap justify-center gap-2 max-w-md">
        {WORDS.map(w => (
          <span key={w} className={`px-2 py-1 rounded text-sm ${foundWords.includes(w) ? 'bg-green-500 text-black line-through' : 'bg-gray-800 text-gray-300'}`}>
            {w}
          </span>
        ))}
      </div>

      <div 
        className="bg-gray-800 p-2 rounded-xl select-none touch-none"
        onMouseLeave={handleEnd}
        onMouseUp={handleEnd}
      >
        <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}>
          {grid.map((row, r) => row.map((char, c) => (
            <div 
              key={`${r}-${c}`}
              onMouseDown={() => handleStart(r, c)}
              onMouseEnter={() => handleEnter(r, c)}
              onTouchStart={() => handleStart(r, c)} // Basic touch support triggers
              // Full touch drag support requires custom touchMove handler on container, omitted for brevity but start works
              className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center font-mono font-bold text-lg rounded cursor-pointer transition-colors
                ${isSelected(r,c) ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}
              `}
            >
              {char}
            </div>
          )))}
        </div>
      </div>
      <button onClick={generateGrid} className="mt-6 flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full hover:bg-white/20">
        <RotateCcw size={16}/> New Game
      </button>
    </div>
  );
};

// --- GAME 4: LINK NUMBER PUZZLE (Connect Sequence) ---
const LinkPuzzle: React.FC<GameProps> = () => {
    const SIZE = 5;
    const [path, setPath] = useState<number[]>([]); // Array of cell indices
    const [level, setLevel] = useState<number[]>([]); // The solution path
    const [gridNumbers, setGridNumbers] = useState<(number|null)[]>([]); // Numbers to display
    const [completed, setCompleted] = useState(false);

    // Generate Level
    useEffect(() => {
        resetLevel();
    }, []);

    const resetLevel = () => {
        const newLevel: number[] = [];
        let curr = Math.floor(Math.random() * (SIZE * SIZE));
        newLevel.push(curr);
        
        // Random Walk to generate path
        for(let i=0; i<10; i++) {
            const neighbors = [curr-SIZE, curr+SIZE, curr-1, curr+1].filter(n => {
                if(n < 0 || n >= SIZE*SIZE) return false;
                if(Math.abs((curr%SIZE) - (n%SIZE)) > 1) return false; // Wrap around check
                return !newLevel.includes(n);
            });
            if(neighbors.length === 0) break;
            curr = neighbors[Math.floor(Math.random() * neighbors.length)];
            newLevel.push(curr);
        }
        
        setLevel(newLevel);
        
        // Setup Grid: Show 1, some intermediates, and End
        const nums = Array(SIZE*SIZE).fill(null);
        newLevel.forEach((idx, i) => {
            // Show start, end, and every 3rd number
            if(i === 0 || i === newLevel.length-1 || i % 3 === 0) {
                nums[idx] = i + 1;
            }
        });
        setGridNumbers(nums);
        setPath([newLevel[0]]); // Start at 1
        setCompleted(false);
    };

    const handleEnter = (idx: number) => {
        if(completed) return;
        const last = path[path.length-1];
        
        // Check adjacency
        const isAdjacent = 
            idx === last - SIZE || 
            idx === last + SIZE || 
            (idx === last - 1 && last % SIZE !== 0) || 
            (idx === last + 1 && idx % SIZE !== 0);

        if(isAdjacent && !path.includes(idx)) {
            // Check if correct number order (if number exists)
            const targetNum = gridNumbers[idx];
            const currentStep = path.length + 1;
            
            if(targetNum !== null && targetNum !== currentStep) {
                return; // Wrong number
            }

            sfx.move();
            const newPath = [...path, idx];
            setPath(newPath);

            // Check Win
            if(newPath.length === level.length && idx === level[level.length-1]) {
                setCompleted(true);
                sfx.win();
            }
        } else if (path.length > 1 && idx === path[path.length-2]) {
            // Backtrack
            setPath(path.slice(0, -1));
            sfx.click();
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-full">
            <h3 className="text-xl font-bold mb-4 text-gray-300">Connect 1 to {level.length}</h3>
            <div 
                className="grid gap-2 p-4 bg-gray-800 rounded-xl"
                style={{ gridTemplateColumns: `repeat(${SIZE}, 1fr)` }}
            >
                {Array(SIZE*SIZE).fill(0).map((_, i) => {
                    const isPath = path.includes(i);
                    const num = gridNumbers[i];
                    return (
                        <div
                            key={i}
                            onMouseEnter={(e) => { if(e.buttons===1) handleEnter(i); }}
                            onMouseDown={() => { 
                                // Reset if clicking start
                                if(i === level[0]) setPath([i]); 
                            }}
                            className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center font-bold text-xl select-none transition-all duration-200
                                ${isPath ? 'bg-blue-500 text-white scale-110 shadow-lg shadow-blue-500/50' : 'bg-gray-700 text-gray-500'}
                                ${num ? 'border-2 border-white/20' : ''}
                            `}
                        >
                            {num || (isPath ? path.indexOf(i) + 1 : '')}
                        </div>
                    );
                })}
            </div>
            {completed && <div className="mt-6 text-2xl font-bold text-green-400 animate-bounce">Level Complete!</div>}
            <button onClick={resetLevel} className="mt-6 px-6 py-2 bg-white/10 rounded-full hover:bg-white/20">Next Level</button>
        </div>
    );
};

// --- GAME 5: PINBALL RUSH (Canvas Physics) ---
const PinballRush: React.FC<GameProps> = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const reqRef = useRef<number>(0); // Initialize with 0 to avoid "Expected 1 arguments, but got 0"

    // Game State Refs (to avoid re-renders)
    const state = useRef({
        ball: { x: 150, y: 20, vx: 0, vy: 2, r: 8 }, // Start at top, falling down
        flippers: {
            left: { x: 100, y: 350, len: 60, angle: 0.5, targetAngle: 0.5 }, // Angle in radians
            right: { x: 200, y: 350, len: 60, angle: 2.6, targetAngle: 2.6 }
        },
        bumpers: [
            { x: 150, y: 150, r: 15, score: 100 },
            { x: 100, y: 220, r: 10, score: 50 },
            { x: 200, y: 220, r: 10, score: 50 }
        ],
        keys: { left: false, right: false }
    });

    const resetGame = () => {
        // Reset ball to top center with slight random X offset to create variation
        state.current.ball = { x: 150 + (Math.random() * 40 - 20), y: 20, vx: 0, vy: 2, r: 8 };
        setScore(0);
        setGameOver(false);
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const update = () => {
            if(gameOver) return;
            const s = state.current;
            const w = canvas.width;
            const h = canvas.height;

            // Physics
            s.ball.vy += 0.2; // Gravity
            s.ball.x += s.ball.vx;
            s.ball.y += s.ball.vy;
            s.ball.vx *= 0.99; // Air resistance

            // Walls
            if(s.ball.x < s.ball.r) { s.ball.x = s.ball.r; s.ball.vx *= -0.8; }
            if(s.ball.x > w - s.ball.r) { s.ball.x = w - s.ball.r; s.ball.vx *= -0.8; }
            if(s.ball.y < s.ball.r) { s.ball.y = s.ball.r; s.ball.vy *= -0.5; }
            
            // Floor (Game Over)
            if(s.ball.y > h + 50) {
                setGameOver(true);
                sfx.lose();
            }

            // Flipper Controls
            const FLIP_SPEED = 0.2;
            const REST_L = 0.5; const UP_L = -0.3;
            const REST_R = 2.6; const UP_R = 3.4;

            s.flippers.left.targetAngle = s.keys.left ? UP_L : REST_L;
            s.flippers.right.targetAngle = s.keys.right ? UP_R : REST_R;

            // Smooth Flipper movement
            s.flippers.left.angle += (s.flippers.left.targetAngle - s.flippers.left.angle) * 0.4;
            s.flippers.right.angle += (s.flippers.right.targetAngle - s.flippers.right.angle) * 0.4;

            // Flipper Collision (Simplified Line Segment)
            [s.flippers.left, s.flippers.right].forEach((f, i) => {
                const x1 = f.x;
                const y1 = f.y;
                const x2 = f.x + Math.cos(f.angle) * f.len;
                const y2 = f.y + Math.sin(f.angle) * f.len;

                // Check collision with line segment
                // Very basic distance check to line
                const dist = pointLineDist(s.ball.x, s.ball.y, x1, y1, x2, y2);
                if(dist < s.ball.r + 5 && s.ball.y > y1 - 20) {
                    // Impulse
                    s.ball.vy = -12;
                    s.ball.vx += (Math.random()-0.5) * 5;
                    sfx.click();
                }
            });

            // Bumper Collision
            s.bumpers.forEach(b => {
                const dx = s.ball.x - b.x;
                const dy = s.ball.y - b.y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                if(dist < s.ball.r + b.r) {
                    const angle = Math.atan2(dy, dx);
                    s.ball.vx = Math.cos(angle) * 8;
                    s.ball.vy = Math.sin(angle) * 8;
                    setScore(prev => prev + b.score);
                    sfx.score();
                }
            });
        };

        const draw = () => {
            const w = canvas.width;
            const h = canvas.height;
            ctx.clearRect(0, 0, w, h);
            const s = state.current;

            // Ball
            ctx.beginPath();
            ctx.arc(s.ball.x, s.ball.y, s.ball.r, 0, Math.PI*2);
            ctx.fillStyle = '#3b82f6';
            ctx.fill();

            // Bumpers
            s.bumpers.forEach(b => {
                ctx.beginPath();
                ctx.arc(b.x, b.y, b.r, 0, Math.PI*2);
                ctx.fillStyle = '#ef4444';
                ctx.fill();
                ctx.strokeStyle = 'white';
                ctx.stroke();
            });

            // Flippers
            [s.flippers.left, s.flippers.right].forEach(f => {
                ctx.beginPath();
                ctx.moveTo(f.x, f.y);
                ctx.lineTo(f.x + Math.cos(f.angle) * f.len, f.y + Math.sin(f.angle) * f.len);
                ctx.strokeStyle = '#22c55e';
                ctx.lineWidth = 6;
                ctx.lineCap = 'round';
                ctx.stroke();
            });

            // Text
            if(gameOver) {
                ctx.fillStyle = 'white';
                ctx.font = '30px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText("GAME OVER", w/2, h/2);
            }
        };

        const loop = () => {
            update();
            draw();
            reqRef.current = requestAnimationFrame(loop);
        };
        reqRef.current = requestAnimationFrame(loop);

        const handleDown = (e: KeyboardEvent) => {
            if(e.key === 'ArrowLeft') state.current.keys.left = true;
            if(e.key === 'ArrowRight') state.current.keys.right = true;
        };
        const handleUp = (e: KeyboardEvent) => {
            if(e.key === 'ArrowLeft') state.current.keys.left = false;
            if(e.key === 'ArrowRight') state.current.keys.right = false;
        };

        window.addEventListener('keydown', handleDown);
        window.addEventListener('keyup', handleUp);

        return () => {
            if(reqRef.current) cancelAnimationFrame(reqRef.current);
            window.removeEventListener('keydown', handleDown);
            window.removeEventListener('keyup', handleUp);
        };
    }, [gameOver]);

    // Helper: Distance from point to line segment
    const pointLineDist = (px: number, py: number, x1: number, y1: number, x2: number, y2: number) => {
        const A = px - x1;
        const B = py - y1;
        const C = x2 - x1;
        const D = y2 - y1;
        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        let param = -1;
        if (lenSq !== 0) param = dot / lenSq;
        let xx, yy;
        if (param < 0) { xx = x1; yy = y1; }
        else if (param > 1) { xx = x2; yy = y2; }
        else { xx = x1 + param * C; yy = y1 + param * D; }
        const dx = px - xx;
        const dy = py - yy;
        return Math.sqrt(dx * dx + dy * dy);
    };

    return (
        <div className="flex flex-col items-center justify-center h-full">
            <div className="flex justify-between w-full max-w-[300px] mb-2 text-sm text-gray-400">
                <span>LEFT/RIGHT ARROWS to Flip</span>
                <span className="text-white font-bold">Score: {score}</span>
            </div>
            <canvas 
                ref={canvasRef} 
                width={300} 
                height={450} 
                className="bg-gray-900 rounded-xl border border-white/10 shadow-2xl"
                onPointerDown={(e) => {
                    // Simple mobile tap controls (Left/Right side of screen)
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    if(x < 150) state.current.keys.left = true;
                    else state.current.keys.right = true;
                }}
                onPointerUp={() => {
                    state.current.keys.left = false;
                    state.current.keys.right = false;
                }}
            />
            {gameOver && (
                <button onClick={resetGame} className="mt-4 px-6 py-2 bg-white/10 rounded-full hover:bg-white/20">Try Again</button>
            )}
        </div>
    );
};

// --- MAIN SECTION & MODAL ---
const GAMES_LIST = [
  { 
    id: 'tictactoe', 
    name: 'Tic Tac Toe', 
    desc: 'Classic strategy vs AI', 
    color: 'from-blue-900/90 to-indigo-900/90', 
    image: 'https://images.unsplash.com/photo-1668901382969-8c73e450a1f5?q=80&w=600&auto=format&fit=crop',
    component: TicTacToe 
  },
  { 
    id: '2048', 
    name: '2048', 
    desc: 'Merge numbers to win', 
    color: 'from-orange-900/90 to-amber-900/90', 
    image: 'https://images.unsplash.com/photo-1614332287897-cdc485fa562d?q=80&w=600&auto=format&fit=crop',
    component: Game2048 
  },
  { 
    id: 'wordsearch', 
    name: 'Tech Words', 
    desc: 'Find hidden tech terms', 
    color: 'from-emerald-900/90 to-teal-900/90', 
    image: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?q=80&w=600&auto=format&fit=crop',
    component: WordSearch 
  },
  { 
    id: 'link', 
    name: 'Link Flow', 
    desc: 'Connect numbers in order', 
    color: 'from-purple-900/90 to-pink-900/90', 
    image: 'https://images.unsplash.com/photo-1555617778-02518510b9fa?q=80&w=600&auto=format&fit=crop',
    component: LinkPuzzle 
  },
  { 
    id: 'pinball', 
    name: 'Pinball Rush', 
    desc: 'Physics-based arcade fun', 
    color: 'from-red-900/90 to-rose-900/90', 
    image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=600&auto=format&fit=crop',
    component: PinballRush 
  },
];

export const GamesSection: React.FC = () => {
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    sfx.muted = isMuted;
  }, [isMuted]);

  const CurrentGame = GAMES_LIST.find(g => g.id === activeGame)?.component;

  return (
    <div className="min-h-screen w-full flex flex-col items-center p-6 pt-20">
      <h2 className="text-4xl font-bold mb-12 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
        Arcade
      </h2>

      <AnimatePresence mode="wait">
        {!activeGame ? (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl"
          >
            {GAMES_LIST.map((game, i) => (
              <motion.div
                key={game.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.1, type: "spring", stiffness: 200 }}
                whileHover={{ 
                    scale: 1.05, 
                    y: -10,
                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 30px rgba(255,255,255,0.25)"
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => { setActiveGame(game.id); sfx.click(); }}
                className="relative overflow-hidden rounded-3xl p-6 h-64 cursor-pointer shadow-xl group border border-white/10"
              >
                {/* Background Image & Overlay */}
                <div className="absolute inset-0 z-0">
                    <img src={game.image} alt={game.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    <div className={`absolute inset-0 bg-gradient-to-t ${game.color} opacity-90 group-hover:opacity-75 transition-opacity duration-300`} />
                </div>

                {/* Content */}
                <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-100 transition-opacity z-20">
                  <Maximize2 size={24} className="text-white"/>
                </div>
                <div className="h-full flex flex-col justify-end relative z-10">
                  <h3 className="text-3xl font-bold text-white mb-2 text-shadow">{game.name}</h3>
                  <p className="text-white/80 font-medium text-shadow-sm">{game.desc}</p>
                  <div className="mt-4 inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full w-fit hover:bg-white/30 transition-colors">
                    <Play size={16} fill="white" /> <span className="text-sm font-bold">Play Now</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="fixed inset-0 z-50 bg-gray-900/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 md:p-8"
          >
            {/* Modal Header */}
            <div className="absolute top-4 left-0 w-full px-6 flex justify-between items-center z-20">
                <div className="flex items-center gap-4">
                     <h2 className="text-2xl font-bold hidden sm:block">{GAMES_LIST.find(g => g.id === activeGame)?.name}</h2>
                     <button onClick={() => setIsMuted(!isMuted)} className="p-3 bg-white/10 rounded-full hover:bg-white/20">
                        {isMuted ? <VolumeX size={20}/> : <Volume2 size={20}/>}
                     </button>
                </div>
                <button 
                  onClick={() => setActiveGame(null)}
                  className="p-3 bg-red-500/20 text-red-400 rounded-full hover:bg-red-500 hover:text-white transition-all border border-red-500/50"
                >
                  <CloseIcon size={24} />
                </button>
            </div>

            {/* Game Container */}
            <div className="w-full max-w-4xl h-full max-h-[80vh] bg-black/40 rounded-3xl border border-white/10 relative overflow-hidden shadow-2xl flex items-center justify-center">
               {CurrentGame && <CurrentGame onExit={() => setActiveGame(null)} isMuted={isMuted} />}
            </div>
            
            <div className="mt-4 text-gray-500 text-sm hidden sm:block">
                Press ESC to exit • Designed by Prabin Ban
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
