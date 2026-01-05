import React from 'react';
import { Student } from '../types';

interface StudentCardProps {
  student: Student | null;
  seatNumber: number;
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDrop: (e: React.DragEvent, index: number) => void;
  onDragOver: (e: React.DragEvent) => void;
}

const StudentCard: React.FC<StudentCardProps> = ({ 
  student, 
  seatNumber,
  onDragStart,
  onDrop,
  onDragOver
}) => {
  if (!student) {
    return (
      <div 
        className="h-full w-full min-h-[85px] bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center text-slate-300 text-sm cursor-move transition-all hover:bg-slate-100 hover:border-slate-300 group"
        draggable
        onDragStart={(e) => onDragStart(e, seatNumber)}
        onDrop={(e) => onDrop(e, seatNumber)}
        onDragOver={onDragOver}
      >
        <span className="pointer-events-none font-medium group-hover:text-slate-400 transition-colors">Empty Seat</span>
      </div>
    );
  }

  const isBoy = student.gender === 'M';
  const isGirl = student.gender === 'F';

  const cardStyles = isBoy 
    ? 'bg-sky-50 border-sky-200 hover:border-sky-400 hover:shadow-sky-100' 
    : isGirl 
      ? 'bg-rose-50 border-rose-200 hover:border-rose-400 hover:shadow-rose-100' 
      : 'bg-white border-slate-200 hover:border-indigo-400 hover:shadow-indigo-100';

  const badgeStyles = isBoy
    ? 'bg-sky-100 text-blue-800' 
    : isGirl
      ? 'bg-rose-100 text-rose-700'
      : 'bg-slate-100 text-slate-700';

  const textColor = isBoy ? 'text-blue-900' : isGirl ? 'text-rose-900' : 'text-slate-900';
  const subTextColor = isBoy ? 'text-blue-700' : isGirl ? 'text-rose-600' : 'text-slate-500';

  return (
    <div 
      className={`group relative h-full w-full min-h-[85px] border rounded-lg shadow-sm p-2 flex flex-col items-center justify-center text-center transition-all duration-200 cursor-grab active:cursor-grabbing hover:-translate-y-1 hover:shadow-md select-none ${cardStyles}`}
      draggable
      onDragStart={(e) => onDragStart(e, seatNumber)}
      onDrop={(e) => onDrop(e, seatNumber)}
      onDragOver={onDragOver}
    >
      {/* Class Number Badge */}
      <div className={`w-6 h-6 rounded-full text-[10px] font-bold flex items-center justify-center absolute top-1.5 left-1.5 shadow-sm ${badgeStyles}`}>
        {student.classNo}
      </div>

      {/* Drag Handle Icon (Visible on hover) */}
      <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-40 transition-opacity">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/>
        </svg>
      </div>
      
      {/* Student Names */}
      <div className="mt-2 w-full px-1">
        <div className={`text-xl font-bold leading-tight ${textColor} pointer-events-none truncate w-full`}>
          {student.nameChi}
        </div>
        <div className={`text-lg font-bold ${subTextColor} pointer-events-none mt-0.5 truncate w-full`}>
          {student.nameEng}
        </div>
      </div>

      {/* Hover Prompt */}
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[8px] py-0.5 px-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-sm z-20">
        Drag to swap
      </div>
    </div>
  );
};

export default StudentCard;