import React from 'react';
import { Student, LayoutConfig } from '../types';
import StudentCard from './StudentCard';

interface SeatingGridProps {
  gridData: (Student | null)[];
  config: LayoutConfig;
  onSwapSeats: (fromIndex: number, toIndex: number) => void;
}

const SeatingGrid: React.FC<SeatingGridProps> = ({ gridData, config, onSwapSeats }) => {
  // Calculate grid styles
  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(${config.columns}, minmax(100px, 1fr))`,
    gap: '0.75rem',
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
    e.dataTransfer.effectAllowed = 'move';
    
    // Create a drag image offset or effect if desired
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.4';
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, toIndex: number) => {
    e.preventDefault();
    const fromIndexStr = e.dataTransfer.getData('text/plain');
    if (!fromIndexStr) return;
    
    const fromIndex = parseInt(fromIndexStr, 10);
    if (isNaN(fromIndex) || fromIndex === toIndex) return;

    onSwapSeats(fromIndex, toIndex);
  };

  return (
    <div className="w-full flex flex-col items-center">
      
      {/* Visual Instruction Prompt */}
      <div className="w-full flex justify-between items-end mb-3 px-2">
        <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11" />
          </svg>
          <span>Click and drag desks to rearrange manually</span>
        </div>
        <div className="text-[10px] text-slate-400 italic">
          {gridData.filter(s => s !== null).length} Students Placed
        </div>
      </div>

      {/* Grid Container */}
      <div className="w-full overflow-x-auto p-6 bg-white rounded-2xl border border-slate-200 mb-8 shadow-sm">
        <div style={gridStyle} className="min-w-fit mx-auto">
          {gridData.map((student, index) => {
            return (
              <div 
                key={`${student?.id || 'empty'}-${index}`} 
                onDragEnd={handleDragEnd}
                className="relative"
              >
                <StudentCard 
                  student={student} 
                  seatNumber={index}
                  onDragStart={handleDragStart}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Blackboard Area - Compact Visuals */}
      <div className="w-full max-w-2xl flex flex-col items-center perspective-[1000px]">
        <div className="relative w-full max-w-md h-14 bg-[#1a2e1c] rounded shadow-[0_8px_20px_-5px_rgba(0,0,0,0.5)] border-[6px] border-[#5d4037] flex items-center justify-center overflow-hidden">
          {/* Chalk dust effect */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-orchid.png')] opacity-30"></div>
          
          <div className="relative flex items-center gap-4 z-10">
            <div className="h-[2px] w-8 bg-white/20"></div>
            <span className="text-white/90 font-serif text-lg tracking-[0.3em] font-bold drop-shadow-md">
              BLACKBOARD
            </span>
            <div className="h-[2px] w-8 bg-white/20"></div>
          </div>
        </div>
        
        <div className="mt-3 flex items-center gap-2">
           <div className="h-px w-6 bg-slate-300"></div>
           <span className="text-slate-400 text-[10px] font-bold tracking-widest uppercase">
             Front of Classroom
           </span>
           <div className="h-px w-6 bg-slate-300"></div>
        </div>
      </div>
      
    </div>
  );
};

export default SeatingGrid;