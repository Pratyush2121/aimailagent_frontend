import React, { useState, useRef } from 'react';
import { Upload, Database, FileSpreadsheet, Search, Eye, AlertCircle, X, Trash2, Plus, Sparkles, CheckCircle2, ArrowRight, ArrowLeft, Play, Paperclip, Mail, Layers } from 'lucide-react';
import { API_BASE_URL } from '../config';

export default function Campaigns({ leads, onImportLeads, onClearLeads, onSelectPreviewLead }) {
  const [googleUrl, setGoogleUrl] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [replyFilter, setReplyFilter] = useState('ALL');
  
  // Campaign Creator Wizard States
  const [showWizard, setShowWizard] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [campaignConfig, setCampaignConfig] = useState({
    name: 'Malaysia Builders B2B Campaign',
    mode: 'proposal', // 'proposal' | 'resume' | 'custom'
    subject: 'Construction Site Management & Automation for {company}',
    body: 'Hi {name},\n\nI noticed the ongoing construction and property development projects by {company} in Malaysia.\n\nManaging multi-site operations, material inventory, subcontractor billing, and daily worker attendance across sites can quickly become overwhelming without centralized tracking.\n\nAt Zonova Technologies Pvt Ltd (https://zonovatechnology.online), we build custom Construction & Site Management Systems tailored for builders and contractors.\n\nHere is how our platform streamlines operations for builders:\n• Real-time Multi-Site Project & Milestone Tracking\n• Digital Material Inventory & Vendor Invoice Automation\n• Daily Worker Attendance & Geofenced Site Verification\n• WhatsApp & Email Alerts for Project Delays & Approvals\n\nWould you be open to a casual 10-minute online demo next Thursday to see how we can optimize {company}\'s site management?\n\nBest regards,\nSales Team | Zonova Technologies Pvt Ltd\nWebsite: https://zonovatechnology.online\n\nRef: {reference}',
    attachResume: false,
    sendDelay: '0'
  });

  const fileInputRef = useRef(null);

  function convertGoogleSheetsUrl(url) {
    try {
      const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
      if (!match) return null;
      const sheetId = match[1];
      return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
    } catch (e) {
      return null;
    }
  }

  function parseCSV(text) {
    const lines = text.split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.replace(/["\r]/g, '').trim().toLowerCase());
    
    const emailIdx = headers.indexOf('email');
    const nameIdx = headers.indexOf('name');
    const companyIdx = headers.indexOf('company');
    
    if (emailIdx === -1 || nameIdx === -1 || companyIdx === -1) {
      throw new Error("CSV must contain 'name', 'company', and 'email' columns.");
    }

    const websiteIdx = headers.indexOf('website');
    const countryIdx = headers.indexOf('country');
    const industryIdx = headers.indexOf('industry');
    const refIdx = headers.indexOf('reference') !== -1 ? headers.indexOf('reference') : headers.indexOf('reference_code');

    const parsedLeads = [];
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      
      const values = [];
      let currentVal = '';
      let insideQuote = false;
      
      for (let charIdx = 0; charIdx < lines[i].length; charIdx++) {
        const char = lines[i][charIdx];
        if (char === '"') {
          insideQuote = !insideQuote;
        } else if (char === ',' && !insideQuote) {
          values.push(currentVal.trim().replace(/^"|"$/g, ''));
          currentVal = '';
        } else {
          currentVal += char;
        }
      }
      values.push(currentVal.trim().replace(/^"|"$/g, ''));

      if (values.length < headers.length) continue;

      const email = values[emailIdx]?.trim();
      const name = values[nameIdx]?.trim();
      const company = values[companyIdx]?.trim();

      if (!email || !name || !company) continue;

      parsedLeads.push({
        name,
        company,
        email,
        website: websiteIdx !== -1 ? values[websiteIdx] : '',
        country: countryIdx !== -1 ? values[countryIdx] : '',
        industry: industryIdx !== -1 ? values[industryIdx] : '',
        reference_code: refIdx !== -1 ? values[refIdx] : ''
      });
    }

    return parsedLeads;
  }

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setErrorMsg('');
    setSuccessMsg('');

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = parseCSV(evt.target.result);
        if (parsed.length === 0) {
          setErrorMsg("No valid leads found in CSV.");
          return;
        }
        onImportLeads(parsed);
        setSuccessMsg(`Successfully imported ${parsed.length} leads from CSV!`);
      } catch (err) {
        setErrorMsg(err.message);
      }
    };
    reader.readAsText(file);
  };

  const handleGoogleSheetImport = async () => {
    setErrorMsg('');
    setSuccessMsg('');

    if (!googleUrl) {
      setErrorMsg('Please paste a Google Sheets share URL.');
      return;
    }

    const csvUrl = convertGoogleSheetsUrl(googleUrl);
    if (!csvUrl) {
      setErrorMsg('Invalid Google Sheets URL format. Ensure it contains /d/SPREADSHEET_ID.');
      return;
    }

    try {
      setSuccessMsg('Fetching Google Sheet CSV data...');
      const res = await fetch(csvUrl);
      if (!res.ok) {
        throw new Error(`Google Sheets fetch error (${res.status}). Ensure link access is set to 'Anyone with the link can view'.`);
      }
      const text = await res.text();
      const parsed = parseCSV(text);

      if (parsed.length === 0) {
        throw new Error('Google Sheet returned 0 leads.');
      }

      onImportLeads(parsed);
      setSuccessMsg(`Successfully synced & imported ${parsed.length} prospects from Google Sheets!`);
      setGoogleUrl('');
    } catch (err) {
      setErrorMsg(err.message);
      setSuccessMsg('');
    }
  };

  const handleSeedMalaysiaLeads = async () => {
    setErrorMsg('');
    setSuccessMsg('Loading 25 Malaysian builder contacts...');
    try {
      const res = await fetch(`${API_BASE_URL}/api/leads/seed-malaysia`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(data.message);
        window.location.reload();
      } else {
        throw new Error(data.error);
      }
    } catch (e) {
      setErrorMsg(e.message);
      setSuccessMsg('');
    }
  };

  const handleCampaignModeChange = (mode) => {
    if (mode === 'proposal') {
      setCampaignConfig(prev => ({
        ...prev,
        mode,
        subject: 'Construction Site Management & Automation for {company}',
        body: 'Hi {name},\n\nI noticed the ongoing construction and property development projects by {company} in Malaysia.\n\nManaging multi-site operations, material inventory, subcontractor billing, and daily worker attendance across sites can quickly become overwhelming without centralized tracking.\n\nAt Zonava Technologies Pvt Ltd (https://zonovatechnology.online), we build custom Construction & Site Management Systems tailored for builders and contractors.\n\nWould you be open to a casual 10-minute online demo next Thursday to see how we can optimize {company}\'s site management?\n\nBest regards,\nSales Team | Zonava Technologies Pvt Ltd\nWebsite: https://zonovatechnology.online\n\nRef: {reference}'
      }));
    } else if (mode === 'resume') {
      setCampaignConfig(prev => ({
        ...prev,
        mode,
        subject: 'Application for Software Engineer Role at {company} - Candidate',
        body: 'Dear {name},\n\nI am reaching out to express my interest in Software Engineering roles at {company}.\n\nPlease find my resume attached to this email for your review.\n\nBest regards,\nCandidate'
      }));
    } else {
      setCampaignConfig(prev => ({ ...prev, mode }));
    }
  };

  const handleLaunchWizardCampaign = async () => {
    try {
      const payload = {
        email_subject_template: campaignConfig.subject,
        email_body_template: campaignConfig.body,
        campaign_mode: campaignConfig.mode,
        enable_resume_attachment: campaignConfig.mode === 'resume' ? 'true' : 'false'
      };

      await fetch(`${API_BASE_URL}/api/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      setShowWizard(false);
      alert('Campaign configured successfully! You can now click "Start Campaign" on the Console Dashboard.');
    } catch (e) {
      alert(`Error launching campaign: ${e.message}`);
    }
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.reference_code && lead.reference_code.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || lead.outbound_status === statusFilter;
    const matchesReply = replyFilter === 'ALL' || lead.reply_status === replyFilter;

    return matchesSearch && matchesStatus && matchesReply;
  });

  return (
    <div className="space-y-6 sm:space-y-8 text-zinc-900">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-zinc-900 tracking-tight flex items-center gap-2">
            <Layers className="w-5 h-5 text-zinc-900" />
            Campaigns & Prospect Leads
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Create structured outreach campaigns, import target leads, and monitor dispatch status.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setShowWizard(true);
              setCurrentStep(1);
            }}
            className="w-full sm:w-auto px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white font-medium rounded-lg text-xs transition-all shadow-subtle flex items-center justify-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Create New Campaign
          </button>
        </div>
      </div>

      {/* Quick Action Preset Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Card 1: 1-Click Malaysian Builders */}
        <div className="bg-white border border-zinc-200 rounded-xl p-5 space-y-3 shadow-minimal">
          <div className="flex items-center justify-between">
            <span className="text-xl">🇲🇾</span>
            <span className="text-[10px] font-medium bg-zinc-100 text-zinc-800 px-2 py-0.5 rounded border border-zinc-200">
              B2B Preset
            </span>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-zinc-900">Malaysian Builder Leads</h4>
            <p className="text-xs text-zinc-500 mt-0.5">25 verified construction & builder contacts</p>
          </div>
          <div className="pt-2 flex flex-col gap-1.5">
            <button
              onClick={handleSeedMalaysiaLeads}
              className="w-full py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white font-medium rounded-lg text-xs transition-all"
            >
              ⚡ 1-Click Load 25 Leads
            </button>
            <a
              href={`${API_BASE_URL}/api/download/malaysia-leads`}
              download="malaysia_builders_leads.csv"
              className="w-full py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded text-xs text-center transition-all border border-zinc-200"
            >
              📥 Download CSV
            </a>
          </div>
        </div>

        {/* Card 2: Google Sheets Live Sync */}
        <div className="bg-white border border-zinc-200 rounded-xl p-5 space-y-3 shadow-minimal">
          <div className="flex items-center justify-between">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            <span className="text-[10px] font-medium bg-zinc-100 text-zinc-800 px-2 py-0.5 rounded border border-zinc-200">Live Sync</span>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-zinc-900">Google Sheets Import</h4>
            <p className="text-xs text-zinc-500 mt-0.5">Paste public share link with name, company, email</p>
          </div>
          <div className="space-y-2 pt-1">
            <input
              type="text"
              value={googleUrl}
              onChange={(e) => setGoogleUrl(e.target.value)}
              placeholder="https://docs.google.com/spreadsheets/d/..."
              className="w-full bg-white border border-zinc-300 rounded-md px-3 py-1.5 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900"
            />
            <button
              onClick={handleGoogleSheetImport}
              className="w-full py-1.5 bg-white hover:bg-zinc-100 border border-zinc-300 text-zinc-900 font-medium rounded-lg text-xs transition-all"
            >
              Sync Sheet Leads
            </button>
          </div>
        </div>

        {/* Card 3: CSV File Upload */}
        <div className="bg-white border border-zinc-200 rounded-xl p-5 space-y-3 shadow-minimal flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <Upload className="w-5 h-5 text-zinc-900" />
            <span className="text-[10px] font-medium bg-zinc-100 text-zinc-800 px-2 py-0.5 rounded border border-zinc-200">Local Upload</span>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-zinc-900">Upload CSV File</h4>
            <p className="text-xs text-zinc-500 mt-0.5">Upload .csv file with columns: name, company, email</p>
          </div>
          <div className="pt-2">
            <input
              type="file"
              accept=".csv"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2 bg-white hover:bg-zinc-100 border border-zinc-300 text-zinc-900 font-medium rounded-lg text-xs transition-all flex items-center justify-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              Browse CSV File
            </button>
          </div>
        </div>

      </div>

      {/* Messages Alert */}
      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg('')}><X className="w-4 h-4" /></button>
        </div>
      )}

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Prospect Leads Table & Controls */}
      <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-minimal space-y-4">
        
        {/* Table Top Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search leads by name, company, email, or reference code..."
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-zinc-300 rounded-md text-xs text-zinc-900 focus:outline-none focus:border-zinc-900"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white border border-zinc-300 rounded-md px-2.5 py-1.5 text-xs text-zinc-800 focus:outline-none"
            >
              <option value="ALL">All Dispatch Status</option>
              <option value="Pending">Pending</option>
              <option value="Sent">Sent</option>
              <option value="Failed">Failed</option>
            </select>

            <select
              value={replyFilter}
              onChange={(e) => setReplyFilter(e.target.value)}
              className="bg-white border border-zinc-300 rounded-md px-2.5 py-1.5 text-xs text-zinc-800 focus:outline-none"
            >
              <option value="ALL">All Reply Status</option>
              <option value="Replied">Replied</option>
              <option value="No Reply">No Reply</option>
            </select>

            {leads.length > 0 && (
              <button
                onClick={onClearLeads}
                className="p-1.5 hover:bg-rose-50 text-rose-600 border border-rose-200 rounded-md transition-colors"
                title="Clear all leads"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg border border-zinc-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 text-zinc-500 uppercase text-[10px] font-semibold border-b border-zinc-200">
              <tr>
                <th className="p-3">Ref Code</th>
                <th className="p-3">Prospect Name</th>
                <th className="p-3">Company</th>
                <th className="p-3">Email Address</th>
                <th className="p-3 text-center">Dispatch Status</th>
                <th className="p-3 text-center">Reply Status</th>
                <th className="p-3 text-center">Follow-ups</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-zinc-700">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-zinc-400">
                    No matching prospect leads found. Import leads using Google Sheets or CSV above.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="p-3 font-mono text-[11px] text-zinc-500 font-medium">
                      {lead.reference_code}
                    </td>
                    <td className="p-3 font-medium text-zinc-900">{lead.name}</td>
                    <td className="p-3 font-semibold text-zinc-900">{lead.company}</td>
                    <td className="p-3 font-mono text-zinc-600">{lead.email}</td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        lead.outbound_status === 'Sent' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : lead.outbound_status === 'Failed' 
                          ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                          : 'bg-zinc-100 text-zinc-700 border border-zinc-200'
                      }`}>
                        {lead.outbound_status || 'Pending'}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        lead.reply_status === 'Replied' 
                          ? 'bg-emerald-100 text-emerald-800 font-bold' 
                          : 'text-zinc-400'
                      }`}>
                        {lead.reply_status || 'No Reply'}
                      </span>
                    </td>
                    <td className="p-3 text-center text-zinc-600 font-medium">
                      {lead.followup_count} / 3
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => onSelectPreviewLead(lead)}
                        className="p-1 hover:bg-zinc-100 border border-zinc-200 rounded text-zinc-600 hover:text-zinc-900 transition-all inline-flex items-center gap-1"
                        title="Preview personalized email for this lead"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span className="text-[11px]">Preview</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* WIZARD MODAL */}
      {showWizard && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-zinc-200 rounded-xl w-full max-w-2xl overflow-hidden shadow-float space-y-0 flex flex-col">
            
            {/* Modal Header */}
            <div className="p-4 bg-zinc-50 border-b border-zinc-200 flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-zinc-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-zinc-900" />
                  Create New Outreach Campaign
                </h3>
                <p className="text-xs text-zinc-500">Configure and launch bulk email outreach</p>
              </div>
              <button
                onClick={() => setShowWizard(false)}
                className="p-1 hover:bg-zinc-200 text-zinc-500 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Step Content Body */}
            <div className="p-5 overflow-y-auto space-y-5">
              
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 mb-1">
                      Campaign Name:
                    </label>
                    <input
                      type="text"
                      value={campaignConfig.name}
                      onChange={(e) => setCampaignConfig(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g. B2B Outreach 2026"
                      className="w-full bg-white border border-zinc-300 rounded-md px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-zinc-700">
                      Select Campaign Goal & Type:
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        onClick={() => handleCampaignModeChange('proposal')}
                        className={`p-3 rounded-lg border text-left transition-all ${
                          campaignConfig.mode === 'proposal'
                            ? 'bg-zinc-900 border-zinc-900 text-white shadow-subtle'
                            : 'bg-white border-zinc-200 text-zinc-800 hover:border-zinc-300'
                        }`}
                      >
                        <div className="font-semibold text-xs">🏢 B2B Proposal Outreach</div>
                        <div className={`text-[11px] mt-0.5 ${campaignConfig.mode === 'proposal' ? 'text-zinc-300' : 'text-zinc-500'}`}>Business pitch for construction & software demo</div>
                      </button>

                      <button
                        onClick={() => handleCampaignModeChange('resume')}
                        className={`p-3 rounded-lg border text-left transition-all ${
                          campaignConfig.mode === 'resume'
                            ? 'bg-zinc-900 border-zinc-900 text-white shadow-subtle'
                            : 'bg-white border-zinc-200 text-zinc-800 hover:border-zinc-300'
                        }`}
                      >
                        <div className="font-semibold text-xs">🎓 Candidate Resume Application</div>
                        <div className={`text-[11px] mt-0.5 ${campaignConfig.mode === 'resume' ? 'text-zinc-300' : 'text-zinc-500'}`}>Job seeker cold email with attached PDF resume</div>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-zinc-900">Current Loaded Prospects:</div>
                      <div className="text-sm font-bold text-zinc-900">{leads.length} Leads</div>
                    </div>
                    <span className="text-xs text-zinc-500">Ready for campaign dispatch</span>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 mb-1">Subject Template:</label>
                    <input
                      type="text"
                      value={campaignConfig.subject}
                      onChange={(e) => setCampaignConfig(prev => ({ ...prev, subject: e.target.value }))}
                      className="w-full bg-white border border-zinc-300 rounded-md px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-700 mb-1">Body Template:</label>
                    <textarea
                      rows={8}
                      value={campaignConfig.body}
                      onChange={(e) => setCampaignConfig(prev => ({ ...prev, body: e.target.value }))}
                      className="w-full bg-white border border-zinc-300 rounded-md p-3 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900 font-mono leading-relaxed"
                    />
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-3">
                  <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-lg space-y-2">
                    <h4 className="text-xs font-semibold text-zinc-900 uppercase tracking-wider">Campaign Summary:</h4>
                    <div className="text-xs text-zinc-700 space-y-1 font-mono">
                      <div>Name: <strong>{campaignConfig.name}</strong></div>
                      <div>Mode: <strong>{campaignConfig.mode}</strong></div>
                      <div>Total Leads: <strong>{leads.length} Prospects</strong></div>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer Controls */}
            <div className="p-3.5 bg-zinc-50 border-t border-zinc-200 flex items-center justify-between">
              <button
                onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
                disabled={currentStep === 1}
                className="px-3 py-1.5 bg-white border border-zinc-300 disabled:opacity-40 text-zinc-800 rounded-md text-xs font-medium"
              >
                Previous
              </button>

              {currentStep < 4 ? (
                <button
                  onClick={() => setCurrentStep(prev => Math.min(4, prev + 1))}
                  className="px-4 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-md text-xs font-medium shadow-subtle"
                >
                  Next Step
                </button>
              ) : (
                <button
                  onClick={handleLaunchWizardCampaign}
                  className="px-5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium rounded-md shadow-subtle"
                >
                  Save & Launch Campaign
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
