import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { logout } from "@/lib/auth";
import { validateCrosswordWord, validateCrosswordAll, saveCrosswordProgress, getCrosswordProgress } from "@/lib/validation";
import retroBg from "@/assets/retro-gaming-bg.jpg";

interface CrosswordClue {
  number: number;
  direction: 'across' | 'down';
  clue: string;
  startRow: number;
  startCol: number;
  length: number;
}

const Level3Game = () => {
  // Crossword layout - adding 3 columns to the left (shift all by +3)
  const clues: CrosswordClue[] = [
    // Row 0: 1-across (4 letters), 2-down starts from last letter of 1-across
    { number: 1, direction: 'across', clue: "Went on vacation to Mauritius this year", startRow: 0, startCol: 3, length: 4 },
    { number: 2, direction: 'down', clue: "Mr. Event Coordinator", startRow: 0, startCol: 6, length: 5 },
    
    // Row 4: 3-across intersects with 2-down at row 4, col 6
    { number: 3, direction: 'across', clue: "Into Music Production", startRow: 4, startCol: 4, length: 5 },
    { number: 3, direction: 'down', clue: "Bollywood Music Lover", startRow: 4, startCol: 4, length: 5 },
    
    // Row 7: 4-across starts from 4th letter of 3-down
    { number: 4, direction: 'across', clue: "Innovation Award Winner", startRow: 7, startCol: 4, length: 7 },
    
    // 5-down starts from 6th letter of 4-across
    { number: 5, direction: 'down', clue: "a Delhite who Plays Guitar", startRow: 7, startCol: 9, length: 5 },
    
    // 9-across where 5th letter intersects with 3rd letter of 5-down
    { number: 9, direction: 'across', clue: "Got married in February", startRow: 9, startCol: 5, length: 7 },
    
    // 9-down
    { number: 9, direction: 'down', clue: "Son graduated HS this year", startRow: 9, startCol: 5, length: 4 },
    
    // 8-down - 3rd letter is 1st of 10-across, 5th letter is 1st of 12-across
    { number: 8, direction: 'down', clue: "Can't disclose due to privacy issues :P", startRow: 8, startCol: 0, length: 6 },
    
    // 10-across - last letter matches 2nd letter of 9-down
    { number: 10, direction: 'across', clue: "Selfie Queen!", startRow: 10, startCol: 0, length: 6 },
    
    // 6-across - 2nd letter is first letter of 7-down
    { number: 6, direction: 'across', clue: "Grew up on a farm", startRow: 7, startCol: 14, length: 5 },
    
    // 7-down - 5th letter matches last letter of 11-across
    { number: 7, direction: 'down', clue: "The Leader. The Fighter. The Inspiration", startRow: 7, startCol: 15, length: 6 },
    
    // 11-across - first letter matches last letter of 5-down
    { number: 11, direction: 'across', clue: "Getting married in December", startRow: 11, startCol: 9, length: 7 },
    
    // 12-across - last letter matches last letter of 9-down
    { number: 12, direction: 'across', clue: "Table Tennis Wizard", startRow: 12, startCol: 0, length: 6 }
  ];

  const [grid, setGrid] = useState<string[][]>(() => {
    // Initialize 14x19 grid with empty strings (removed 1 row, 4 columns)
    return Array(14).fill(null).map(() => Array(19).fill(''));
  });

  const [selectedWord, setSelectedWord] = useState<CrosswordClue | null>(null);
  const [selectedCell, setSelectedCell] = useState<{row: number, col: number} | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [score, setScore] = useState(0);
  const [completedWords, setCompletedWords] = useState(0);
  const [lockedWords, setLockedWords] = useState<Set<string>>(new Set());
  const [incorrectWords, setIncorrectWords] = useState<Set<string>>(new Set());
  const [correctWords, setCorrectWords] = useState<Set<string>>(new Set());
  const [showExitWarning, setShowExitWarning] = useState(false);
  const [exitAction, setExitAction] = useState<'home' | 'logout'>('home');
  const [isCheckingWord, setIsCheckingWord] = useState(false);
  // isCheckingAll removed - no longer needed
  const [isLoading, setIsLoading] = useState(true);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  const { isAuthenticated } = useAuth();
  const inputRefs = useRef<(HTMLInputElement | null)[][]>(
    Array(14).fill(null).map(() => Array(19).fill(null))
  );

  // Load saved progress on component mount
  useEffect(() => {
    const loadProgress = async () => {
      if (!isAuthenticated) {
        setIsLoading(false);
        return;
      }

      const progress = await getCrosswordProgress();
      if (progress.success) {
        setAnswers(progress.answers);
        setScore(progress.score);
        setCompletedWords(progress.completedWords);
        
        // Rebuild grid from saved answers
        const newGrid = Array(14).fill(null).map(() => Array(19).fill(''));
        const completedWordsSet = new Set<string>();
        
        Object.entries(progress.answers).forEach(([wordKey, answer]) => {
          const clue = clues.find(c => `${c.number}-${c.direction}` === wordKey);
          if (clue && answer.length === clue.length) {
            // Fill grid with saved answer
            for (let i = 0; i < clue.length; i++) {
              const row = clue.direction === 'across' ? clue.startRow : clue.startRow + i;
              const col = clue.direction === 'across' ? clue.startCol + i : clue.startCol;
              newGrid[row][col] = answer[i];
            }
            completedWordsSet.add(wordKey);
          }
        });
        
        setGrid(newGrid);
        setLockedWords(completedWordsSet); // Treat saved completed words as locked
      }
      
      setIsLoading(false);
    };

    loadProgress();
  }, [isAuthenticated]);

  // No auto-save - only save on validation

  // Create a map of which cells belong to which words
  const cellToWords = new Map<string, CrosswordClue[]>();
  
  clues.forEach(clue => {
    for (let i = 0; i < clue.length; i++) {
      const row = clue.direction === 'across' ? clue.startRow : clue.startRow + i;
      const col = clue.direction === 'across' ? clue.startCol + i : clue.startCol;
      const key = `${row}-${col}`;
      
      if (!cellToWords.has(key)) {
        cellToWords.set(key, []);
      }
      cellToWords.get(key)!.push(clue);
    }
  });

  // Determine which cells are part of the crossword (not black squares)
  const isValidCell = (row: number, col: number): boolean => {
    return cellToWords.has(`${row}-${col}`);
  };

  const handleCellClick = (row: number, col: number) => {
    if (!isValidCell(row, col)) return;

    const cellWordsForClick = cellToWords.get(`${row}-${col}`) || [];
    
    if (cellWordsForClick.length === 0) return;

    // If clicking the same cell and there are multiple words, cycle between them
    if (selectedCell?.row === row && selectedCell?.col === col && cellWordsForClick.length > 1) {
      const currentIndex = cellWordsForClick.findIndex(word => 
        word.number === selectedWord?.number && word.direction === selectedWord?.direction
      );
      const nextIndex = (currentIndex + 1) % cellWordsForClick.length;
      setSelectedWord(cellWordsForClick[nextIndex]);
    } else {
      // Select the first word for this cell
      setSelectedWord(cellWordsForClick[0]);
    }

    setSelectedCell({row, col});
    
    // Focus the input
    if (inputRefs.current[row][col]) {
      inputRefs.current[row][col]?.focus();
    }
  };

  const handleInputChange = (row: number, col: number, value: string) => {
    if (!selectedWord) return;
    
    // Check if this word is locked (already correct)
    const wordKey = `${selectedWord.number}-${selectedWord.direction}`;
    if (lockedWords.has(wordKey)) return;

    const newValue = value.toUpperCase().slice(-1); // Only keep last character, uppercase
    
    // Update grid
    const newGrid = [...grid];
    newGrid[row][col] = newValue;
    setGrid(newGrid);

    // Update answers object
    const currentAnswer = answers[wordKey] || '';
    
    // Calculate position in word
    const positionInWord = selectedWord.direction === 'across' 
      ? col - selectedWord.startCol 
      : row - selectedWord.startRow;
    
    // Update the answer string
    const answerArray = currentAnswer.split('');
    while (answerArray.length <= positionInWord) {
      answerArray.push('');
    }
    answerArray[positionInWord] = newValue;
    
    const newAnswer = answerArray.join('');
    const updatedAnswers = {
      ...answers,
      [wordKey]: newAnswer
    };
    setAnswers(updatedAnswers);
    
    // No auto-save - only save on validation

    // Auto-advance to next cell if there's a value
    if (newValue && positionInWord < selectedWord.length - 1) {
      const nextRow = selectedWord.direction === 'across' ? row : row + 1;
      const nextCol = selectedWord.direction === 'across' ? col + 1 : col;
      
      if (inputRefs.current[nextRow] && inputRefs.current[nextRow][nextCol]) {
        inputRefs.current[nextRow][nextCol]?.focus();
        setSelectedCell({row: nextRow, col: nextCol});
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, row: number, col: number) => {
    if (!selectedWord) return;

    if (e.key === 'Backspace' && !grid[row][col]) {
      // Move to previous cell if current is empty
      const positionInWord = selectedWord.direction === 'across' 
        ? col - selectedWord.startCol 
        : row - selectedWord.startRow;
      
      if (positionInWord > 0) {
        const prevRow = selectedWord.direction === 'across' ? row : row - 1;
        const prevCol = selectedWord.direction === 'across' ? col - 1 : col;
        
        if (inputRefs.current[prevRow] && inputRefs.current[prevRow][prevCol]) {
          inputRefs.current[prevRow][prevCol]?.focus();
          setSelectedCell({row: prevRow, col: prevCol});
        }
      }
    }
  };

  const isCellInSelectedWord = (row: number, col: number): boolean => {
    if (!selectedWord) return false;
    
    const isInRange = selectedWord.direction === 'across'
      ? row === selectedWord.startRow && 
        col >= selectedWord.startCol && 
        col < selectedWord.startCol + selectedWord.length
      : col === selectedWord.startCol && 
        row >= selectedWord.startRow && 
        row < selectedWord.startRow + selectedWord.length;
    
    return isInRange;
  };

  const getCellNumber = (row: number, col: number): number | null => {
    const clue = clues.find(c => c.startRow === row && c.startCol === col);
    return clue ? clue.number : null;
  };

  const handleNavigation = (path: string) => {
    // Check if user has unsaved progress (letters in grid but not checked)
    let hasUnsavedProgress = false;
    clues.forEach(clue => {
      const wordKey = `${clue.number}-${clue.direction}`;
      let gridAnswer = '';
      for (let i = 0; i < clue.length; i++) {
        const checkRow = clue.direction === 'across' ? clue.startRow : clue.startRow + i;
        const checkCol = clue.direction === 'across' ? clue.startCol + i : clue.startCol;
        gridAnswer += grid[checkRow][checkCol] || '';
      }
      // If there's text in grid but word is not locked (saved), it's unsaved
      if (gridAnswer.length > 0 && !lockedWords.has(wordKey)) {
        hasUnsavedProgress = true;
      }
    });

    if (hasUnsavedProgress) {
      setExitAction('home');
      setShowExitWarning(true);
      return;
    }
    window.location.href = path;
  };

  const saveProgressOnExit = async () => {
    // No longer auto-saving on exit since Check All is removed
    // Progress is only saved via Check Word clicks
    console.log('Exiting without auto-save - progress saved via Check Word only');
  };

  const confirmExit = (action: 'home' | 'logout') => {
    setShowExitWarning(false);
    if (action === 'logout') {
      logout();
    } else {
      window.location.href = '/';
    }
  };

  const checkWord = async () => {
    if (!selectedWord || isCheckingWord) return;
    
    setIsCheckingWord(true);
    const wordKey = `${selectedWord.number}-${selectedWord.direction}`;
    
    // Build the complete word from grid
    let gridAnswer = '';
    for (let i = 0; i < selectedWord.length; i++) {
      const checkRow = selectedWord.direction === 'across' ? selectedWord.startRow : selectedWord.startRow + i;
      const checkCol = selectedWord.direction === 'across' ? selectedWord.startCol + i : selectedWord.startCol;
      gridAnswer += grid[checkRow][checkCol] || '';
    }
    
    // Validate with server
    const result = await validateCrosswordWord(selectedWord.number, selectedWord.direction, gridAnswer);
    
    console.log('Check Word server result:', result);
    
    // Always update score and progress from server (server knows the current total)
    if (result.success) {
      console.log('Updating score from', score, 'to', result.score);
      console.log('Updating completed words from', completedWords, 'to', result.completedWords);
      
      // Check if crossword just completed (all 14 words)
      const wasCompleted = completedWords === 14;
      const isNowCompleted = result.completedWords === 14;
      
      if (!wasCompleted && isNowCompleted) {
        // Just completed! Show celebration popup
        setFinalScore(result.score);
        setShowCompletionModal(true);
      }
      
      setScore(result.score);
      setCompletedWords(result.completedWords);
    }
    
    if (result.success && result.isCorrect) {
      setCorrectWords(prev => new Set([...prev, wordKey]));
      setIncorrectWords(prev => {
        const newSet = new Set(prev);
        newSet.delete(wordKey);
        return newSet;
      });
      
      // Fill in the correct answer in the grid if we have it
      if (result.correctAnswer) {
        const newGrid = [...grid];
        for (let i = 0; i < selectedWord.length; i++) {
          const fillRow = selectedWord.direction === 'across' ? selectedWord.startRow : selectedWord.startRow + i;
          const fillCol = selectedWord.direction === 'across' ? selectedWord.startCol + i : selectedWord.startCol;
          newGrid[fillRow][fillCol] = result.correctAnswer[i];
        }
        setGrid(newGrid);
      }
      
      // Show green for 1 second, then lock to grey
      setTimeout(() => {
        setCorrectWords(prev => {
          const newSet = new Set(prev);
          newSet.delete(wordKey);
          return newSet;
        });
        setLockedWords(prev => new Set([...prev, wordKey]));
      }, 1000);
    } else if (result.success && !result.isCorrect) {
      // Mark as incorrect and clear the word
      setIncorrectWords(prev => new Set([...prev, wordKey]));
      setAnswers(prev => ({ ...prev, [wordKey]: '' }));
      
      // Clear grid cells for this word, but preserve intersections with locked words
      const newGrid = [...grid];
      for (let i = 0; i < selectedWord.length; i++) {
        const clearRow = selectedWord.direction === 'across' ? selectedWord.startRow : selectedWord.startRow + i;
        const clearCol = selectedWord.direction === 'across' ? selectedWord.startCol + i : selectedWord.startCol;
        
        // Check if this cell belongs to any locked OR completed word
        const cellWordsAtPosition = cellToWords.get(`${clearRow}-${clearCol}`) || [];
        const hasLockedWord = cellWordsAtPosition.some(word => 
          lockedWords.has(`${word.number}-${word.direction}`) && 
          `${word.number}-${word.direction}` !== wordKey
        );
        
        // Only clear if no other locked word uses this cell
        if (!hasLockedWord) {
          newGrid[clearRow][clearCol] = '';
        }
      }
      setGrid(newGrid);
      
      // Remove from incorrect after a delay
      setTimeout(() => {
        setIncorrectWords(prev => {
          const newSet = new Set(prev);
          newSet.delete(wordKey);
          return newSet;
        });
      }, 2000);
    }
    
    setIsCheckingWord(false);
  };

  // Check All function removed - using individual Check Word only

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl font-retro glow-cyan animate-pulse mb-4">
            ⏳ LOADING CROSSWORD...
          </div>
          <div className="text-lg font-pixel glow-purple">
            Restoring your progress
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-background relative overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.85), rgba(0, 0, 0, 0.9)), url(${retroBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 retro-grid opacity-20"></div>
      <div className="absolute inset-0 scanlines"></div>
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-retro font-black mb-4 glow-pink animate-pulse-border">
            🧩 CROSSWORD CONQUEST
          </h1>
          
          <p className="text-lg font-pixel glow-purple mb-6">
            Test your team knowledge with this brain-bending crossword! 🧠⚡
          </p>
        </header>

        {/* Score and Progress Display */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-8 bg-background/70 border border-neon-cyan rounded-lg p-4">
            <div className="text-center">
              <div className="text-lg font-retro glow-cyan">SCORE</div>
              <div className="text-2xl font-pixel text-neon-green">{score}</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-retro glow-cyan">PROGRESS</div>
              <div className="text-2xl font-pixel text-neon-green">
                {completedWords}/{clues.length}
              </div>
            </div>
          </div>
        </div>

        {/* Current Clue Display */}
        {selectedWord && (
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-4 bg-gradient-to-r from-neon-pink/20 to-neon-cyan/20 border-2 border-neon-pink rounded-full px-6 py-3 animate-pulse-border">
              <span className="text-lg font-pixel glow-pink">
                {selectedWord.number}-{selectedWord.direction.toUpperCase()}
              </span>
              <div className="text-lg font-retro glow-cyan">
                {selectedWord.clue}
              </div>
              <span className="text-lg">({selectedWord.length} letters)</span>
            </div>
          </div>
        )}

        {/* Check Button */}
        <div className="flex justify-center mb-6">
          <Button
            onClick={checkWord}
            disabled={!selectedWord || isCheckingWord}
            className="font-retro bg-neon-purple hover:bg-neon-pink"
          >
            {isCheckingWord ? "⏳ CHECKING..." : "✓ CHECK WORD"}
          </Button>
        </div>

        {/* Progress Saving Message */}
        <div className="text-center mb-6">
          <div className="inline-block bg-neon-cyan/10 border border-neon-cyan/30 rounded-lg p-3 max-w-md">
            <p className="font-pixel text-sm text-neon-cyan">
              💾 Click "CHECK WORD" to save your progress for each completed word
            </p>
          </div>
        </div>

        {/* Crossword Grid */}
        <div className="flex justify-center mb-8">
          <div className="grid gap-1 bg-background/70 p-4 rounded-lg border border-neon-cyan" style={{gridTemplateColumns: 'repeat(19, minmax(0, 1fr))'}}>
            {Array(14).fill(null).map((_, row) => 
              Array(19).fill(null).map((_, col) => {
                const isValid = isValidCell(row, col);
                const cellNumber = getCellNumber(row, col);
                const isSelected = selectedCell?.row === row && selectedCell?.col === col;
                const isInSelectedWord = isCellInSelectedWord(row, col);
                const isWordLocked = selectedWord && lockedWords.has(`${selectedWord.number}-${selectedWord.direction}`);
                
                if (!isValid) {
                  // Black square
                  return (
                    <div
                      key={`${row}-${col}`}
                      className="w-9 h-9 bg-black border border-gray-600"
                    />
                  );
                }

                // Check if this cell belongs to any locked, correct, or incorrect word
                const cellWordsForGrid = cellToWords.get(`${row}-${col}`) || [];
                const isCellLocked = cellWordsForGrid.some(word => 
                  lockedWords.has(`${word.number}-${word.direction}`)
                );
                const isCellCorrect = cellWordsForGrid.some(word => 
                  correctWords.has(`${word.number}-${word.direction}`)
                );
                const isCellIncorrect = cellWordsForGrid.some(word => 
                  incorrectWords.has(`${word.number}-${word.direction}`)
                );

                return (
                  <div
                    key={`${row}-${col}`}
                    className={`relative w-9 h-9 border-2 cursor-pointer transition-all duration-200 ${
                      isCellLocked
                        ? 'border-gray-500 bg-gray-300 cursor-not-allowed'
                        : isCellCorrect
                          ? 'border-green-500 bg-green-200 animate-pulse'
                          : isCellIncorrect
                            ? 'border-red-500 bg-red-200 animate-pulse'
                            : isSelected 
                              ? 'border-neon-pink bg-neon-pink/30' 
                              : isInSelectedWord
                                ? 'border-neon-cyan bg-neon-cyan/20'
                                : 'border-gray-400 bg-white hover:border-neon-purple'
                    }`}
                    onClick={() => !isCellLocked && handleCellClick(row, col)}
                  >
                    {cellNumber && (
                      <span className="absolute top-0 left-0 text-xs font-bold text-black leading-none p-0.5">
                        {cellNumber}
                      </span>
                    )}
                    <input
                      ref={el => inputRefs.current[row][col] = el}
                      type="text"
                      value={grid[row][col]}
                      onChange={(e) => handleInputChange(row, col, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, row, col)}
                      disabled={isCellLocked}
                      className={`w-full h-full text-center text-sm font-bold bg-transparent border-none outline-none caret-transparent ${
                        isCellLocked ? 'text-gray-600 cursor-not-allowed' : 'text-black'
                      }`}
                      maxLength={1}
                    />
                  </div>
                );
              })
            )}
          </div>
        </div>


        {/* Current Clue Display - Bottom */}
        {selectedWord && (
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-4 bg-gradient-to-r from-neon-pink/20 to-neon-cyan/20 border-2 border-neon-pink rounded-full px-6 py-3 animate-pulse-border">
              <span className="text-lg font-pixel glow-pink">
                {selectedWord.number}-{selectedWord.direction.toUpperCase()}
              </span>
              <div className="text-lg font-retro glow-cyan">
                {selectedWord.clue}
              </div>
              <span className="text-lg">({selectedWord.length} letters)</span>
            </div>
          </div>
        )}

        {/* Check Button - Bottom */}
        <div className="flex justify-center mb-8">
          <Button
            onClick={checkWord}
            disabled={!selectedWord || isCheckingWord}
            className="font-retro bg-neon-purple hover:bg-neon-pink"
          >
            {isCheckingWord ? "⏳ CHECKING..." : "✓ CHECK WORD"}
          </Button>
        </div>

        {/* Clues Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto mb-8">
          {/* Across Clues */}
          <Card className="p-6 bg-card/90 border-2 border-neon-purple">
            <h3 className="text-xl font-retro glow-purple text-center mb-4">
              ➡️ ACROSS
            </h3>
            <div className="space-y-2">
              {clues.filter(clue => clue.direction === 'across').map(clue => {
                const wordKey = `${clue.number}-${clue.direction}`;
                const isCompleted = lockedWords.has(wordKey);
                const isActive = selectedWord?.number === clue.number && selectedWord?.direction === clue.direction;
                
                return (
                  <div
                    key={wordKey}
                    className={`p-2 rounded cursor-pointer transition-all ${
                      isActive 
                        ? 'bg-neon-pink/20 border border-neon-pink' 
                        : isCompleted
                          ? 'bg-neon-green/20 border border-neon-green'
                          : 'hover:bg-gray-700/50'
                    }`}
                    onClick={() => {
                      setSelectedWord(clue);
                      setSelectedCell({row: clue.startRow, col: clue.startCol});
                      inputRefs.current[clue.startRow][clue.startCol]?.focus();
                    }}
                  >
                    <span className="font-pixel text-sm">
                      <strong>{clue.number}.</strong> {clue.clue}
                      {isCompleted && <span className="ml-2">✅</span>}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Down Clues */}
          <Card className="p-6 bg-card/90 border-2 border-neon-cyan">
            <h3 className="text-xl font-retro glow-cyan text-center mb-4">
              ⬇️ DOWN
            </h3>
            <div className="space-y-2">
              {clues.filter(clue => clue.direction === 'down').map(clue => {
                const wordKey = `${clue.number}-${clue.direction}`;
                const isCompleted = lockedWords.has(wordKey);
                const isActive = selectedWord?.number === clue.number && selectedWord?.direction === clue.direction;
                
                return (
                  <div
                    key={wordKey}
                    className={`p-2 rounded cursor-pointer transition-all ${
                      isActive 
                        ? 'bg-neon-cyan/20 border border-neon-cyan' 
                        : isCompleted
                          ? 'bg-neon-green/20 border border-neon-green'
                          : 'hover:bg-gray-700/50'
                    }`}
                    onClick={() => {
                      setSelectedWord(clue);
                      setSelectedCell({row: clue.startRow, col: clue.startCol});
                      inputRefs.current[clue.startRow][clue.startCol]?.focus();
                    }}
                  >
                    <span className="font-pixel text-sm">
                      <strong>{clue.number}.</strong> {clue.clue}
                      {isCompleted && <span className="ml-2">✅</span>}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>


        {/* Navigation Buttons */}
        <div className="flex justify-center gap-4 mb-8">
          <Button
            onClick={() => handleNavigation('/')}
            variant="outline"
            size="sm"
            className="font-pixel border-neon-cyan text-neon-cyan hover:bg-neon-cyan/20"
          >
            🏠 HOME
          </Button>
          <Button
            onClick={() => {
              // Check for unsaved progress before logout
              let hasUnsavedProgress = false;
              clues.forEach(clue => {
                const wordKey = `${clue.number}-${clue.direction}`;
                let gridAnswer = '';
                for (let i = 0; i < clue.length; i++) {
                  const checkRow = clue.direction === 'across' ? clue.startRow : clue.startRow + i;
                  const checkCol = clue.direction === 'across' ? clue.startCol + i : clue.startCol;
                  gridAnswer += grid[checkRow][checkCol] || '';
                }
                if (gridAnswer.length > 0 && !lockedWords.has(wordKey)) {
                  hasUnsavedProgress = true;
                }
              });

              if (hasUnsavedProgress) {
                setExitAction('logout');
                setShowExitWarning(true);
              } else {
                logout();
              }
            }}
            variant="outline"
            size="sm"
            className="font-pixel border-neon-red text-neon-red hover:bg-neon-red/20"
          >
            🚪 LOGOUT
          </Button>
        </div>

        {/* Completion Modal */}
        {showCompletionModal && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[120] flex items-center justify-center p-4">
            <Card className="max-w-lg w-full p-8 bg-card/95 border-4 border-neon-cyan animate-pulse-border">
              <div className="text-center">
                <div className="text-6xl mb-6 animate-bounce">🧩</div>
                <h1 className="text-4xl font-retro font-black mb-4 glow-pink animate-pulse">
                  CROSSWORD CONQUEST
                </h1>
                <h2 className="text-2xl font-retro glow-cyan mb-2">
                  COMPLETE!
                </h2>
                
                <div className="bg-background/70 border border-neon-purple rounded-lg p-6 mb-6">
                  <div className="text-4xl font-retro glow-pink mb-2">
                    {finalScore} POINTS
                  </div>
                  <p className="font-pixel text-sm text-gray-300">
                    All 14 words conquered!
                  </p>
                </div>
                
                <div className="bg-neon-green/10 border border-neon-green/30 rounded-lg p-4 mb-6">
                  <p className="font-pixel text-sm glow-green animate-pulse">
                    🎉 Legendary! You've mastered the ultimate SI team knowledge challenge! Your crossword prowess is unmatched! ✨
                  </p>
                </div>
                
                <div className="flex gap-4 justify-center">
                  <Button
                    onClick={() => {
                      setShowCompletionModal(false);
                      window.location.href = '/';
                    }}
                    className="font-retro bg-neon-cyan hover:bg-neon-purple"
                  >
                    🏠 RETURN HOME
                  </Button>
                  <Button
                    onClick={() => setShowCompletionModal(false)}
                    variant="outline"
                    className="font-retro border-neon-pink text-neon-pink hover:bg-neon-pink/20"
                  >
                    🧩 ADMIRE CROSSWORD
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Exit Warning Modal */}
        {showExitWarning && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
            <Card className="max-w-md w-full p-6 bg-card/95 border-2 border-neon-red animate-pulse-border">
              <div className="text-center">
                <div className="text-4xl mb-4">⚠️</div>
                <h3 className="text-xl font-retro glow-red mb-4">UNSAVED PROGRESS!</h3>
                <p className="font-pixel text-sm mb-6">
                  If you have words filled in the crossword that haven't been checked and saved yet, use "CHECK WORD" to save your progress before leaving.
                </p>
                
                <div className="flex gap-3 justify-center">
                  <Button
                    onClick={() => setShowExitWarning(false)}
                    className="font-retro bg-neon-green hover:bg-neon-cyan"
                  >
                    🔄 CONTINUE PLAYING
                  </Button>
                  <Button
                    onClick={() => confirmExit(exitAction)}
                    variant="outline"
                    className="font-retro border-neon-red text-neon-red hover:bg-neon-red/20"
                  >
                    🚪 LEAVE ANYWAY
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

      </div>
    </div>
  );
};

export default Level3Game;