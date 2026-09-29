import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Users, Settings as SettingsIcon, Terminal, Download, Layers, ShieldCheck, Mail, WifiOff, GraduationCap, FileText, Lock, X } from 'lucide-react';
import Dashboard from './components/Dashboard';
import Campaigns from './components/Campaigns';
import EmailPreview from './components/EmailPreview';
import Settings from './components/Settings';
import Logs from './components/Logs';
import JobSeekers from './components/JobSeekers';
import { API_BASE_URL } from './config';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [leads, setLeads] = useState([]);
  const [previewLead, setPreviewLead] = useState(null);
  const [logs, setLogs] = useState([]);
  const [serverOnline, setServerOnline] = useState(true);
  const [settings, setSettings] = useState({});
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [progress, setProgress] = useState({
    totalLeads: 0,
    processedCount: 0,
    successCount: 0,
    failedCount: 0,
    currentLeadName: '',
    running: false,
    percentage: 0
  });

  // Fetch leads from database
  const fetchLeads = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/leads`);
      const data = await res.json();
      if (data.success) {
        setLeads(data.leads);
        setServerOnline(true);
      }
    } catch (e) {
      setServerOnline(false);
      console.error('Failed to fetch leads: Backend offline');
    }
  };

  // Fetch settings from database
  const fetchSettings = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/settings`);
      const data = await res.json();
      if (data.success) {
        setSettings(data.settings);
        setServerOnline(true);
      }
    } catch (e) {
      setServerOnline(false);
    }
  };

  useEffect(() => {
    fetchLeads();
    fetchSettings();
    
    // Connect to Server-Sent Events (SSE) stream for real-time campaign logs & progress
    const eventSource = new EventSource(`${API_BASE_URL}/api/campaign/status`);
    
    eventSource.onopen = () => {
      setServerOnline(true);
      console.log('SSE connection to campaign status opened.');
    };

    eventSource.onmessage = (event) => {
      const payload = JSON.parse(event.data);
      
      if (payload.type === 'log') {
        setLogs(prev => [...prev, payload.data]);
      } else if (payload.type === 'progress') {
        setProgress({
          ...payload.data,
          running: true
        });
      } else if (payload.type === 'lead-updated') {
        // Update lead list state in real-time
        setLeads(prevLeads => 
          prevLeads.map(lead => 
            lead.id === payload.data.id 
              ? { ...lead, ...payload.data } 
              : lead
          )
        );
      } else if (payload.type === 'finished') {
        setProgress(prev => ({ ...prev, running: false, percentage: 100 }));
        fetchLeads(); // Refresh leads
      }
    };

    eventSource.onerror = () => {
      // Set offline but do not close (SSE automatically attempts reconnection)
      setServerOnline(false);
    };

    // Clean up SSE on unmount
    return () => {
      eventSource.close();
    };
  }, []);

  // API Call: Import Leads
  const handleImportLeads = async (leadsData) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leads: leadsData })
      });
      const data = await res.json();
      if (data.success) {
        await fetchLeads();
      } else {
        throw new Error(data.error);
      }
    } catch (e) {
      alert(`Import error: ${e.message}`);
    }
  };

  // API Call: Clear DB
  const handleClearLeads = async () => {
    if (!confirm('Are you sure you want to delete all leads and campaign history? This cannot be undone.')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/leads`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setLeads([]);
        setLogs([]);
        setProgress({
          totalLeads: 0,
          processedCount: 0,
          successCount: 0,
          failedCount: 0,
          currentLeadName: '',
          running: false,
          percentage: 0
        });
      }
    } catch (e) {
      alert(`Delete error: ${e.message}`);
    }
  };

  // API Call: Start Campaign Queue
  const handleStartCampaign = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/campaign/start`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setProgress(prev => ({ ...prev, running: true }));
        setActiveTab('logs'); // Jump to logs to show real-time terminal output
      }
    } catch (e) {
      alert(`Failed to start campaign: ${e.message}`);
    }
  };

  // API Call: Stop/Pause Campaign
  const handleStopCampaign = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/campaign/stop`, { method: 'POST' });
    } catch (e) {
      alert(`Failed to stop campaign: ${e.message}`);
    }
  };

  // API Call: Run Follow-ups
  const handleRunFollowups = async (daysInterval = 3) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/campaign/followups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ daysInterval })
      });
      const data = await res.json();
      if (data.success) {
        setProgress(prev => ({ ...prev, running: true }));
        setActiveTab('logs'); // Switch to terminal output
      }
    } catch (e) {
      alert(`Failed to start follow-up sequence: ${e.message}`);
    }
  };

  // API Call: Sync Inbox Replies via IMAP
  const handleSyncReplies = async () => {
    try {
      setLogs(prev => [
        ...prev, 
        { 
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19), 
          level: 'info', 
          message: 'Inbox check manually requested. Connecting to IMAP...' 
        }
      ]);
      await fetch(`${API_BASE_URL}/api/campaign/sync-replies`, { method: 'POST' });
      setActiveTab('logs'); // Jump to logs to watch IMAP flow
    } catch (e) {
      alert(`Sync replies failed: ${e.message}`);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-zinc-50 text-zinc-900 overflow-hidden">
      
      {/* Mobile Header Bar (Only visible on mobile screens) */}
      <header className="md:hidden bg-white border-b border-zinc-200 p-3.5 flex items-center justify-between z-40">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-zinc-900 rounded-lg text-white">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-zinc-900 text-base leading-none">AI Mail Agent</div>
            <a href="https://zonovatechnology.online" target="_blank" rel="noreferrer" className="text-[10px] text-zinc-500 font-medium hover:underline">
              Managed by zonovatechnology.online
            </a>
          </div>
        </div>

        {/* Mobile Tab Pills */}
        <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-xl border border-zinc-200">
          <button
            onClick={() => { setActiveTab('dashboard'); setPreviewLead(null); }}
            className={`p-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'dashboard' ? 'bg-zinc-900 text-white shadow-subtle' : 'text-zinc-600'
            }`}
            title="Dashboard"
          >
            <LayoutDashboard className="w-4 h-4" />
          </button>
          <button
            onClick={() => { setActiveTab('jobseekers'); setPreviewLead(null); }}
            className={`p-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'jobseekers' ? 'bg-zinc-900 text-white shadow-subtle' : 'text-zinc-600'
            }`}
            title="Student / Job Seekers"
          >
            <GraduationCap className="w-4 h-4" />
          </button>
          <button
            onClick={() => { setActiveTab('campaign'); setPreviewLead(null); }}
            className={`p-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'campaign' || previewLead !== null ? 'bg-zinc-900 text-white shadow-subtle' : 'text-zinc-600'
            }`}
            title="Campaigns"
          >
            <Users className="w-4 h-4" />
          </button>
          <button
            onClick={() => { setActiveTab('settings'); setPreviewLead(null); }}
            className={`p-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'settings' ? 'bg-zinc-900 text-white shadow-subtle' : 'text-zinc-600'
            }`}
            title="Settings"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => { setActiveTab('logs'); setPreviewLead(null); }}
            className={`p-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'logs' ? 'bg-zinc-900 text-white shadow-subtle' : 'text-zinc-600'
            }`}
            title="Logs"
          >
            <Terminal className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Desktop Sidebar Panel */}
      <aside className="hidden md:flex w-64 bg-white border-r border-zinc-200 flex-col justify-between flex-shrink-0 z-10">
        
        {/* Sidebar Brand and Navigation */}
        <div className="p-6 space-y-8">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-zinc-900 rounded-xl text-white">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-zinc-900 text-base leading-tight tracking-tight">AI Mail Agent</div>
              <a href="https://zonovatechnology.online" target="_blank" rel="noreferrer" className="text-[10px] text-zinc-500 font-semibold hover:underline block truncate">
                Managed by zonovatechnology.online
              </a>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <button
              onClick={() => { setActiveTab('dashboard'); setPreviewLead(null); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-zinc-900 text-white shadow-subtle'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Console Dashboard
            </button>

            <button
              onClick={() => { setActiveTab('jobseekers'); setPreviewLead(null); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'jobseekers'
                  ? 'bg-zinc-900 text-white shadow-subtle'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              Job Seekers & Students
            </button>

            <button
              onClick={() => { setActiveTab('campaign'); setPreviewLead(null); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'campaign' || previewLead !== null
                  ? 'bg-zinc-900 text-white shadow-subtle'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
              }`}
            >
              <Users className="w-4 h-4" />
              Campaigns & HR Leads
            </button>

            <button
              onClick={() => { setActiveTab('settings'); setPreviewLead(null); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'settings'
                  ? 'bg-zinc-900 text-white shadow-subtle'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
              }`}
            >
              <SettingsIcon className="w-4 h-4" />
              Configuration
            </button>

            <button
              onClick={() => { setActiveTab('logs'); setPreviewLead(null); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'logs'
                  ? 'bg-zinc-900 text-white shadow-subtle'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
              }`}
            >
              <Terminal className="w-4 h-4" />
              System Logs
              {progress.running && (
                <span className="ml-auto w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              )}
            </button>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-6 border-t border-zinc-100 space-y-4">
          {serverOnline ? (
            <div className="flex items-center gap-2 text-xs font-medium text-emerald-700">
              <ShieldCheck className="w-4 h-4" />
              <span>Server Link Online</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs font-medium text-rose-600 animate-pulse">
              <WifiOff className="w-4 h-4" />
              <span>Server Offline (Wait...)</span>
            </div>
          )}

          <div className="space-y-2">
            <span className="text-[10px] text-zinc-400 font-medium uppercase tracking-widest block">Export Reports</span>
            <div className="grid grid-cols-2 gap-2">
              <a
                href={`${API_BASE_URL}/api/export/csv`}
                className="flex items-center justify-center gap-1.5 py-1.5 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 rounded-lg text-xs font-medium text-zinc-700 transition-colors"
                title="Download CSV report"
              >
                <Download className="w-3 h-3" />
                CSV
              </a>
              <a
                href={`${API_BASE_URL}/api/export/json`}
                className="flex items-center justify-center gap-1.5 py-1.5 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 rounded-lg text-xs font-medium text-zinc-700 transition-colors"
                title="Download JSON report"
              >
                <Download className="w-3 h-3" />
                JSON
              </a>
            </div>
          </div>

          {/* Legal Links & Provider Attribution */}
          <div className="pt-2 border-t border-zinc-100 space-y-1.5 text-[11px] text-zinc-500">
            <div className="flex items-center justify-between text-zinc-600">
              <button 
                onClick={() => setShowPrivacyModal(true)}
                className="hover:text-zinc-900 underline font-medium"
              >
                Privacy Policy
              </button>
              <button 
                onClick={() => setShowTermsModal(true)}
                className="hover:text-zinc-900 underline font-medium"
              >
                Terms & Conditions
              </button>
            </div>
            <div className="text-[10px] text-zinc-400 text-center pt-1">
              Managed by <a href="https://zonovatechnology.online" target="_blank" rel="noreferrer" className="text-zinc-600 hover:underline font-semibold">zonovatechnology.online</a>
            </div>
          </div>

        </div>
      </aside>

      {/* Main Panel Content Area */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-10 flex flex-col justify-between">
        
        <div>
          {/* Backend offline alert overlay */}
          {!serverOnline && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex items-center gap-3 text-sm">
              <WifiOff className="w-5 h-5 flex-shrink-0 animate-bounce" />
              <div>
                <span className="font-bold">Database Server Disconnected.</span> Make sure your Express backend is running (`npm run start` or `npm run dev` in backend/). Reconnecting automatically...
              </div>
            </div>
          )}

          {/* Tab rendering */}
          {previewLead ? (
            <EmailPreview
              lead={previewLead}
              onClose={() => setPreviewLead(null)}
            />
          ) : activeTab === 'dashboard' ? (
            <Dashboard
              leads={leads}
              progress={progress}
              onStartCampaign={handleStartCampaign}
              onStopCampaign={handleStopCampaign}
              onSyncReplies={handleSyncReplies}
              onRunFollowups={handleRunFollowups}
            />
          ) : activeTab === 'jobseekers' ? (
            <JobSeekers
              settings={settings}
              onSaveSettings={(data) => setSettings(data)}
              leads={leads}
              onImportLeads={handleImportLeads}
              onClearLeads={handleClearLeads}
              onStartCampaign={handleStartCampaign}
            />
          ) : activeTab === 'campaign' ? (
            <Campaigns
              leads={leads}
              onImportLeads={handleImportLeads}
              onClearLeads={handleClearLeads}
              onSelectPreviewLead={(lead) => setPreviewLead(lead)}
            />
          ) : activeTab === 'settings' ? (
            <Settings
              settings={settings}
              onSaveSettings={(data) => setSettings(data)}
            />
          ) : activeTab === 'logs' ? (
            <Logs
              logs={logs}
              onClearLogs={() => setLogs([])}
            />
          ) : null}
        </div>

        {/* Footer info for mobile / bottom of page */}
        <footer className="mt-8 pt-4 border-t border-zinc-200 text-xs text-zinc-500 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <span className="font-semibold text-zinc-700">AI Mail Agent</span> &copy; 2026. All rights reserved.
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <a href="https://zonovatechnology.online" target="_blank" rel="noreferrer" className="text-zinc-600 hover:text-zinc-900 font-semibold underline">
              Managed by zonovatechnology.online
            </a>
            <span>&bull;</span>
            <button onClick={() => setShowPrivacyModal(true)} className="hover:text-zinc-900 underline">
              Privacy Policy
            </button>
            <span>&bull;</span>
            <button onClick={() => setShowTermsModal(true)} className="hover:text-zinc-900 underline">
              Terms & Conditions
            </button>
          </div>
        </footer>

      </main>

      {/* Privacy Policy Modal */}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-zinc-200 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            
            {/* Header */}
            <div className="p-5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-zinc-900 text-white rounded-lg">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-zinc-900 text-base">Privacy Policy</h3>
                  <span className="text-xs text-zinc-500">AI Mail Agent &bull; Managed by zonovatechnology.online</span>
                </div>
              </div>
              <button 
                onClick={() => setShowPrivacyModal(false)}
                className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs text-zinc-600 leading-relaxed">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 font-medium">
                🔒 <strong>100% Data Security Guarantee:</strong> Your candidate data, resume uploads, recipient email addresses, and SMTP credentials are fully encrypted and protected. We do not sell or expose your private information.
              </div>

              <div>
                <h4 className="font-bold text-zinc-900 text-sm mb-1">1. Information We Collect</h4>
                <p>When using AI Mail Agent, we process only the data necessary to execute your email outreach campaigns:</p>
                <ul className="list-disc list-inside mt-1.5 space-y-1 pl-2">
                  <li><strong>Candidate / Sender Credentials:</strong> SMTP host, port, sender email address, and App Passwords (stored encrypted in MongoDB Atlas).</li>
                  <li><strong>Uploaded Files:</strong> PDF resume attachments (strictly limited to 10MB) for auto-attaching to outreach emails.</li>
                  <li><strong>Lead Data:</strong> Company recipient names, HR emails, job titles, and customization variables.</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-zinc-900 text-sm mb-1">2. How Your Data Is Processed</h4>
                <p>All data is processed strictly for sending candidate job applications and B2B emails as explicitly commanded by the user. Automatic IMAP syncing checks replies only for tracked lead email threads.</p>
              </div>

              <div>
                <h4 className="font-bold text-zinc-900 text-sm mb-1">3. Storage & MongoDB Security</h4>
                <p>Data is stored in production MongoDB Atlas databases protected by network access control, SSL encryption in transit, and credential access guards. Database URIs and passwords are maintained exclusively in secure server environment variables.</p>
              </div>

              <div>
                <h4 className="font-bold text-zinc-900 text-sm mb-1">4. Contact & Support</h4>
                <p>If you have questions regarding your data privacy, contact our team directly at <a href="https://zonovatechnology.online" target="_blank" rel="noreferrer" className="text-zinc-900 font-semibold underline">zonovatechnology.online</a>.</p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-zinc-100 bg-zinc-50 flex justify-end">
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="px-5 py-2 bg-zinc-900 text-white rounded-lg text-xs font-semibold hover:bg-zinc-800 transition-all shadow-subtle"
              >
                I Understand
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Terms & Conditions Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-zinc-200 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            
            {/* Header */}
            <div className="p-5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-zinc-900 text-white rounded-lg">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-zinc-900 text-base">Terms & Conditions (T&C)</h3>
                  <span className="text-xs text-zinc-500">AI Mail Agent &bull; Managed by zonovatechnology.online</span>
                </div>
              </div>
              <button 
                onClick={() => setShowTermsModal(false)}
                className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs text-zinc-600 leading-relaxed">
              <div>
                <h4 className="font-bold text-zinc-900 text-sm mb-1">1. Acceptance of Terms</h4>
                <p>By accessing or using AI Mail Agent managed by <strong className="text-zinc-900">zonovatechnology.online</strong>, you agree to comply with these terms, standard email compliance guidelines, and anti-spam legislation (e.g. CAN-SPAM, GDPR).</p>
              </div>

              <div>
                <h4 className="font-bold text-zinc-900 text-sm mb-1">2. Acceptable Use Policy</h4>
                <p>AI Mail Agent is designed for candidate job applications, student career outreach, and legitimate B2B business inquiries. Users are strictly prohibited from using the platform to send unsolicited spam, abusive content, illegal material, or phishing communications.</p>
              </div>

              <div>
                <h4 className="font-bold text-zinc-900 text-sm mb-1">3. Rate Limits & Sending Guardrails</h4>
                <p>To preserve domain reputation and avoid email account suspension, users must configure responsible sending delays (recommended 30-120 seconds between emails) and respect provider hourly/daily quotas (e.g., Gmail's 500 emails/day limit).</p>
              </div>

              <div>
                <h4 className="font-bold text-zinc-900 text-sm mb-1">4. Disclaimer of Liability</h4>
                <p>AI Mail Agent and zonovatechnology.online provide automated delivery software. We do not guarantee job placements, interview callbacks, or recipient response rates. Users remain solely responsible for the content of their outreach messages.</p>
              </div>

              <div>
                <h4 className="font-bold text-zinc-900 text-sm mb-1">5. Platform Maintenance</h4>
                <p>System updates and server optimizations are continuously managed by zonovatechnology.online to ensure maximum uptime and database integrity.</p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-zinc-100 bg-zinc-50 flex justify-end">
              <button
                onClick={() => setShowTermsModal(false)}
                className="px-5 py-2 bg-zinc-900 text-white rounded-lg text-xs font-semibold hover:bg-zinc-800 transition-all shadow-subtle"
              >
                Accept Terms
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
