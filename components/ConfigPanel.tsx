import React, { useState } from 'react';
import { LayoutConfig, ParsingStatus, Constraint, Student } from '../types';
import { DEMO_BOYS, DEMO_GIRLS } from '../utils/seatingUtils';

interface ConfigPanelProps {
  config: LayoutConfig;
  onConfigChange: (newConfig: LayoutConfig) => void;
  onParseData: (boysText: string, girlsText: string) => Promise<void>;
  parsingStatus: ParsingStatus;
  students: Student[]; 
  constraints: Constraint[];
  onAddConstraint: (c: Constraint) => void;
  onRemoveConstraint: (id: string) => void;
  onOptimize: () => void;
  onShuffle: () => void;
}

const ConfigPanel: React.FC<ConfigPanelProps> = ({ 
  config, 
  onConfigChange, 
  onParseData,
  parsingStatus,
  students,
  constraints,
  onAddConstraint,
  onRemoveConstraint,
  onOptimize,
  onShuffle
}) => {
  const [boysText, setBoysText] = useState('');
  const [girlsText, setGirlsText] = useState('');
  
  // Constraint Inputs
  const [separateGroup, setSeparateGroup] = useState<string[]>([]); 
  const [separateSelect, setSeparateSelect] = useState('');

  const handleRowsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value) || 1;
    onConfigChange({ ...config, rows: Math.max(1, Math.min(20, val)) });
  };

  const handleColsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value) || 1;
    onConfigChange({ ...config, columns: Math.max(1, Math.min(12, val)) });
  };

  const handleParse = () => {
    onParseData(boysText, girlsText);
  };

  const loadDemo = () => {
    setBoysText(DEMO_BOYS);
    setGirlsText(DEMO_GIRLS);
  };

  // --- Separate (Keep Apart) Logic ---
  const handleAddToSeparateGroup = () => {
    if (separateSelect && !separateGroup.includes(separateSelect)) {
      setSeparateGroup([...separateGroup, separateSelect]);
      setSeparateSelect('');
    }
  };

  const handleCreateSeparateConstraint = () => {
    if (separateGroup.length < 2) return;
    onAddConstraint({
      id: `c-sep-${Date.now()}`,
      type: 'SEPARATE',
      studentIds: [...separateGroup]
    });
    setSeparateGroup([]);
  };

  const removeFromSeparateGroup = (idToRemove: string) => {
    setSeparateGroup(separateGroup.filter(id => id !== idToRemove));
  };
  // -----------------------------------

  const getStudentName = (id: string) => {
    const s = students.find(st => st.id === id);
    return s ? `${s.classNo}. ${s.nameChi}` : 'Unknown';
  };

  const sortedStudents = [...students].sort((a, b) => 
    parseInt(String(a.classNo)) - parseInt(String(b.classNo))
  );

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden flex flex-col gap-0 divide-y divide-slate-100">
      
      {/* 1. Configuration Section */}
      <div className="p-4">
        <h2 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
          Grid Setup
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Rows</label>
            <input type="number" min="1" max="20" value={config.rows} onChange={handleRowsChange} className="w-full px-2 py-1.5 border border-slate-200 rounded text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Columns</label>
            <input type="number" min="1" max="12" value={config.columns} onChange={handleColsChange} className="w-full px-2 py-1.5 border border-slate-200 rounded text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
        </div>
      </div>

      {/* 2. Data Input Section */}
      <div className="p-4 bg-slate-50/50">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-bold text-slate-800">Student List</h3>
          <button onClick={loadDemo} className="text-[10px] px-2 py-0.5 bg-white border border-slate-200 rounded hover:bg-slate-50 text-indigo-600 font-medium">
            Demo
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="flex items-center gap-1 text-[10px] font-bold text-rose-500 uppercase mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Girls List (1..N)
            </label>
            <textarea
              rows={2}
              className="w-full px-2 py-1.5 border border-rose-100 bg-white rounded text-xs font-mono focus:ring-2 focus:ring-rose-200 outline-none resize-none"
              placeholder="1. 李小欣 Alice"
              value={girlsText}
              onChange={(e) => setGirlsText(e.target.value)}
            />
          </div>
          <div>
            <label className="flex items-center gap-1 text-[10px] font-bold text-sky-500 uppercase mb-1">
               <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span> Boys List (N+1..)
            </label>
            <textarea
              rows={2}
              className="w-full px-2 py-1.5 border border-sky-100 bg-white rounded text-xs font-mono focus:ring-2 focus:ring-sky-200 outline-none resize-none"
              placeholder="1. 陳大文 Peter"
              value={boysText}
              onChange={(e) => setBoysText(e.target.value)}
            />
          </div>
        </div>

        <button
          onClick={handleParse}
          disabled={parsingStatus === ParsingStatus.PARSING || (!boysText.trim() && !girlsText.trim())}
          className={`w-full mt-3 py-2 rounded-lg text-white text-xs font-bold shadow transition-all ${parsingStatus === ParsingStatus.PARSING ? 'bg-slate-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
        >
          {parsingStatus === ParsingStatus.PARSING ? 'Processing...' : 'Generate Seating Plan'}
        </button>
      </div>

      {students.length > 0 && (
        <>
          {/* Shuffle Section */}
          <div className="p-4 bg-slate-50/30">
            <button
                onClick={onShuffle}
                className="w-full py-2 rounded-lg bg-indigo-500 text-white text-xs font-bold hover:bg-indigo-600 flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Random Shuffle
            </button>
          </div>

          {/* 3. Special Arrangements Section */}
          <div className="p-4">
            <h3 className="text-sm font-bold text-slate-800 mb-3">Special Arrangements</h3>
            
            {/* Keep Apart (Group) */}
            <div className="mb-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Keep Apart</label>
              
              <div className="flex gap-2 mb-2">
                <select 
                  value={separateSelect} 
                  onChange={e => setSeparateSelect(e.target.value)} 
                  className="w-full text-xs py-1.5 border border-slate-200 rounded appearance-none bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">Select Student</option>
                  {sortedStudents.map(s => <option key={s.id} value={s.id}>{s.classNo}. {s.nameChi}</option>)}
                </select>
                <button 
                  onClick={handleAddToSeparateGroup}
                  disabled={!separateSelect}
                  className="bg-indigo-50 border border-indigo-200 text-indigo-700 w-8 rounded hover:bg-indigo-100 font-bold"
                >
                  +
                </button>
              </div>

              {/* Staging Area for Separate Group */}
              {separateGroup.length > 0 && (
                <div className="mb-2">
                  <div className="flex flex-wrap gap-1">
                    {separateGroup.map(id => (
                      <span key={id} className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-rose-50 text-rose-700 border border-rose-100">
                        {getStudentName(id)}
                        <button onClick={() => removeFromSeparateGroup(id)} className="ml-1 text-rose-400">×</button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <button 
                onClick={handleCreateSeparateConstraint} 
                disabled={separateGroup.length < 2}
                className="w-full bg-white border border-slate-200 text-slate-700 text-[10px] font-bold py-1 rounded hover:bg-slate-50 disabled:opacity-50"
              >
                Add Rule
              </button>
            </div>

            {/* Active Constraints List */}
            {constraints.length > 0 && (
              <div className="mb-4">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Active Rules</h4>
                <ul className="space-y-1">
                  {constraints.map(c => (
                    <li key={c.id} className="text-[10px] flex justify-between items-start bg-amber-50 p-2 rounded border border-amber-100 text-amber-900">
                      <div className="flex-1 truncate">
                        {c.type === 'SEPARATE' && <span className="font-bold">Keep Apart: </span>}
                        {c.studentIds.map(id => getStudentName(id)).join(', ')}
                      </div>
                      <button onClick={() => onRemoveConstraint(c.id)} className="text-amber-400 hover:text-red-500 ml-1">×</button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="flex flex-col gap-2">
              <button
                onClick={onOptimize}
                disabled={parsingStatus === ParsingStatus.OPTIMIZING}
                className={`w-full py-2.5 rounded-lg text-white text-xs font-bold shadow flex items-center justify-center gap-2
                  ${parsingStatus === ParsingStatus.OPTIMIZING
                    ? 'bg-slate-300 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'}`}
              >
                {parsingStatus === ParsingStatus.OPTIMIZING ? 'Optimizing...' : '✨ Auto-Arrange'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ConfigPanel;