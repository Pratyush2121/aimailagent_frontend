import React from 'react';
import { Users, Mail, CheckCircle, AlertTriangle, MessageSquare, Award, Play, Pause, RefreshCw, Star } from 'lucide-react';

export default function Dashboard({ 
  leads, 
  progress, 
  onStartCampaign, 
  onStopCampaign, 
  onSyncReplies,
  onRunFollowups 
}) {
  
  // Calculate metrics from current leads state
  const totalLeads = leads.length;
  const pending = leads.filter(l => l.outbound_status === 'Pending').length;
  const personalizing = leads.filter(l => l.outbound_status === 'Personalizing' || l.outbound_status === 'Sending').length;
  const sent = leads.filter(l => l.outbound_status === 'Sent').length;
  const failed = leads.filter(l => l.outbound_status === 'Failed').length;
  
  const repliedLeads = leads.filter(l => l.reply_status === 'Replied');
  const repliedCount = repliedLeads.length;
  
  // Reply Rate (%)
  const replyRate = sent > 0 ? Math.round((repliedCount / sent) * 100) : 0;
  
  // Positive replies
  const positiveReplies = repliedLeads.filter(l => 
    l.reply_classification === 'Interested' || 
    l.reply_classification === 'Meeting Request' || 
    l.reply_classification === 'Pricing'
  ).length;

  const activeReplies = repliedLeads.slice(0, 5);

  return (
    <div className="space-y-6 text-zinc-900">
      {/* Upper header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-200 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-zinc-900 tracking-tight">Campaign Console</h1>
          <p className="text-xs text-zinc-500 mt-0.5">Real-time outbound performance & HR response analytics.</p>
        </div>
        
        {/* Orchestrator controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={onSyncReplies}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white border border-zinc-300 hover:bg-zinc-100 text-zinc-800 transition-all font-medium text-xs shadow-subtle"
            title="Scan IMAP Inbox for new replies"
          >
            <RefreshCw className="w-3.5 h-3.5 text-zinc-800" />
            Check Replies
          </button>
          
          <button
            onClick={() => onRunFollowups(3)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white border border-zinc-300 hover:bg-zinc-100 text-zinc-800 transition-all font-medium text-xs shadow-subtle"
            title="Send scheduled follow-ups to non-repliers"
          >
            <Mail className="w-3.5 h-3.5 text-zinc-800" />
            Run Follow-ups
          </button>

          {progress.running ? (
            <button
              onClick={onStopCampaign}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white font-medium transition-all text-xs shadow-subtle"
            >
              <Pause className="w-3.5 h-3.5" />
              Pause Sending
            </button>
          ) : (
            <button
              onClick={onStartCampaign}
              disabled={pending === 0 && failed === 0}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-100 disabled:text-zinc-400 text-white font-medium transition-all text-xs shadow-subtle"
            >
              <Play className="w-3.5 h-3.5" />
              Start Campaign
            </button>
          )}
        </div>
      </div>

      {/* Progress Monitor when active */}
      {progress.running && (
        <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-minimal space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-zinc-900 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-zinc-900"></span>
              </span>
              <h3 className="font-semibold text-zinc-900 text-xs">Active Campaign Queue running</h3>
            </div>
            <span className="text-zinc-900 font-mono text-xs font-semibold">{progress.percentage}% Complete</span>
          </div>
          
          <div className="w-full bg-zinc-100 rounded-full h-2 overflow-hidden border border-zinc-200">
            <div 
              className="bg-zinc-900 h-full rounded-full transition-all duration-300" 
              style={{ width: `${progress.percentage}%` }}
            ></div>
          </div>
          
          <div className="flex justify-between items-center text-xs text-zinc-500 font-mono">
            <div>
              Current Lead: <span className="text-zinc-900 font-semibold">{progress.currentLeadName || 'Personalizing...'}</span>
            </div>
            <div>
              Processed: <span className="text-zinc-900 font-semibold">{progress.processedCount}</span> / <span className="text-zinc-400">{progress.totalLeads}</span>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Card Grids (Pure Minimalist Style) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Leads */}
        <div className="bg-white border border-zinc-200 rounded-xl p-5 flex items-start justify-between shadow-minimal">
          <div className="space-y-1">
            <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Total Leads</span>
            <div className="text-2xl font-bold text-zinc-900">{totalLeads}</div>
            <p className="text-[11px] text-zinc-500">
              {pending} pending queue | {personalizing} sending
            </p>
          </div>
          <div className="p-2 bg-zinc-100 rounded-lg text-zinc-900 border border-zinc-200">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: Sent Emails */}
        <div className="bg-white border border-zinc-200 rounded-xl p-5 flex items-start justify-between shadow-minimal">
          <div className="space-y-1">
            <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Emails Sent</span>
            <div className="text-2xl font-bold text-zinc-900">{sent}</div>
            <p className="text-[11px] text-zinc-500 flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5 text-zinc-800" /> Successful deliveries
            </p>
          </div>
          <div className="p-2 bg-zinc-100 rounded-lg text-zinc-900 border border-zinc-200">
            <Mail className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: Reply Rate */}
        <div className="bg-white border border-zinc-200 rounded-xl p-5 flex items-start justify-between shadow-minimal">
          <div className="space-y-1">
            <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Reply Rate</span>
            <div className="text-2xl font-bold text-zinc-900">{replyRate}%</div>
            <p className="text-[11px] text-zinc-500">
              {repliedCount} total response{repliedCount !== 1 ? 's' : ''} parsed
            </p>
          </div>
          <div className="p-2 bg-zinc-100 rounded-lg text-zinc-900 border border-zinc-200">
            <MessageSquare className="w-5 h-5" />
          </div>
        </div>

        {/* Card 4: Positive Replies */}
        <div className="bg-white border border-zinc-200 rounded-xl p-5 flex items-start justify-between shadow-minimal">
          <div className="space-y-1">
            <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Positive Responses</span>
            <div className="text-2xl font-bold text-zinc-900">{positiveReplies}</div>
            <p className="text-[11px] text-zinc-500 flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-zinc-800" /> High-intent leads
            </p>
          </div>
          <div className="p-2 bg-zinc-100 rounded-lg text-zinc-900 border border-zinc-200">
            <Award className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Reply Breakdown Table */}
        <div className="bg-white border border-zinc-200 rounded-xl p-5 lg:col-span-2 space-y-4 shadow-minimal">
          <div className="flex justify-between items-center border-b border-zinc-100 pb-3">
            <h3 className="text-sm font-semibold text-zinc-900">Latest Response Activity</h3>
            <span className="px-2.5 py-0.5 bg-zinc-100 border border-zinc-200 rounded text-[11px] font-medium text-zinc-600">
              IMAP Synced
            </span>
          </div>

          {activeReplies.length === 0 ? (
            <div className="h-44 flex flex-col items-center justify-center text-zinc-400 border border-dashed border-zinc-200 rounded-lg">
              <MessageSquare className="w-6 h-6 mb-1.5 opacity-40" />
              <p className="text-xs font-medium text-zinc-600">No replies detected yet.</p>
              <p className="text-[11px] text-zinc-400 mt-0.5">Start campaign or click "Check Replies"</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeReplies.map((lead) => (
                <div key={lead.id} className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-zinc-900 text-xs">{lead.name}</span>
                      <span className="text-zinc-500 text-[11px]">@ {lead.company}</span>
                    </div>
                    <p className="text-[11px] text-zinc-500 font-mono">{lead.email}</p>
                  </div>
                  <div>
                    <span className="px-2.5 py-1 text-xs font-medium rounded-md bg-zinc-100 text-zinc-900 border border-zinc-200">
                      {lead.reply_classification || 'Replied'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Campaign Metrics Funnel */}
        <div className="bg-white border border-zinc-200 rounded-xl p-5 space-y-5 shadow-minimal">
          <h3 className="text-sm font-semibold text-zinc-900 border-b border-zinc-100 pb-3">Campaign Funnel</h3>
          <div className="space-y-4">
            
            {/* Total Lead conversion */}
            <div>
              <div className="flex justify-between text-xs text-zinc-600 mb-1">
                <span>Leads Emailed</span>
                <span className="text-zinc-900 font-semibold">{totalLeads > 0 ? Math.round((sent / totalLeads) * 100) : 0}%</span>
              </div>
              <div className="w-full bg-zinc-100 rounded-full h-2 border border-zinc-200">
                <div 
                  className="bg-zinc-900 h-full rounded-full" 
                  style={{ width: `${totalLeads > 0 ? (sent / totalLeads) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            {/* Replied rate */}
            <div>
              <div className="flex justify-between text-xs text-zinc-600 mb-1">
                <span>Response Rate</span>
                <span className="text-zinc-900 font-semibold">{replyRate}%</span>
              </div>
              <div className="w-full bg-zinc-100 rounded-full h-2 border border-zinc-200">
                <div 
                  className="bg-zinc-900 h-full rounded-full" 
                  style={{ width: `${replyRate}%` }}
                ></div>
              </div>
            </div>

            {/* Interest conversion rate */}
            <div>
              <div className="flex justify-between text-xs text-zinc-600 mb-1">
                <span>Interest Conversion</span>
                <span className="text-zinc-900 font-semibold">
                  {repliedCount > 0 ? Math.round((positiveReplies / repliedCount) * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-zinc-100 rounded-full h-2 border border-zinc-200">
                <div 
                  className="bg-zinc-900 h-full rounded-full" 
                  style={{ width: `${repliedCount > 0 ? (positiveReplies / repliedCount) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            {/* Queue failure count */}
            <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-xs">
              <span className="text-zinc-600 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-zinc-500" />
                Delivery Failures
              </span>
              <span className="font-semibold text-zinc-900">
                {failed} message{failed !== 1 ? 's' : ''}
              </span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
