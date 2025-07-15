import React, { useState } from 'react';
import { Calculator, Delete, RotateCcw, MoreHorizontal } from 'lucide-react';

const ScientificCalculator: React.FC = () => {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [memory, setMemory] = useState<number>(0);
  const [angleMode, setAngleMode] = useState<'DEG' | 'RAD' | 'GRAD'>('DEG');
  const [isSecondFunction, setIsSecondFunction] = useState(false);

  const inputNumber = (num: string) => {
    if (waitingForOperand) {
      setDisplay(num);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.');
    }
  };

  const inputOperation = (nextOperation: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      const newValue = calculate(currentValue, inputValue, operation);

      setDisplay(String(newValue));
      setPreviousValue(newValue);
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  };

  const calculate = (firstValue: number, secondValue: number, operation: string): number => {
    switch (operation) {
      case '+': return firstValue + secondValue;
      case '-': return firstValue - secondValue;
      case '*': return firstValue * secondValue;
      case '/': return firstValue / secondValue;
      case '^': return Math.pow(firstValue, secondValue);
      case 'mod': return firstValue % secondValue;
      case '=': return secondValue;
      default: return secondValue;
    }
  };

  const performFunction = (func: string) => {
    const value = parseFloat(display);
    let result: number;

    // Convert angle based on mode
    const convertAngle = (angle: number) => {
      switch (angleMode) {
        case 'RAD': return angle;
        case 'GRAD': return angle * Math.PI / 200;
        default: return angle * Math.PI / 180; // DEG
      }
    };

    const convertFromRadians = (radians: number) => {
      switch (angleMode) {
        case 'RAD': return radians;
        case 'GRAD': return radians * 200 / Math.PI;
        default: return radians * 180 / Math.PI; // DEG
      }
    };

    switch (func) {
      case 'sin':
        result = isSecondFunction ? convertFromRadians(Math.asin(value)) : Math.sin(convertAngle(value));
        break;
      case 'cos':
        result = isSecondFunction ? convertFromRadians(Math.acos(value)) : Math.cos(convertAngle(value));
        break;
      case 'tan':
        result = isSecondFunction ? convertFromRadians(Math.atan(value)) : Math.tan(convertAngle(value));
        break;
      case 'log':
        result = isSecondFunction ? Math.pow(10, value) : Math.log10(value);
        break;
      case 'ln':
        result = isSecondFunction ? Math.exp(value) : Math.log(value);
        break;
      case 'sqrt':
        result = isSecondFunction ? value * value : Math.sqrt(value);
        break;
      case 'cbrt':
        result = isSecondFunction ? Math.pow(value, 3) : Math.cbrt(value);
        break;
      case 'factorial':
        result = factorial(Math.floor(value));
        break;
      case 'reciprocal':
        result = 1 / value;
        break;
      case 'percent':
        result = value / 100;
        break;
      case 'pi':
        result = Math.PI;
        break;
      case 'e':
        result = Math.E;
        break;
      case 'abs':
        result = Math.abs(value);
        break;
      case 'negate':
        result = -value;
        break;
      case 'random':
        result = Math.random();
        break;
      default:
        result = value;
    }

    setDisplay(String(result));
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(true);
    setIsSecondFunction(false);
  };

  const factorial = (n: number): number => {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
  };

  const memoryOperation = (op: string) => {
    const value = parseFloat(display);
    switch (op) {
      case 'MC':
        setMemory(0);
        break;
      case 'MR':
        setDisplay(String(memory));
        setWaitingForOperand(true);
        break;
      case 'M+':
        setMemory(memory + value);
        break;
      case 'M-':
        setMemory(memory - value);
        break;
      case 'MS':
        setMemory(value);
        break;
    }
  };

  const clear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  const clearEntry = () => {
    setDisplay('0');
    setWaitingForOperand(false);
  };

  const backspace = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  const Button: React.FC<{
    onClick: () => void;
    className?: string;
    children: React.ReactNode;
    disabled?: boolean;
  }> = ({ onClick, className = '', children, disabled = false }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`h-12 rounded-lg font-semibold transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </button>
  );

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
          <Calculator className="w-8 h-8 text-purple-500" />
          Scientific Calculator (Casio fx-991ES Plus Style)
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
          {/* Display */}
          <div className="bg-gray-900 text-white p-4 rounded-lg mb-4">
            <div className="flex justify-between items-center mb-2">
              <div className="flex gap-4 text-sm">
                <span className={`px-2 py-1 rounded ${angleMode === 'DEG' ? 'bg-blue-600' : 'bg-gray-700'}`}>
                  DEG
                </span>
                <span className={`px-2 py-1 rounded ${angleMode === 'RAD' ? 'bg-blue-600' : 'bg-gray-700'}`}>
                  RAD
                </span>
                <span className={`px-2 py-1 rounded ${angleMode === 'GRAD' ? 'bg-blue-600' : 'bg-gray-700'}`}>
                  GRAD
                </span>
                {memory !== 0 && <span className="px-2 py-1 bg-yellow-600 rounded">M</span>}
                {isSecondFunction && <span className="px-2 py-1 bg-red-600 rounded">2nd</span>}
              </div>
            </div>
            <div className="text-right text-4xl font-mono">
              {display}
            </div>
          </div>

          {/* Calculator Layout */}
          <div className="grid grid-cols-8 gap-2">
            {/* Row 1 - Mode and Memory */}
            <Button
              onClick={() => setAngleMode(angleMode === 'DEG' ? 'RAD' : angleMode === 'RAD' ? 'GRAD' : 'DEG')}
              className="bg-gray-500 text-white hover:bg-gray-600"
            >
              {angleMode}
            </Button>
            <Button
              onClick={() => setIsSecondFunction(!isSecondFunction)}
              className={`text-white hover:bg-red-600 ${isSecondFunction ? 'bg-red-500' : 'bg-gray-500'}`}
            >
              2nd
            </Button>
            <Button
              onClick={() => memoryOperation('MC')}
              className="bg-orange-500 text-white hover:bg-orange-600"
            >
              MC
            </Button>
            <Button
              onClick={() => memoryOperation('MR')}
              className="bg-orange-500 text-white hover:bg-orange-600"
            >
              MR
            </Button>
            <Button
              onClick={() => memoryOperation('M+')}
              className="bg-orange-500 text-white hover:bg-orange-600"
            >
              M+
            </Button>
            <Button
              onClick={() => memoryOperation('M-')}
              className="bg-orange-500 text-white hover:bg-orange-600"
            >
              M-
            </Button>
            <Button
              onClick={() => memoryOperation('MS')}
              className="bg-orange-500 text-white hover:bg-orange-600"
            >
              MS
            </Button>
            <Button
              onClick={() => performFunction('random')}
              className="bg-blue-500 text-white hover:bg-blue-600"
            >
              RAN#
            </Button>

            {/* Row 2 - Advanced Functions */}
            <Button
              onClick={() => performFunction('sin')}
              className="bg-blue-500 text-white hover:bg-blue-600"
            >
              {isSecondFunction ? 'sin⁻¹' : 'sin'}
            </Button>
            <Button
              onClick={() => performFunction('cos')}
              className="bg-blue-500 text-white hover:bg-blue-600"
            >
              {isSecondFunction ? 'cos⁻¹' : 'cos'}
            </Button>
            <Button
              onClick={() => performFunction('tan')}
              className="bg-blue-500 text-white hover:bg-blue-600"
            >
              {isSecondFunction ? 'tan⁻¹' : 'tan'}
            </Button>
            <Button
              onClick={() => performFunction('log')}
              className="bg-blue-500 text-white hover:bg-blue-600"
            >
              {isSecondFunction ? '10ˣ' : 'log'}
            </Button>
            <Button
              onClick={() => performFunction('ln')}
              className="bg-blue-500 text-white hover:bg-blue-600"
            >
              {isSecondFunction ? 'eˣ' : 'ln'}
            </Button>
            <Button
              onClick={() => performFunction('sqrt')}
              className="bg-blue-500 text-white hover:bg-blue-600"
            >
              {isSecondFunction ? 'x²' : '√'}
            </Button>
            <Button
              onClick={() => performFunction('cbrt')}
              className="bg-blue-500 text-white hover:bg-blue-600"
            >
              {isSecondFunction ? 'x³' : '∛'}
            </Button>
            <Button
              onClick={() => inputOperation('^')}
              className="bg-blue-500 text-white hover:bg-blue-600"
            >
              xʸ
            </Button>

            {/* Row 3 - Constants and Functions */}
            <Button
              onClick={() => performFunction('pi')}
              className="bg-green-500 text-white hover:bg-green-600"
            >
              π
            </Button>
            <Button
              onClick={() => performFunction('e')}
              className="bg-green-500 text-white hover:bg-green-600"
            >
              e
            </Button>
            <Button
              onClick={() => performFunction('factorial')}
              className="bg-blue-500 text-white hover:bg-blue-600"
            >
              n!
            </Button>
            <Button
              onClick={() => performFunction('reciprocal')}
              className="bg-blue-500 text-white hover:bg-blue-600"
            >
              1/x
            </Button>
            <Button
              onClick={() => performFunction('abs')}
              className="bg-blue-500 text-white hover:bg-blue-600"
            >
              |x|
            </Button>
            <Button
              onClick={() => inputOperation('mod')}
              className="bg-blue-500 text-white hover:bg-blue-600"
            >
              mod
            </Button>
            <Button
              onClick={() => performFunction('percent')}
              className="bg-blue-500 text-white hover:bg-blue-600"
            >
              %
            </Button>
            <Button
              onClick={() => performFunction('negate')}
              className="bg-blue-500 text-white hover:bg-blue-600"
            >
              +/-
            </Button>

            {/* Row 4 - Clear and Backspace */}
            <Button
              onClick={clear}
              className="bg-red-500 text-white hover:bg-red-600 col-span-2 flex items-center justify-center gap-1"
            >
              <RotateCcw className="w-4 h-4" />
              AC
            </Button>
            <Button
              onClick={clearEntry}
              className="bg-orange-500 text-white hover:bg-orange-600 flex items-center justify-center gap-1"
            >
              CE
            </Button>
            <Button
              onClick={backspace}
              className="bg-orange-500 text-white hover:bg-orange-600 flex items-center justify-center gap-1"
            >
              <Delete className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => inputOperation('/')}
              className="bg-orange-500 text-white hover:bg-orange-600"
            >
              ÷
            </Button>
            <Button
              onClick={() => inputOperation('*')}
              className="bg-orange-500 text-white hover:bg-orange-600"
            >
              ×
            </Button>
            <Button
              onClick={() => inputOperation('-')}
              className="bg-orange-500 text-white hover:bg-orange-600"
            >
              -
            </Button>
            <Button
              onClick={() => inputOperation('+')}
              className="bg-orange-500 text-white hover:bg-orange-600"
            >
              +
            </Button>

            {/* Rows 5-7 - Number Pad */}
            <Button
              onClick={() => inputNumber('7')}
              className="bg-gray-200 text-gray-800 hover:bg-gray-300"
            >
              7
            </Button>
            <Button
              onClick={() => inputNumber('8')}
              className="bg-gray-200 text-gray-800 hover:bg-gray-300"
            >
              8
            </Button>
            <Button
              onClick={() => inputNumber('9')}
              className="bg-gray-200 text-gray-800 hover:bg-gray-300"
            >
              9
            </Button>
            <Button
              onClick={() => inputNumber('4')}
              className="bg-gray-200 text-gray-800 hover:bg-gray-300"
            >
              4
            </Button>
            <Button
              onClick={() => inputNumber('5')}
              className="bg-gray-200 text-gray-800 hover:bg-gray-300"
            >
              5
            </Button>
            <Button
              onClick={() => inputNumber('6')}
              className="bg-gray-200 text-gray-800 hover:bg-gray-300"
            >
              6
            </Button>
            <Button
              onClick={() => inputNumber('1')}
              className="bg-gray-200 text-gray-800 hover:bg-gray-300"
            >
              1
            </Button>
            <Button
              onClick={() => inputNumber('2')}
              className="bg-gray-200 text-gray-800 hover:bg-gray-300"
            >
              2
            </Button>

            <Button
              onClick={() => inputNumber('3')}
              className="bg-gray-200 text-gray-800 hover:bg-gray-300"
            >
              3
            </Button>
            <Button
              onClick={() => inputNumber('0')}
              className="bg-gray-200 text-gray-800 hover:bg-gray-300 col-span-2"
            >
              0
            </Button>
            <Button
              onClick={inputDecimal}
              className="bg-gray-200 text-gray-800 hover:bg-gray-300"
            >
              .
            </Button>
            <Button
              onClick={() => inputOperation('=')}
              className="bg-green-500 text-white hover:bg-green-600 col-span-4"
            >
              =
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScientificCalculator;