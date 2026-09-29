import React, { useRef, useEffect } from 'react';
import { Terminal, Download, Trash2, Shield } from 'lucide-react';

export default function Logs({ logs, onClearLogs }) {
  const terminalEndRef = useRef(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleExportLogs = () => {
    if (logs.length === 0) return;
    const text = logs.map(l => `[${l.timestamp}] [${l.level.toUpperCase()}]: ${l.message}`).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'campaign_execution_logs.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 text-zinc-900">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-200 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-zinc-900 tracking-tight">System Logs</h1>
          <p className="text-xs text-zinc-500 mt-0.5">Live execution logging of web scrapers, AI generators, and SMTP handshakes.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportLogs}
            disabled={logs.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-zinc-300 hover:bg-zinc-100 disabled:opacity-30 text-zinc-800 rounded-md text-xs font-medium transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            Export Log File
          </button>
          
          <button
            onClick={onClearLogs}
            disabled={logs.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 border border-rose-200 hover:bg-rose-100 disabled:opacity-30 text-rose-700 rounded-md text-xs font-medium transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear Terminal
          </button>
        </div>
      </div>

      {/* Terminal */}
      <div className="terminal-window rounded-xl p-4 flex flex-col min-h-[480px] max-h-[600px] overflow-hidden shadow-subtle border border-zinc-800">
        
        {/* Terminal top header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-zinc-800 text-zinc-500 text-xs font-mono mb-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-zinc-300" />
            <span className="text-zinc-300 font-semibold">AI Mail Agent Terminal v1.0</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-400 text-[11px]">
            <Shield className="w-3.5 h-3.5" />
            <span>Active Sandbox</span>
          </div>
        </div>

        {/* Logs container */}
        <div className="flex-1 overflow-y-auto space-y-1.5 pr-2 text-xs font-mono leading-relaxed">
          {logs.length === 0 ? (
            <div className="h-full flex items-center justify-center text-zinc-600 italic">
              Terminal Idle. Waiting for campaign triggers...
            </div>
          ) : (
            logs.map((log, idx) => {
              let logColor = 'text-zinc-200';
              if (log.level === 'warn') logColor = 'text-amber-400';
              if (log.level === 'error') logColor = 'text-rose-400';
              
              return (
                <div key={idx} className="flex items-start gap-2 py-0.5 font-mono">
                  <span className="text-zinc-500 select-none text-[11px]">[{log.timestamp}]</span>
                  <span className={`font-semibold uppercase select-none text-[11px] w-12 ${
                    log.level === 'error' ? 'text-rose-400' : log.level === 'warn' ? 'text-amber-400' : 'text-zinc-400'
                  }`}>
                    {log.level}
                  </span>
                  <span className={`flex-1 break-words text-[11px] ${logColor}`}>{log.message}</span>
                </div>
              );
            })
          )}
          <div ref={terminalEndRef} />
        </div>

      </div>
    </div>
  );
}
