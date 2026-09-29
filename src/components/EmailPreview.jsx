import React, { useState, useEffect } from 'react';
import { Mail, Globe, Sparkles, ChevronDown, ChevronUp, Loader } from 'lucide-react';
import { API_BASE_URL } from '../config';

export default function EmailPreview({ lead, onClose }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [previewData, setPreviewData] = useState(null);
  const [showContext, setShowContext] = useState(false);

  useEffect(() => {
    if (!lead) return;

    async function loadPreview() {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`${API_BASE_URL}/api/leads/preview/${lead.id}`);
        if (!res.ok) {
          throw new Error('Failed to generate preview from backend');
        }
        const data = await res.json();
        if (data.success) {
          setPreviewData(data.preview);
        } else {
          throw new Error(data.error || 'Unknown error');
        }
      } catch (err) {
        setError(err.message || 'Error occurred while loading email preview.');
      } finally {
        setLoading(false);
      }
    }

    loadPreview();
  }, [lead]);

  if (!lead) {
    return (
      <div className="bg-white border border-zinc-200 rounded-xl p-12 text-center text-zinc-400 flex flex-col items-center justify-center min-h-[300px]">
        <Mail className="w-10 h-10 mb-2 opacity-40 text-zinc-400" />
        <h3 className="text-zinc-900 font-semibold text-base">No Lead Selected</h3>
        <p className="text-xs max-w-sm mt-1 text-zinc-500">Go to the Campaigns & Prospects tab and click "Preview" on any lead.</p>
      </div>
    );
  }

  const bodyWordCount = previewData?.body ? previewData.body.split(/\s+/).filter(Boolean).length : 0;

  return (
    <div className="space-y-6 text-zinc-900">
      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-b border-zinc-200">
        <div>
          <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Outbound Email Preview</span>
          <h2 className="text-xl font-semibold text-zinc-900">{lead.name}</h2>
          <p className="text-xs text-zinc-500">Target Prospect at {lead.company}</p>
        </div>
        <button
          onClick={onClose}
          className="px-3.5 py-1.5 bg-white border border-zinc-300 hover:bg-zinc-100 text-zinc-800 rounded-lg text-xs font-medium transition-all"
        >
          Back to List
        </button>
      </div>

      {loading ? (
        <div className="bg-white border border-zinc-200 rounded-xl p-12 flex flex-col items-center justify-center min-h-[300px] space-y-3">
          <Loader className="w-8 h-8 text-zinc-900 animate-spin" />
          <div className="text-center space-y-1">
            <p className="text-zinc-900 font-medium text-xs">Compiling Email Copy...</p>
            <p className="text-[11px] text-zinc-500">Processing custom tags for this prospect...</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-6 text-center text-rose-700">
          <p className="font-semibold text-xs">Preview Generation Failed</p>
          <p className="text-xs mt-1">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-3 px-3 py-1 bg-white border border-rose-300 text-rose-700 rounded text-xs"
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {lead.website && (
            <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setShowContext(!showContext)}
                className="w-full px-4 py-2.5 flex items-center justify-between text-xs font-medium text-zinc-700 bg-zinc-50 hover:bg-zinc-100 transition-all"
              >
                <span className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-zinc-700" />
                  View Website Context ({lead.website})
                </span>
                {showContext ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showContext && (
                <div className="p-4 bg-white border-t border-zinc-200 text-xs text-zinc-600 font-mono whitespace-pre-wrap max-h-40 overflow-y-auto">
                  {previewData.scrapedContext}
                </div>
              )}
            </div>
          )}

          {/* Email Preview Outer Box */}
          <div className="bg-white border border-zinc-200 rounded-xl shadow-minimal overflow-hidden">
            <div className="bg-zinc-50 border-b border-zinc-200 p-4 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">To: <strong className="text-zinc-900">{lead.name} &lt;{lead.email}&gt;</strong></span>
                <span className="text-[10px] text-zinc-500 font-mono">{bodyWordCount} Words</span>
              </div>
              <div>
                <span className="text-zinc-500">Subject: </span>
                <strong className="text-zinc-900 font-mono">{previewData.subject}</strong>
              </div>
            </div>

            <div className="p-6 bg-white text-xs font-mono text-zinc-800 whitespace-pre-wrap leading-relaxed">
              {previewData.body}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
