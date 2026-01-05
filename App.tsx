import React, { useState, useEffect } from 'react';
import { Student, LayoutConfig, ParsingStatus, Constraint } from './types';
import ConfigPanel from './components/ConfigPanel';
import SeatingGrid from './components/SeatingGrid';
import { parseStudentList, optimizeSeatingLayout } from './services/geminiService';
import { resizeGrid, shuffleArray } from './utils/seatingUtils';

const App: React.FC = () => {
  // Master list of unique student objects
  const [students, setStudents] = useState<Student[]>([]);
  
  // The grid configuration
  const [config, setConfig] = useState<LayoutConfig>({
    rows: 5,
    columns: 6,
  });

  // The actual grid state (Students or nulls)
  const [gridData, setGridData] = useState<(Student | null)[]>([]);

  // Constraints and Status
  const [constraints, setConstraints] = useState<Constraint[]>([]);
  const [parsingStatus, setParsingStatus] = useState<ParsingStatus>(ParsingStatus.IDLE);

  // Initialize grid when config changes
  useEffect(() => {
    const totalSeats = config.rows * config.columns;
    setGridData(prevGrid => resizeGrid(prevGrid, totalSeats));
  }, [config.rows, config.columns]);

  const handleConfigChange = (newConfig: LayoutConfig) => {
    setConfig(newConfig);
  };

  const handleParseData = async (boysText: string, girlsText: string) => {
    setParsingStatus(ParsingStatus.PARSING);
    try {
      // Parse concurrently
      const [parsedBoys, parsedGirls] = await Promise.all([
        parseStudentList(boysText),
        parseStudentList(girlsText)
      ]);

      // Assign IDs and Gender for Girls
      const girls: Student[] = parsedGirls.map((s, i) => ({
        ...s,
        classNo: i + 1, // Explicitly number girls 1..N
        gender: 'F',
        id: `student-f-${Date.now()}-${i}`
      }));

      // Assign IDs, Gender, and CONTINUOUS Class Numbers for Boys
      // Boys start counting from (Total Girls + 1)
      const boys: Student[] = parsedBoys.map((s, i) => ({
        ...s,
        gender: 'M',
        classNo: girls.length + i + 1, // Override parsed classNo to ensure continuity
        id: `student-m-${Date.now()}-${i}`
      }));

      // Merge Girls First, then Boys
      const allStudents = [...girls, ...boys];
      setStudents(allStudents);
      setConstraints([]); // Reset constraints on new data
      
      // Auto-size
      if (allStudents.length > 0) {
        const total = allStudents.length;
        const idealCols = config.columns;
        const idealRows = Math.ceil(total / idealCols);
        const newRows = Math.max(config.rows, idealRows);
        
        setConfig(prev => ({ ...prev, rows: newRows }));
        
        // Initial Placement: SHUFFLED (do not follow class number)
        const shuffledStudents = shuffleArray([...allStudents]);
        
        const totalSeats = newRows * idealCols;
        const newGrid = Array(totalSeats).fill(null);
        shuffledStudents.forEach((s, i) => {
          if (i < totalSeats) newGrid[i] = s;
        });
        setGridData(newGrid);
      }
      
      setParsingStatus(ParsingStatus.SUCCESS);
    } catch (error) {
      console.error(error);
      setParsingStatus(ParsingStatus.ERROR);
    }
  };

  const handleAddConstraint = (c: Constraint) => {
    setConstraints(prev => [...prev, c]);
  };

  const handleRemoveConstraint = (id: string) => {
    setConstraints(prev => prev.filter(c => c.id !== id));
  };

  const handleOptimize = async () => {
    setParsingStatus(ParsingStatus.OPTIMIZING);
    try {
      const newGrid = await optimizeSeatingLayout(gridData, constraints, config);
      setGridData(newGrid);
      setParsingStatus(ParsingStatus.SUCCESS);
    } catch (e) {
      console.error(e);
      setParsingStatus(ParsingStatus.ERROR);
    }
  };

  const handleShuffle = () => {
    setGridData(prevGrid => {
      // Extract students
      const studentsOnly = prevGrid.filter(s => s !== null) as Student[];
      // Shuffle them
      const shuffled = shuffleArray(studentsOnly);
      // Create new grid preserving size
      const newGrid = Array(prevGrid.length).fill(null);
      // Fill
      shuffled.forEach((s, i) => {
        if (i < newGrid.length) newGrid[i] = s;
      });
      return newGrid;
    });
  };

  const handleSwapSeats = (fromIndex: number, toIndex: number) => {
    setGridData(prev => {
      const newGrid = [...prev];
      const temp = newGrid[fromIndex];
      newGrid[fromIndex] = newGrid[toIndex];
      newGrid[toIndex] = temp;
      return newGrid;
    });
  };

  return (
    <div className="min-h-screen p-4 flex flex-col items-center bg-slate-50 font-sans">
      <header className="w-full max-w-7xl mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-200">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
             </svg>
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">
              Seating <span className="text-indigo-600">Plan</span>
            </h1>
          </div>
        </div>
      </header>

      <main className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Sidebar: Controls - Compact */}
        <div className="lg:col-span-3 space-y-4">
          <ConfigPanel 
            config={config} 
            onConfigChange={handleConfigChange} 
            onParseData={handleParseData}
            parsingStatus={parsingStatus}
            students={students}
            constraints={constraints}
            onAddConstraint={handleAddConstraint}
            onRemoveConstraint={handleRemoveConstraint}
            onOptimize={handleOptimize}
            onShuffle={handleShuffle}
          />
          
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
             <h3 className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-2">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
               </svg>
               Instructions
             </h3>
             <ul className="text-[10px] text-slate-600 space-y-1.5 leading-tight">
               <li className="flex gap-1.5">
                 <span className="font-bold text-slate-300">1.</span>
                 Input lists. Boys # will follow Girls #.
               </li>
               <li className="flex gap-1.5">
                 <span className="font-bold text-slate-300">2.</span>
                 Drag to swap seats manually.
               </li>
               <li className="flex gap-1.5">
                 <span className="font-bold text-slate-300">3.</span>
                 Set "Keep Apart" rules.
               </li>
               <li className="flex gap-1.5">
                 <span className="font-bold text-slate-300">4.</span>
                 Use "Auto-Arrange" or "Shuffle".
               </li>
             </ul>
          </div>
        </div>

        {/* Right Area: Visualization */}
        <div className="lg:col-span-9">
           <SeatingGrid 
             gridData={gridData} 
             config={config} 
             onSwapSeats={handleSwapSeats}
           />
        </div>
      </main>
    </div>
  );
};

export default App;