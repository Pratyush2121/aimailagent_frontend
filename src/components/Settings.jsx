import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import { 
  Settings as SettingsIcon, 
  ShieldCheck, 
  Mail, 
  Database, 
  Bot, 
  Save, 
  AlertCircle, 
  CheckCircle, 
  HelpCircle, 
  Upload, 
  FileText, 
  Sparkles, 
  Paperclip,
  Lock,
  BookOpen,
  Key,
  Check,
  Server
} from 'lucide-react';

export default function Settings({ settings, onSaveSettings }) {
  const [formData, setFormData] = useState({
    use_ai: 'false',
    email_subject_template: '',
    email_body_template: '',
    ai_provider: 'gemini',
    gemini_api_key: '',
    openai_api_key: '',
    sender_company_name: 'Zonava',
    sender_company_description: '',
    smtp_host: 'smtp.gmail.com',
    smtp_port: '465',
    smtp_secure: 'true',
    smtp_user: '',
    smtp_pass: '',
    smtp_from_name: 'Candidate',
    send_delay_seconds: '1',
    imap_host: 'imap.gmail.com',
    imap_port: '993',
    imap_secure: 'true',
    imap_user: '',
    imap_pass: '',
    resume_url: '',
    resume_filename: '',
    resume_saved_file: '',
    target_job_role: 'Software Development'
  });

  const [loading, setLoading] = useState(true);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [saveStatus, setSaveStatus] = useState({ success: false, message: '' });

  useEffect(() => {
    async function loadSettings() {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/settings`);
        const data = await res.json();
        if (data.success) {
          setFormData(prev => ({ ...prev, ...data.settings }));
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, [settings]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds 10MB limit! Please upload a PDF under 10MB.');
      return;
    }

    setUploadingResume(true);
    try {
      const data = new FormData();
      data.append('resume', file);

      const res = await fetch(`${API_BASE_URL}/api/resume/upload`, {
        method: 'POST',
        body: data
      });
      const result = await res.json();
      if (result.success) {
        setFormData(prev => ({
          ...prev,
          resume_filename: result.resume_filename,
          resume_saved_file: result.resume_saved_file,
          resume_url: result.resume_url
        }));
        alert('Resume uploaded successfully!');
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      alert(`Upload error: ${err.message}`);
    } finally {
      setUploadingResume(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveStatus({ success: false, message: 'Saving configuration...' });

    try {
      const res = await fetch(`${API_BASE_URL}/api/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (data.success) {
        setSaveStatus({ success: true, message: 'Settings & configuration saved successfully!' });
        if (onSaveSettings) onSaveSettings(formData);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      setSaveStatus({ success: false, message: `Save error: ${error.message}` });
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-zinc-500 font-medium">
        Loading system configuration...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 text-zinc-900">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-zinc-900 tracking-tight flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-zinc-900" />
            Configuration, Setup Guide & Security Assurances
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Manage SMTP credentials, step-by-step setup guides, and privacy guarantees.
          </p>
        </div>

        <button
          onClick={handleSubmit}
          className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white font-medium rounded-lg text-xs transition-all shadow-subtle flex items-center gap-1.5"
        >
          <Save className="w-3.5 h-3.5" />
          Save Configuration
        </button>
      </div>

      {saveStatus.message && (
        <div className={`p-3 rounded-lg text-xs font-medium flex items-center gap-2 ${
          saveStatus.success 
            ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' 
            : 'bg-rose-50 border border-rose-200 text-rose-700'
        }`}>
          {saveStatus.success ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
          <span>{saveStatus.message}</span>
        </div>
      )}

      {/* 🔒 100% REAL DATA SECURITY & PRIVACY GUARANTEE BOX */}
      <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-minimal space-y-4">
        <div className="flex items-center gap-2.5 border-b border-zinc-100 pb-3">
          <div className="p-2 bg-zinc-100 rounded-lg text-zinc-900 border border-zinc-200">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
              🔒 100% Local Self-Hosted & Data Privacy Guarantee
            </h3>
            <p className="text-xs text-zinc-500">Your email passwords, API keys, and prospect list stay strictly on your computer.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-lg space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-900">
              <Server className="w-3.5 h-3.5 text-emerald-600" />
              100% Local SQLite Database
            </div>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              All credentials, email matters, and HR lists are saved locally on your computer in <code className="text-zinc-900 font-mono font-semibold">database.sqlite</code>.
            </p>
          </div>

          <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-lg space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-900">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Zero External Data Sharing
            </div>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              No passwords, emails, or resumes are ever uploaded to any third-party cloud database or tracking server.
            </p>
          </div>

          <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-lg space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-900">
              <Key className="w-3.5 h-3.5 text-emerald-600" />
              Direct Encrypted SMTP Send
            </div>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              Emails are dispatched directly from your Gmail/SMTP server to target HRs without any middleman interception.
            </p>
          </div>
        </div>
      </div>

      {/* 📖 STEP-BY-STEP SETUP GUIDE & HOW TO USE */}
      <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-minimal space-y-5">
        <div className="flex items-center gap-2.5 border-b border-zinc-100 pb-3">
          <div className="p-2 bg-zinc-100 rounded-lg text-zinc-900 border border-zinc-200">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-900">
              📖 How to Setup & How to Use AI Mail Agent
            </h3>
            <p className="text-xs text-zinc-500">Step-by-step instructions to get your automated outreach running in 3 minutes.</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-zinc-900 uppercase tracking-wider">
              Step 1: How to Generate Gmail App Password (Required for sending emails)
            </h4>
            <ol className="list-decimal list-inside text-xs text-zinc-600 space-y-1.5 leading-relaxed bg-zinc-50 p-3.5 rounded-lg border border-zinc-200">
              <li>Open your Google Account: <a href="https://myaccount.google.com/security" target="_blank" rel="noreferrer" className="text-zinc-900 underline font-semibold">myaccount.google.com/security</a>.</li>
              <li>Make sure <strong>2-Step Verification</strong> is enabled.</li>
              <li>Search for <strong>"App Passwords"</strong> or visit <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noreferrer" className="text-zinc-900 underline font-semibold">myaccount.google.com/apppasswords</a>.</li>
              <li>Type an App Name (e.g. <code className="text-zinc-900 font-semibold">AI Mail Agent</code>) and click <strong>Create</strong>.</li>
              <li>Copy the 16-character generated password and paste it into the <strong>SMTP App Password</strong> box below!</li>
            </ol>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-zinc-900 uppercase tracking-wider">
              Step 2: How to Use Job Seekers Portal
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg space-y-1">
                <span className="font-semibold text-zinc-900">1. Fill Profile & Resume</span>
                <p className="text-[11px] text-zinc-500">Enter candidate name, target role, portfolio link and upload PDF Resume (Max 10MB limit).</p>
              </div>

              <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg space-y-1">
                <span className="font-semibold text-zinc-900">2. Select Email Matter</span>
                <p className="text-[11px] text-zinc-500">Pick from 12 pre-crafted templates or write custom matter. Tags like <code className="text-zinc-900 font-semibold">&#123;&#123;company&#125;&#125;</code> replace automatically!</p>
              </div>

              <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg space-y-1">
                <span className="font-semibold text-zinc-900">3. Add Target HR Emails</span>
                <p className="text-[11px] text-zinc-500">Add HR emails individually or paste bulk list (Google, Microsoft, Meta HR emails).</p>
              </div>

              <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg space-y-1">
                <span className="font-semibold text-zinc-900">4. Launch Campaign</span>
                <p className="text-[11px] text-zinc-500">Click "Launch Job Outreach Campaign Now". Watch live logs & automatic inbox reply scanning.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* SECTION 1: SMTP EMAIL SENDER CREDENTIALS */}
        <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-minimal space-y-4">
          <div className="flex items-center gap-2 border-b border-zinc-100 pb-3">
            <Mail className="w-4 h-4 text-zinc-900" />
            <h3 className="text-sm font-semibold text-zinc-900">1. Outbound SMTP Mail Server Settings</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Sender Name (From Name)</label>
              <input
                type="text"
                name="smtp_from_name"
                value={formData.smtp_from_name}
                onChange={handleChange}
                placeholder="Rahul Sharma"
                className="w-full bg-white border border-zinc-300 rounded-md px-3 py-1.5 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">SMTP Username / Email</label>
              <input
                type="email"
                name="smtp_user"
                value={formData.smtp_user}
                onChange={handleChange}
                placeholder="user@gmail.com"
                className="w-full bg-white border border-zinc-300 rounded-md px-3 py-1.5 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">SMTP App Password (16-Digit)</label>
              <input
                type="password"
                name="smtp_pass"
                value={formData.smtp_pass}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full bg-white border border-zinc-300 rounded-md px-3 py-1.5 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">SMTP Host Server</label>
              <input
                type="text"
                name="smtp_host"
                value={formData.smtp_host}
                onChange={handleChange}
                placeholder="smtp.gmail.com"
                className="w-full bg-white border border-zinc-300 rounded-md px-3 py-1.5 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">SMTP Port</label>
              <input
                type="text"
                name="smtp_port"
                value={formData.smtp_port}
                onChange={handleChange}
                placeholder="465"
                className="w-full bg-white border border-zinc-300 rounded-md px-3 py-1.5 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Delay Between Mails (Seconds)</label>
              <input
                type="number"
                name="send_delay_seconds"
                value={formData.send_delay_seconds}
                onChange={handleChange}
                min="0"
                className="w-full bg-white border border-zinc-300 rounded-md px-3 py-1.5 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900 font-mono"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: IMAP REPLIES CHECKER */}
        <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-minimal space-y-4">
          <div className="flex items-center gap-2 border-b border-zinc-100 pb-3">
            <ShieldCheck className="w-4 h-4 text-zinc-900" />
            <h3 className="text-sm font-semibold text-zinc-900">2. IMAP Inbox Reply Sync Settings</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">IMAP Host</label>
              <input
                type="text"
                name="imap_host"
                value={formData.imap_host}
                onChange={handleChange}
                placeholder="imap.gmail.com"
                className="w-full bg-white border border-zinc-300 rounded-md px-3 py-1.5 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">IMAP Username / Email</label>
              <input
                type="email"
                name="imap_user"
                value={formData.imap_user}
                onChange={handleChange}
                placeholder="user@gmail.com"
                className="w-full bg-white border border-zinc-300 rounded-md px-3 py-1.5 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">IMAP Password</label>
              <input
                type="password"
                name="imap_pass"
                value={formData.imap_pass}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full bg-white border border-zinc-300 rounded-md px-3 py-1.5 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900 font-mono"
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: EMAIL TEMPLATE & RESUME PDF */}
        <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-minimal space-y-4">
          <div className="flex items-center gap-2 border-b border-zinc-100 pb-3">
            <Paperclip className="w-4 h-4 text-zinc-900" />
            <h3 className="text-sm font-semibold text-zinc-900">3. Default Email Template & Resume Attachment</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center bg-zinc-50 p-3.5 rounded-lg border border-zinc-200">
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Resume File (PDF)</label>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleResumeUpload}
                disabled={uploadingResume}
                className="hidden"
                id="settings-resume-input"
              />
              <label
                htmlFor="settings-resume-input"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-zinc-100 border border-zinc-300 text-zinc-800 text-xs font-medium rounded-md cursor-pointer transition-all"
              >
                <Upload className="w-3.5 h-3.5" />
                {uploadingResume ? 'Uploading...' : 'Choose Resume PDF File'}
              </label>
            </div>

            {formData.resume_filename && (
              <div className="flex items-center justify-between bg-white p-2.5 rounded-md border border-zinc-200">
                <span className="text-xs font-mono text-zinc-800 truncate">📄 {formData.resume_filename}</span>
                <a
                  href={formData.resume_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] bg-zinc-100 hover:bg-zinc-200 text-zinc-800 px-2 py-0.5 rounded font-medium border border-zinc-300"
                >
                  View PDF
                </a>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 mb-1">Default Subject Template</label>
            <input
              type="text"
              name="email_subject_template"
              value={formData.email_subject_template}
              onChange={handleChange}
              placeholder="Application for {{role}} at {{company}} - {{candidate_name}}"
              className="w-full bg-white border border-zinc-300 rounded-md px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 mb-1">Default Body Template</label>
            <textarea
              rows={6}
              name="email_body_template"
              value={formData.email_body_template}
              onChange={handleChange}
              placeholder="Dear {{name}},\n\nI am writing to express my interest in {{role}} opportunities at {{company}}..."
              className="w-full bg-white border border-zinc-300 rounded-md p-3 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900 font-mono leading-relaxed"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-6 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white font-medium rounded-lg text-xs transition-all shadow-subtle flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Configuration Settings
          </button>
        </div>

      </form>
    </div>
  );
}
