'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useStore, type ProgramScript } from '@/lib/store';
import { getCalcModule } from '@/lib/wasm';
import { hapticFeedback, generateId } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProgramMode() {
  const { programs, saveProgram, deleteProgram, variables, setVariable } = useStore();
  
  const [activeProgId, setActiveProgId] = useState<string | null>(programs.length > 0 ? programs[0].id : null);
  const [editingName, setEditingName] = useState(false);
  const [outputLogs, setOutputLogs] = useState<string[]>([]);
  
  const activeProg = programs.find(p => p.id === activeProgId);
  
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logs
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [outputLogs]);

  const handleCreate = () => {
    const newProg: ProgramScript = {
      id: generateId(),
      name: 'New Program',
      code: '// Write your script here\n\n'
    };
    saveProgram(newProg);
    setActiveProgId(newProg.id);
    setOutputLogs([]);
    hapticFeedback('medium');
  };

  const handleRun = () => {
    if (!activeProg) return;
    
    setOutputLogs(['> Running ' + activeProg.name + '...']);
    hapticFeedback('medium');
    
    const logs: string[] = [];
    const print = (val: any) => {
      logs.push(String(val));
      setOutputLogs(prev => [...prev, String(val)]);
    };
    
    const getVar = (name: string) => {
      const vars = useStore.getState().variables;
      return vars[name] ?? 0;
    };
    
    const setVar = (name: string, val: number) => {
      useStore.getState().setVariable(name, val);
    };
    
    const calc = getCalcModule();

    try {
      // Execute within an async IIFE to isolate scope
      const fn = new Function('get', 'set', 'print', 'calc', `
        "use strict";
        try {
          ${activeProg.code}
        } catch (e) {
          print("Error: " + e.message);
        }
      `);
      
      // We run it synchronously
      fn(getVar, setVar, print, calc);
      
    } catch (e: any) {
      setOutputLogs(prev => [...prev, 'System Error: ' + e.message]);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '12px' }}>
      
      {/* Top Bar: Selector & Controls */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <select
          value={activeProgId || ''}
          onChange={(e) => {
            setActiveProgId(e.target.value);
            setOutputLogs([]);
            hapticFeedback('light');
          }}
          style={{
            flex: 1,
            background: 'var(--bg3)',
            color: 'var(--hi)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '8px',
            fontSize: '13px',
            outline: 'none'
          }}
        >
          {programs.length === 0 && <option value="" disabled>No programs</option>}
          {programs.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        
        <button
          onClick={handleCreate}
          style={{
            background: 'var(--bg3)', color: 'var(--hi)',
            border: '1px solid var(--border)', borderRadius: '8px',
            padding: '8px 12px', fontSize: '12px', cursor: 'pointer'
          }}
        >
          + New
        </button>
      </div>

      {activeProg ? (
        <>
          {/* Editor Area */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {editingName ? (
                <input
                  type="text"
                  autoFocus
                  defaultValue={activeProg.name}
                  onBlur={(e) => {
                    saveProgram({ ...activeProg, name: e.target.value || 'Unnamed' });
                    setEditingName(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') e.currentTarget.blur();
                  }}
                  style={{
                    background: 'var(--bg1)', color: 'var(--hi)', border: '1px solid var(--accent)',
                    borderRadius: '4px', padding: '2px 6px', fontSize: '13px', outline: 'none'
                  }}
                />
              ) : (
                <div 
                  onClick={() => setEditingName(true)}
                  style={{ color: 'var(--hi)', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
                >
                  {activeProg.name} ✎
                </div>
              )}
              
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => {
                    if (confirm('Delete this program?')) {
                      deleteProgram(activeProg.id);
                      setActiveProgId(programs.length > 1 ? programs[0].id : null);
                    }
                  }}
                  style={{
                    background: 'transparent', color: 'var(--err)',
                    border: 'none', fontSize: '12px', cursor: 'pointer'
                  }}
                >
                  Delete
                </button>
                <button
                  onClick={handleRun}
                  style={{
                    background: 'var(--accent)', color: '#000',
                    border: 'none', borderRadius: '6px',
                    padding: '4px 16px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer'
                  }}
                >
                  ▶ RUN
                </button>
              </div>
            </div>

            {/* Code Textarea */}
            <textarea
              value={activeProg.code}
              onChange={(e) => saveProgram({ ...activeProg, code: e.target.value })}
              spellCheck={false}
              style={{
                flex: 1,
                minHeight: '200px',
                background: 'var(--bg0)',
                color: 'var(--hi)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '12px',
                fontFamily: 'monospace',
                fontSize: '13px',
                lineHeight: '1.4',
                resize: 'none',
                outline: 'none',
                whiteSpace: 'pre'
              }}
            />
          </div>

          {/* Console Output */}
          <div style={{ 
            height: '120px', 
            background: '#0a0a0c', 
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '8px',
            overflowY: 'auto',
            fontFamily: 'monospace',
            fontSize: '12px',
            color: 'var(--mid)',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}>
            {outputLogs.length === 0 ? (
              <span style={{ opacity: 0.5 }}>No output...</span>
            ) : (
              outputLogs.map((log, i) => (
                <div key={i}>{log}</div>
              ))
            )}
            <div ref={logsEndRef} />
          </div>
        </>
      ) : (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--mid)' }}>
          Create a program to get started.
        </div>
      )}
    </div>
  );
}
