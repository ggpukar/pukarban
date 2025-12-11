import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, RefreshCw, Trophy, LogOut } from 'lucide-react';

/* --- SHARED COMPONENTS --- */
interface GameModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

const GameModal: React.FC<GameModalProps> = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
    <div className="glass-panel w-full max-w-lg p-6 rounded-2xl relative flex flex-col items-center shadow-[0_0_50px_rgba(220,20,60,0.2)] border border-white/10">
      
      {/* Prominent Close Button (Top Right) */}
      <button 
        onClick={onClose} 
        className="absolute -top-4 -right-4 md:-right-12 md:top-0 bg-red-600 hover:bg-red-700 text-white rounded-full p-2 md:px-4 md:py-2 flex items-center gap-2 shadow-lg transition-all hover:scale-105 z-50 group"
      >
        <span className="hidden md:inline font-bold uppercase text-xs tracking-wider">Exit Game</span>
        <X size={24} className="group-hover:rotate-90 transition-transform" />
      </button>

      <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gold via-white to-nepalRed mb-8 drop-shadow-sm uppercase tracking-tight">{title}</h2>
      
      <div className="w-full flex flex-col items-center">
        {children}
      </div>
    </div>
  </div>
);

/* --- TIC TAC TOE --- */
const TicTacToe = ({ onClose }: { onClose: () => void }) => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);

  const calculateWinner = (squares: any[]) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  };

  const winner = calculateWinner(board);
  const isDraw = !winner && board.every(Boolean);

  const handleClick = (i: number) => {
    if (winner || board[i]) return;
    const nextBoard = [...board];
    nextBoard[i] = xIsNext ? 'X' : 'O';
    setBoard(nextBoard);
    setXIsNext(!xIsNext);
  };

  return (
    <GameModal title="Tic Tac Toe" onClose={onClose}>
      <div className="grid grid-cols-3 gap-3 mb-6 bg-black/20 p-4 rounded-xl">
        {board.map((cell, i) => (
          <button
            key={i}
            className={`w-20 h-20 sm:w-24 sm:h-24 rounded-xl text-5xl font-black shadow-inner flex items-center justify-center transition-all duration-200
              ${cell === 'X' ? 'bg-nepalRed text-white shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]' : cell === 'O' ? 'bg-nepalBlue text-white shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]' : 'bg-white/5 hover:bg-white/10'}
              border-2 border-white/5`}
            onClick={() => handleClick(i)}
          >
            {cell}
          </button>
        ))}
      </div>
      {(winner || isDraw) && (
        <div className="text-center animate-bounce">
          <p className="text-2xl font-bold mb-4 text-gold">{winner ? `Winner: ${winner}` : "It's a Draw!"}</p>
          <button 
            onClick={() => { setBoard(Array(9).fill(null)); setXIsNext(true); }}
            className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-gold to-yellow-600 text-black font-bold rounded-full hover:scale-105 transition shadow-lg"
          >
            <RefreshCw size={20} /> Play Again
          </button>
        </div>
      )}
    </GameModal>
  );
};

/* --- SNAKE --- */
const Snake = ({ onClose }: { onClose: () => void }) => {
  const GRID_SIZE = 15;
  const INITIAL_SNAKE = [[5, 5]];
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [food, setFood] = useState([10, 10]);
  const [direction, setDirection] = useState([0, 1]); // [row, col]
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const gameLoopRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const generateFood = () => {
    let newFood;
    while (true) {
      newFood = [Math.floor(Math.random() * GRID_SIZE), Math.floor(Math.random() * GRID_SIZE)];
      // Check collision with snake
      // eslint-disable-next-line no-loop-func
      const collision = snake.some(segment => segment[0] === newFood[0] && segment[1] === newFood[1]);
      if (!collision) break;
    }
    setFood(newFood);
  };

  const moveSnake = useCallback(() => {
    if (gameOver) return;

    setSnake(prevSnake => {
      const newHead = [prevSnake[0][0] + direction[0], prevSnake[0][1] + direction[1]];

      // Check walls
      if (newHead[0] < 0 || newHead[0] >= GRID_SIZE || newHead[1] < 0 || newHead[1] >= GRID_SIZE) {
        setGameOver(true);
        return prevSnake;
      }

      // Check self collision
      if (prevSnake.some(segment => segment[0] === newHead[0] && segment[1] === newHead[1])) {
        setGameOver(true);
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      // Check food
      if (newHead[0] === food[0] && newHead[1] === food[1]) {
        setScore(s => s + 1);
        generateFood();
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [direction, food, gameOver]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp': if (direction[0] !== 1) setDirection([-1, 0]); break;
        case 'ArrowDown': if (direction[0] !== -1) setDirection([1, 0]); break;
        case 'ArrowLeft': if (direction[1] !== 1) setDirection([0, -1]); break;
        case 'ArrowRight': if (direction[1] !== -1) setDirection([0, 1]); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction]);

  useEffect(() => {
    if (!gameOver) {
      gameLoopRef.current = setInterval(moveSnake, 150);
    }
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [moveSnake, gameOver]);

  return (
    <GameModal title="Snake Xenzia" onClose={onClose}>
      <div className="mb-4 flex gap-6 text-xl font-bold text-gold">
        <span className="flex items-center gap-2"><Trophy size={20} /> Score: {score}</span>
      </div>
      <div 
        className="bg-gray-900 border-4 border-gray-700 rounded-lg p-1 shadow-2xl relative"
        style={{ display: 'grid', gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`, width: '300px', height: '300px' }}
      >
        {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
          const r = Math.floor(i / GRID_SIZE);
          const c = i % GRID_SIZE;
          const isSnake = snake.some(s => s[0] === r && s[1] === c);
          const isFood = food[0] === r && food[1] === c;
          return (
            <div key={i} className={`
              ${isSnake ? 'bg-green-500 shadow-[0_0_5px_lime] z-10 rounded-sm' : ''} 
              ${isFood ? 'bg-nepalRed rounded-full animate-pulse shadow-[0_0_10px_red]' : ''}
              ${!isSnake && !isFood ? 'bg-white/5 border-[0.5px] border-white/5' : ''}
            `} />
          );
        })}
      </div>
      
      <div className="flex gap-4 mt-6">
        {gameOver && (
          <button 
            onClick={() => { setSnake(INITIAL_SNAKE); setScore(0); setGameOver(false); setDirection([0, 1]); generateFood(); }}
            className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-green-500 to-green-700 text-white font-bold rounded-full hover:scale-105 transition shadow-lg"
          >
            <RefreshCw size={18} /> Restart
          </button>
        )}
        <button 
          onClick={onClose}
          className="flex items-center gap-2 px-6 py-2 bg-red-600/80 text-white font-bold rounded-full hover:bg-red-600 transition shadow-lg"
        >
          <LogOut size={18} /> Quit
        </button>
      </div>

      <p className="mt-6 text-xs text-gray-400 bg-white/10 px-4 py-2 rounded-full">Use Arrow Keys to Move</p>
    </GameModal>
  );
};

/* --- 2048 --- */
const Game2048 = ({ onClose }: { onClose: () => void }) => {
  const [grid, setGrid] = useState<number[][]>([[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]]);
  const [score, setScore] = useState(0);

  const initGame = useCallback(() => {
    const newGrid = Array(4).fill(0).map(() => Array(4).fill(0));
    addNumber(newGrid);
    addNumber(newGrid);
    setGrid(newGrid);
    setScore(0);
  }, []);

  const addNumber = (currentGrid: number[][]) => {
    const empty = [];
    for(let r=0;r<4;r++) for(let c=0;c<4;c++) if(currentGrid[r][c] === 0) empty.push([r,c]);
    if(empty.length > 0) {
      const [r,c] = empty[Math.floor(Math.random() * empty.length)];
      currentGrid[r][c] = Math.random() > 0.9 ? 4 : 2;
    }
  };

  useEffect(() => { initGame(); }, [initGame]);

  const slide = (row: number[]) => {
    let arr = row.filter(val => val);
    for(let i=0; i<arr.length-1; i++){
      if(arr[i] === arr[i+1]){
        arr[i] *= 2;
        setScore(s => s + arr[i]);
        arr.splice(i+1, 1);
      }
    }
    while(arr.length < 4) arr.push(0);
    return arr;
  };

  const move = (dir: 'left' | 'right' | 'up' | 'down') => {
    let newGrid = [...grid.map(row => [...row])];
    let changed = false;

    if(dir === 'left' || dir === 'right') {
      for(let r=0; r<4; r++){
        const row = newGrid[r];
        const newRow = slide(dir === 'left' ? row : row.reverse());
        if(dir === 'right') newRow.reverse();
        if(JSON.stringify(row) !== JSON.stringify(newRow)) changed = true;
        newGrid[r] = newRow;
      }
    } else {
      for(let c=0; c<4; c++){
        let col = [newGrid[0][c], newGrid[1][c], newGrid[2][c], newGrid[3][c]];
        const newCol = slide(dir === 'up' ? col : col.reverse());
        if(dir === 'down') newCol.reverse();
        for(let r=0; r<4; r++) {
          if(newGrid[r][c] !== newCol[r]) changed = true;
          newGrid[r][c] = newCol[r];
        }
      }
    }

    if(changed) {
      addNumber(newGrid);
      setGrid(newGrid);
    }
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) e.preventDefault();
      if(e.key === 'ArrowUp') move('up');
      if(e.key === 'ArrowDown') move('down');
      if(e.key === 'ArrowLeft') move('left');
      if(e.key === 'ArrowRight') move('right');
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grid]);

  return (
    <GameModal title="2048" onClose={onClose}>
      <div className="mb-4 text-xl font-bold text-gold">Score: {score}</div>
      <div className="bg-[#bbada0] p-3 rounded-lg grid grid-cols-4 gap-3 w-[300px] h-[300px]">
        {grid.flat().map((cell, i) => (
          <div 
            key={i} 
            className={`flex items-center justify-center rounded font-bold text-2xl transition-all duration-200 transform hover:scale-105
              ${cell === 0 ? 'bg-[#cdc1b4]' : 'text-gray-900 shadow-md'}
              ${cell === 2 ? 'bg-[#eee4da]' : ''}
              ${cell === 4 ? 'bg-[#ede0c8]' : ''}
              ${cell === 8 ? 'bg-[#f2b179] text-white' : ''}
              ${cell === 16 ? 'bg-[#f59563] text-white' : ''}
              ${cell >= 32 ? 'bg-[#f67c5f] text-white' : ''}
            `}
          >
            {cell !== 0 && cell}
          </div>
        ))}
      </div>
      
      <div className="flex gap-4 mt-8">
        <button onClick={initGame} className="flex items-center gap-2 px-6 py-2 bg-gold text-black font-bold rounded-full hover:bg-yellow-400 transition shadow-lg">
          <RefreshCw size={18} /> Restart
        </button>
        <button 
          onClick={onClose}
          className="flex items-center gap-2 px-6 py-2 bg-red-600/80 text-white font-bold rounded-full hover:bg-red-600 transition shadow-lg"
        >
          <LogOut size={18} /> Quit
        </button>
      </div>
      
      <p className="mt-4 text-xs text-gray-400">Use Arrow Keys</p>
    </GameModal>
  );
};

/* --- MAIN EXPORT --- */
export { TicTacToe, Snake, Game2048 };