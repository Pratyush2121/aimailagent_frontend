import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import { 
  GraduationCap, 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Send, 
  Sparkles, 
  User, 
  Briefcase, 
  Mail, 
  Link as LinkIcon, 
  Plus, 
  Trash2, 
  HelpCircle, 
  Copy, 
  Check, 
  Zap, 
  Building2,
  FileCheck,
  Rocket
} from 'lucide-react';

// 12 Pre-written High-Converting Cold Email Templates / Matters for Job Seekers & Students
const PRESET_MATTERS = [
  {
    id: 'swe',
    title: '💻 Software Engineer / Full Stack Developer',
    role: 'Software Engineer',
    subject: 'Application for Software Engineer Role at {{company}} - {{candidate_name}}',
    body: `Dear {{name}},\n\nI hope this email finds you well.\n\nI am reaching out to express my strong interest in Software Engineering opportunities at {{company}}. With hands-on experience in full-stack web development, clean code architecture, and modern JavaScript/Python frameworks, I am eager to contribute to {{company}}'s engineering team.\n\nKey Highlights:\n- Proficient in React, Node.js, REST APIs, and Database Management\n- Built scalable web applications with high performance standards\n- Portfolio & Projects: {{portfolio}}\n\nMy resume is attached to this email for your review. I would welcome the opportunity to discuss how my technical skills align with {{company}}'s upcoming projects.\n\nThank you for your time and consideration.\n\nWarm regards,\n{{candidate_name}}\n{{portfolio}}`
  },
  {
    id: 'frontend',
    title: '🎨 Frontend Web Developer (React / Web)',
    role: 'Frontend Developer',
    subject: 'Frontend Developer Inquiry - {{candidate_name}} | {{company}}',
    body: `Hi {{name}},\n\nI have been following {{company}}'s recent product innovations and love the user experience your team builds. I am writing to apply for Frontend Developer positions at {{company}}.\n\nI specialize in crafting high-performance, interactive user interfaces using React, JavaScript/TypeScript, and modern CSS systems.\n\nQuick Summary of My Work:\n- Developed responsive, accessible web interfaces\n- Optimized web performance and component reuse\n- View my portfolio: {{portfolio}}\n\nI have attached my resume for your review. Are you open to a brief chat next week to discuss potential openings on your engineering team?\n\nBest regards,\n{{candidate_name}}`
  },
  {
    id: 'backend',
    title: '⚙️ Backend / API Systems Engineer',
    role: 'Backend Engineer',
    subject: 'Backend Engineer Inquiry - {{candidate_name}} for {{company}}',
    body: `Hello {{name}},\n\nI am writing to express my interest in Backend Engineering roles at {{company}}. I specialize in building robust microservices, designing scalable REST/GraphQL APIs, and optimizing database queries.\n\nWhat I bring to {{company}}:\n- Expertise in server-side technologies, database indexing, and backend architecture\n- Strong problem-solving skills and experience with async event loops\n- Portfolio: {{portfolio}}\n\nPlease find my resume attached. I would be thrilled to learn more about upcoming engineering challenges at {{company}}.\n\nSincerely,\n{{candidate_name}}`
  },
  {
    id: 'data_analyst',
    title: '📊 Data Analyst / Data Scientist',
    role: 'Data Analyst',
    subject: 'Data Analyst Application - {{candidate_name}} | {{company}}',
    body: `Dear {{name}},\n\nI am reaching out to express my enthusiasm for Data Analytics opportunities at {{company}}. I turn complex data into actionable business insights using SQL, Python, Tableau, and statistical modeling.\n\nHighlights of my technical skill set:\n- SQL queries, data wrangling, and predictive data analysis\n- Automated reporting dashboards and business metric tracking\n- Portfolio: {{portfolio}}\n\nMy resume is attached to this email. I would love the chance to connect and discuss how I can add value to {{company}}'s data initiatives.\n\nBest regards,\n{{candidate_name}}`
  },
  {
    id: 'fresher',
    title: '🎓 Fresh Graduate / Entry Level Application',
    role: 'Software Engineer Trainee',
    subject: 'Entry-Level Opportunities at {{company}} - {{candidate_name}}',
    body: `Dear {{name}},\n\nAs a recent computer science graduate passionate about tech, I am writing to express my eager interest in entry-level engineering roles at {{company}}.\n\nDuring my academic coursework and personal projects, I gained practical skills in web development, algorithms, and software testing. I am proactive, quick to learn new tech stacks, and dedicated to delivering clean code.\n\nPortfolio & Projects: {{portfolio}}\n\nI have attached my resume for your reference. I would appreciate the opportunity to learn about entry-level or graduate hiring programs at {{company}}.\n\nThank you for your time.\n\nSincerely,\n{{candidate_name}}`
  },
  {
    id: 'internship',
    title: '🚀 Student Internship Application',
    role: 'Software Engineering Intern',
    subject: 'Software Internship Inquiry - {{candidate_name}} | {{company}}',
    body: `Hi {{name}},\n\nI am currently pursuing my degree in Computer Science and am writing to inquire about software engineering internship positions at {{company}}.\n\nI have hands-on experience building projects in JavaScript, React, and Python, and I am eager to apply my problem-solving skills in a fast-paced team environment at {{company}}.\n\nProjects & Code Samples: {{portfolio}}\n\nMy resume is attached to this email. I would be grateful for the chance to contribute to your team as an intern.\n\nWarm regards,\n{{candidate_name}}`
  },
  {
    id: 'designer',
    title: '🎯 UI/UX & Product Designer Pitch',
    role: 'UI/UX Designer',
    subject: 'UI/UX Designer Inquiry - {{candidate_name}} | {{company}}',
    body: `Hi {{name}},\n\nI am a UI/UX Designer who loves crafting intuitive digital experiences. I have been following {{company}}'s product design and would love to explore potential design roles on your team.\n\nMy expertise includes Figma, user research, wireframing, and design systems.\n\nCheck out my design portfolio here: {{portfolio}}\n\nMy detailed resume is attached. I'd love to chat about how I can contribute to {{company}}'s product UX.\n\nBest regards,\n{{candidate_name}}`
  },
  {
    id: 'marketing',
    title: '📈 Digital Marketing & Growth Specialist',
    role: 'Growth Marketer',
    subject: 'Growth & Digital Marketing Role - {{candidate_name}} | {{company}}',
    body: `Hello {{name}},\n\nI am reaching out to share my interest in Digital Marketing and Growth roles at {{company}}. I focus on user acquisition, SEO/SEM, email automation campaigns, and data-driven marketing strategy.\n\nKey Achievements:\n- Optimized organic search rankings and reduced customer acquisition cost\n- Managed multi-channel content and paid campaign strategies\n- Portfolio: {{portfolio}}\n\nPlease find my resume attached. I look forward to discussing how I can help scale {{company}}'s growth.\n\nBest,\n{{candidate_name}}`
  },
  {
    id: 'devops',
    title: '🛠️ DevOps & Cloud Infrastructure Engineer',
    role: 'DevOps Engineer',
    subject: 'DevOps & Cloud Engineer Application - {{candidate_name}} | {{company}}',
    body: `Dear {{name}},\n\nI am writing to inquire about DevOps and Cloud Infrastructure opportunities at {{company}}. I specialize in CI/CD automation pipelines, Docker, Kubernetes, AWS/GCP cloud environments, and infrastructure monitoring.\n\nHighlights:\n- Built automated deployment workflows reducing release downtime\n- Strong experience in infrastructure as code and cloud security\n- Portfolio: {{portfolio}}\n\nMy resume is attached. I look forward to connecting with your engineering leadership team.\n\nSincerely,\n{{candidate_name}}`
  },
  {
    id: 'product',
    title: '💡 Product Manager / Associate PM',
    role: 'Associate Product Manager',
    subject: 'Associate PM Opportunities at {{company}} - {{candidate_name}}',
    body: `Dear {{name}},\n\nI am writing to express my interest in Product Management roles at {{company}}. With a background bridging technical execution and business strategy, I excel at defining product roadmaps, gathering user feedback, and collaborating with cross-functional teams.\n\nPortfolio & Case Studies: {{portfolio}}\n\nPlease see my attached resume. I would be thrilled to discuss how I can contribute to {{company}}'s product roadmap.\n\nWarm regards,\n{{candidate_name}}`
  },
  {
    id: 'qa',
    title: '🔍 Software Testing / QA Engineer',
    role: 'QA Engineer',
    subject: 'QA Engineer Application - {{candidate_name}} | {{company}}',
    body: `Hi {{name}},\n\nI am reaching out regarding QA & Automated Testing roles at {{company}}. I specialize in test automation frameworks (Selenium, Cypress, Jest), bug tracking, and manual exploratory testing to ensure software quality.\n\nPortfolio & Test Cases: {{portfolio}}\n\nMy resume is attached. I would love to connect and discuss how I can assist {{company}} in maintaining high bug-free product standards.\n\nBest regards,\n{{candidate_name}}`
  },
  {
    id: 'elevator',
    title: '🔥 High-Impact Direct Elevator Pitch',
    role: 'Software Developer',
    subject: 'Quick question for {{company}} HR team - {{candidate_name}}',
    body: `Hi {{name}},\n\nI know you're busy, so I'll keep this short.\n\nI'm {{candidate_name}}, a passionate developer with expertise in building fast web applications and scalable solutions. I'm actively looking for opportunities at {{company}}.\n\nPortfolio link: {{portfolio}}\n\nI've attached my 1-page resume. If {{company}} is currently hiring or building out your team, I'd love to chat for 5 minutes.\n\nThanks,\n{{candidate_name}}`
  }
];

export default function JobSeekers({ settings, onSaveSettings, leads, onImportLeads, onClearLeads, onStartCampaign }) {
  // Candidate Profile State
  const [candidateName, setCandidateName] = useState('');
  const [candidateEmail, setCandidateEmail] = useState('');
  const [targetRole, setTargetRole] = useState('Software Engineer');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  
  // Resume File Upload State
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState({ text: '', isError: false });
  const [savedResumeInfo, setSavedResumeInfo] = useState({ filename: '', savedFile: '', url: '' });

  // Template / Matter Selection State
  const [selectedMatterId, setSelectedMatterId] = useState('swe');
  const [customSubject, setCustomSubject] = useState(PRESET_MATTERS[0].subject);
  const [customBody, setCustomBody] = useState(PRESET_MATTERS[0].body);
  const [copiedTag, setCopiedTag] = useState('');

  // Target HR Leads Input State
  const [hrInputMode, setHrInputMode] = useState('single');
  const [singleHrName, setSingleHrName] = useState('');
  const [singleCompany, setSingleCompany] = useState('');
  const [singleHrEmail, setSingleHrEmail] = useState('');
  const [bulkHrText, setBulkHrText] = useState('');

  useEffect(() => {
    if (settings) {
      if (settings.smtp_from_name) setCandidateName(settings.smtp_from_name);
      if (settings.smtp_user) setCandidateEmail(settings.smtp_user);
      if (settings.candidate_portfolio) setPortfolioUrl(settings.candidate_portfolio);
      if (settings.candidate_target_role) setTargetRole(settings.candidate_target_role);
      if (settings.resume_filename) {
        setSavedResumeInfo({
          filename: settings.resume_filename,
          savedFile: settings.resume_saved_file || '',
          url: settings.resume_url || ''
        });
      }
      if (settings.email_subject_template && !settings.email_subject_template.includes('partnership query')) {
        setCustomSubject(settings.email_subject_template);
      }
      if (settings.email_body_template && !settings.email_body_template.includes('partnership')) {
        setCustomBody(settings.email_body_template);
      }
    }
  }, [settings]);

  const handleSelectTemplate = (templateId) => {
    setSelectedMatterId(templateId);
    if (templateId !== 'custom') {
      const preset = PRESET_MATTERS.find(m => m.id === templateId);
      if (preset) {
        setCustomSubject(preset.subject);
        setCustomBody(preset.body);
        if (preset.role) setTargetRole(preset.role);
      }
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setUploadMessage({ text: '', isError: false });
    if (!file) return;

    const MAX_SIZE_BYTES = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE_BYTES) {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      setUploadMessage({
        text: `File size is ${fileSizeMB} MB. Resume must be strictly 10 MB or smaller.`,
        isError: true
      });
      setSelectedFile(null);
      e.target.value = '';
      return;
    }

    setSelectedFile(file);
    setUploadMessage({
      text: `Selected file: ${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB). Ready to upload!`,
      isError: false
    });
  };

  const handleUploadResume = async () => {
    if (!selectedFile) {
      setUploadMessage({ text: 'Please select a resume PDF file first.', isError: true });
      return;
    }

    setUploading(true);
    setUploadMessage({ text: 'Uploading resume to server...', isError: false });

    try {
      const formData = new FormData();
      formData.append('resume', selectedFile);

      const res = await fetch(`${API_BASE_URL}/api/resume/upload`, {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (data.success) {
        setSavedResumeInfo({
          filename: data.resume_filename,
          savedFile: data.resume_saved_file,
          url: data.resume_url
        });
        setUploadMessage({ text: `Resume uploaded successfully!`, isError: false });
        setSelectedFile(null);
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      setUploadMessage({ text: `Upload failed: ${err.message}`, isError: true });
    } finally {
      setUploading(false);
    }
  };

  const handleSaveJobSeekerConfig = async (silent = false) => {
    try {
      const payload = {
        smtp_from_name: candidateName,
        candidate_portfolio: portfolioUrl,
        candidate_target_role: targetRole,
        email_subject_template: customSubject,
        email_body_template: customBody,
        campaign_mode: 'resume',
        enable_resume_attachment: 'true',
        use_ai: 'false'
      };

      const res = await fetch(`${API_BASE_URL}/api/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        if (onSaveSettings) onSaveSettings({ ...settings, ...payload });
        if (!silent) alert('Job Seeker email matter & configuration saved successfully!');
        return true;
      } else {
        throw new Error(data.error);
      }
    } catch (e) {
      alert(`Save error: ${e.message}`);
      return false;
    }
  };

  const handleLaunchCampaignNow = async () => {
    if (leads.length === 0) {
      alert('Please add at least one HR Email address before launching the campaign.');
      return;
    }
    const saved = await handleSaveJobSeekerConfig(true);
    if (saved && onStartCampaign) {
      onStartCampaign();
    }
  };

  const handleAddHrLeads = () => {
    let newLeads = [];

    if (hrInputMode === 'single') {
      if (!singleHrEmail || !singleCompany) {
        alert('Please enter at least Company Name and HR Email Address.');
        return;
      }
      newLeads.push({
        name: singleHrName || 'Hiring Manager',
        company: singleCompany,
        email: singleHrEmail.toLowerCase(),
        industry: targetRole,
        website: portfolioUrl
      });
      setSingleHrName('');
      setSingleCompany('');
      setSingleHrEmail('');
    } else {
      const lines = bulkHrText.split('\n').filter(l => l.trim().length > 0);
      lines.forEach(line => {
        const parts = line.split(',').map(p => p.trim());
        if (parts.length >= 3) {
          newLeads.push({
            name: parts[0],
            company: parts[1],
            email: parts[2].toLowerCase(),
            industry: targetRole
          });
        } else if (parts.length === 2) {
          newLeads.push({
            name: 'Hiring Manager',
            company: parts[0],
            email: parts[1].toLowerCase(),
            industry: targetRole
          });
        } else if (parts.length === 1 && parts[0].includes('@')) {
          const emailStr = parts[0].toLowerCase();
          const domain = emailStr.split('@')[1] ? emailStr.split('@')[1].split('.')[0] : 'Company';
          const companyCap = domain.charAt(0).toUpperCase() + domain.slice(1);
          newLeads.push({
            name: 'Hiring Manager',
            company: companyCap,
            email: emailStr,
            industry: targetRole
          });
        }
      });
      if (newLeads.length === 0) {
        alert('No valid HR emails detected. Please check your formatted input.');
        return;
      }
      setBulkHrText('');
    }

    if (onImportLeads) {
      onImportLeads(newLeads);
    }
  };

  const copyToClipboard = (tag) => {
    navigator.clipboard.writeText(tag);
    setCopiedTag(tag);
    setTimeout(() => setCopiedTag(''), 2000);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 text-zinc-900">
      
      {/* Header Banner (Pure Minimalism Theme) */}
      <div className="bg-white p-6 md:p-8 rounded-xl border border-zinc-200 shadow-minimal flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-100 border border-zinc-200 text-zinc-800 text-xs font-medium">
            <GraduationCap className="w-3.5 h-3.5" />
            Job Seekers & Student Suite
          </div>
          <h1 className="text-xl md:text-2xl font-semibold text-zinc-900 tracking-tight">
            Automated Job Cold Emailing
          </h1>
          <p className="text-xs text-zinc-500 max-w-2xl">
            Upload your Resume (Max 10MB limit), choose from 12 pre-crafted email matters or write your custom email format, add target HR emails, and send automatically.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2.5">
          <button
            onClick={() => handleSaveJobSeekerConfig(false)}
            className="w-full sm:w-auto px-4 py-2 bg-white hover:bg-zinc-100 text-zinc-800 font-medium text-xs rounded-lg transition-all border border-zinc-300"
          >
            Save Matter
          </button>

          <button
            onClick={handleLaunchCampaignNow}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs rounded-lg transition-all shadow-subtle"
          >
            <Rocket className="w-3.5 h-3.5" />
            Launch HR Outreach
          </button>
        </div>
      </div>

      {/* Grid Section 1: Candidate Info & Resume Upload */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Candidate Profile Info Box */}
        <div className="bg-white border border-zinc-200 rounded-xl p-6 space-y-4 shadow-minimal">
          <div className="flex items-center gap-3 border-b border-zinc-100 pb-3">
            <div className="p-2 bg-zinc-100 rounded-lg text-zinc-800 border border-zinc-200">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-900">1. Candidate Profile Details</h2>
              <p className="text-xs text-zinc-500">Details inserted into signatures and greetings</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Candidate Full Name</label>
              <input
                type="text"
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="w-full bg-white border border-zinc-300 rounded-lg px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Candidate Email Address</label>
              <input
                type="email"
                value={candidateEmail}
                onChange={(e) => setCandidateEmail(e.target.value)}
                placeholder="rahul@gmail.com"
                className="w-full bg-white border border-zinc-300 rounded-lg px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Target Role / Designation</label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="Software Engineer"
                className="w-full bg-white border border-zinc-300 rounded-lg px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Portfolio / LinkedIn Link</label>
              <input
                type="url"
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
                placeholder="https://github.com/rahuldev"
                className="w-full bg-white border border-zinc-300 rounded-lg px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900"
              />
            </div>
          </div>
        </div>

        {/* Resume PDF Upload Box (STRICT 10MB LIMIT) */}
        <div className="bg-white border border-zinc-200 rounded-xl p-6 space-y-4 shadow-minimal flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3 mb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-zinc-100 rounded-lg text-zinc-800 border border-zinc-200">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-zinc-900">2. Upload Candidate Resume</h2>
                  <p className="text-xs text-zinc-500">PDF attached with every email sent to HRs</p>
                </div>
              </div>

              <span className="px-2 py-0.5 bg-zinc-100 text-zinc-700 border border-zinc-200 rounded text-[10px] font-mono">
                Max 10MB Limit
              </span>
            </div>

            {savedResumeInfo.filename ? (
              <div className="mb-3 p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-zinc-800 font-medium truncate">
                  <FileCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span className="truncate">Active Resume: <strong>{savedResumeInfo.filename}</strong></span>
                </div>
                {savedResumeInfo.url && (
                  <a 
                    href={savedResumeInfo.url} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-[10px] bg-white hover:bg-zinc-100 text-zinc-800 px-2 py-1 rounded font-medium border border-zinc-300"
                  >
                    View PDF
                  </a>
                )}
              </div>
            ) : null}

            <div className="border border-dashed border-zinc-300 rounded-lg p-4 text-center bg-zinc-50 space-y-2">
              <FileText className="w-6 h-6 text-zinc-600 mx-auto" />
              <div>
                <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-zinc-100 text-zinc-900 font-medium text-xs rounded-md border border-zinc-300 transition-all">
                  <span>Browse PDF Resume</span>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                <p className="text-[10px] text-zinc-500 mt-1">PDF / DOC under 10 MB limit</p>
              </div>
            </div>

            {uploadMessage.text && (
              <div className={`mt-3 p-2.5 rounded-lg text-xs font-medium flex items-center gap-2 ${
                uploadMessage.isError 
                  ? 'bg-rose-50 border border-rose-200 text-rose-700' 
                  : 'bg-emerald-50 border border-emerald-200 text-emerald-700'
              }`}>
                {uploadMessage.isError ? <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" /> : <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />}
                <span>{uploadMessage.text}</span>
              </div>
            )}
          </div>

          <button
            onClick={handleUploadResume}
            disabled={!selectedFile || uploading}
            className={`w-full mt-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-2 ${
              !selectedFile || uploading
                ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed border border-zinc-200'
                : 'bg-zinc-900 hover:bg-zinc-800 text-white shadow-subtle'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            {uploading ? 'Uploading Resume...' : 'Upload Resume (Max 10MB)'}
          </button>
        </div>

      </div>

      {/* Section 2: Instructions & Format Guidelines */}
      <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-minimal space-y-3">
        <div className="flex items-center gap-3 border-b border-zinc-100 pb-3">
          <div className="p-2 bg-zinc-100 rounded-lg text-zinc-800 border border-zinc-200">
            <HelpCircle className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-zinc-900">3. Email Format Instructions & Dynamic Tags</h2>
            <p className="text-xs text-zinc-500">Format yahi rahega. Har mail me HR Name, Company Name automatic badal jayenge!</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
          {[
            { tag: '{{name}}', label: 'HR / Contact Name' },
            { tag: '{{company}}', label: 'Target Company' },
            { tag: '{{email}}', label: 'HR Email Address' },
            { tag: '{{role}}', label: 'Applied Job Role' },
            { tag: '{{candidate_name}}', label: 'Your Candidate Name' },
            { tag: '{{portfolio}}', label: 'Portfolio Link' },
            { tag: '{{resume_url}}', label: 'Attached Resume URL' }
          ].map((item) => (
            <button
              key={item.tag}
              onClick={() => copyToClipboard(item.tag)}
              className="p-2 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-md text-left transition-all"
              title="Click to copy placeholder tag"
            >
              <div className="flex items-center justify-between">
                <code className="text-xs font-semibold text-zinc-900">{item.tag}</code>
                {copiedTag === item.tag ? (
                  <Check className="w-3 h-3 text-emerald-600" />
                ) : (
                  <Copy className="w-3 h-3 text-zinc-400" />
                )}
              </div>
              <span className="text-[10px] text-zinc-500 block mt-0.5">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-600 leading-relaxed flex items-start gap-2">
          <Sparkles className="w-3.5 h-3.5 text-zinc-900 flex-shrink-0 mt-0.5" />
          <div>
            <strong>Automated Customization:</strong> Subject aur body matter me jab aap <code className="text-zinc-900 font-semibold">&#123;&#123;company&#125;&#125;</code> aur <code className="text-zinc-900 font-semibold">&#123;&#123;name&#125;&#125;</code> add karte ho, system har HR email bhejte waqt automatic us target company aur HR ka name replace kar dega aur resume attachment bhej dega.
          </div>
        </div>
      </div>

      {/* Section 3: Select 10-12 Pre-written Matters or Write Custom Matter */}
      <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-minimal space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-zinc-100 rounded-lg text-zinc-800 border border-zinc-200">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-900">4. Select Email Matter / Template (12 Presets + Custom Option)</h2>
              <p className="text-xs text-zinc-500">Choose a pre-written application template or write your custom email matter</p>
            </div>
          </div>

          <span className="text-xs text-zinc-600 font-medium bg-zinc-100 border border-zinc-200 px-2.5 py-1 rounded-md">
            12 Recommended Templates
          </span>
        </div>

        {/* Template Selector Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
          {PRESET_MATTERS.map((matter) => (
            <button
              key={matter.id}
              onClick={() => handleSelectTemplate(matter.id)}
              className={`p-3 rounded-lg border text-left transition-all ${
                selectedMatterId === matter.id
                  ? 'bg-zinc-900 border-zinc-900 text-white shadow-subtle'
                  : 'bg-white border-zinc-200 hover:border-zinc-300 text-zinc-800'
              }`}
            >
              <div className={`text-xs font-semibold mb-0.5 truncate ${selectedMatterId === matter.id ? 'text-white' : 'text-zinc-900'}`}>{matter.title}</div>
              <p className={`text-[11px] line-clamp-2 leading-tight ${selectedMatterId === matter.id ? 'text-zinc-300' : 'text-zinc-500'}`}>{matter.subject}</p>
            </button>
          ))}

          <button
            onClick={() => handleSelectTemplate('custom')}
            className={`p-3 rounded-lg border text-left transition-all ${
              selectedMatterId === 'custom'
                ? 'bg-zinc-900 border-zinc-900 text-white shadow-subtle'
                : 'bg-white border-zinc-200 hover:border-zinc-300 text-zinc-800'
            }`}
          >
            <div className={`text-xs font-semibold mb-0.5 truncate ${selectedMatterId === 'custom' ? 'text-white' : 'text-zinc-900'}`}>
              ✍️ Custom Matter (Write Custom)
            </div>
            <p className={`text-[11px] line-clamp-2 ${selectedMatterId === 'custom' ? 'text-zinc-300' : 'text-zinc-500'}`}>Write your custom subject & body matter</p>
          </button>
        </div>

        {/* Selected Email Matter Editor & Live Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pt-1">
          
          {/* Editor Controls */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Email Subject Format</label>
              <input
                type="text"
                value={customSubject}
                onChange={(e) => { setCustomSubject(e.target.value); setSelectedMatterId('custom'); }}
                placeholder="Application for {{role}} at {{company}} - {{candidate_name}}"
                className="w-full bg-white border border-zinc-300 rounded-lg px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Email Body Matter Format</label>
              <textarea
                rows={11}
                value={customBody}
                onChange={(e) => { setCustomBody(e.target.value); setSelectedMatterId('custom'); }}
                placeholder="Hi {{name}},\n\nI am writing to apply for..."
                className="w-full bg-white border border-zinc-300 rounded-lg p-3 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900 font-mono leading-relaxed"
              />
            </div>
          </div>

          {/* Real-time Email Output Preview */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 flex flex-col justify-between text-white">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <span className="text-xs font-medium text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" /> Sample Live HR Preview
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">Sample: Google HR</span>
              </div>

              <div>
                <span className="text-[10px] text-zinc-400 font-medium block uppercase">Subject Line:</span>
                <div className="text-xs font-semibold text-white bg-zinc-950 p-2 rounded-md border border-zinc-800 mt-1 font-mono">
                  {customSubject
                    .replace(/{{name}}/gi, 'Priya Mehta')
                    .replace(/{{company}}/gi, 'Google')
                    .replace(/{{role}}/gi, targetRole || 'Software Engineer')
                    .replace(/{{candidate_name}}/gi, candidateName || 'Rahul Sharma')}
                </div>
              </div>

              <div>
                <span className="text-[10px] text-zinc-400 font-medium block uppercase">Email Body Text:</span>
                <div className="text-xs text-zinc-200 bg-zinc-950 p-3 rounded-md border border-zinc-800 mt-1 font-mono whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto">
                  {customBody
                    .replace(/{{name}}/gi, 'Priya Mehta')
                    .replace(/{{company}}/gi, 'Google')
                    .replace(/{{role}}/gi, targetRole || 'Software Engineer')
                    .replace(/{{candidate_name}}/gi, candidateName || 'Rahul Sharma')
                    .replace(/{{portfolio}}/gi, portfolioUrl || 'https://github.com/rahuldev')
                    .replace(/{{resume_url}}/gi, savedResumeInfo.url || 'Attached_Resume.pdf')}
                </div>
              </div>

              {savedResumeInfo.filename && (
                <div className="p-2 bg-zinc-800 border border-zinc-700 rounded-md flex items-center gap-2 text-[11px] text-emerald-400">
                  <FileCheck className="w-3.5 h-3.5" />
                  <span>Attachment: {savedResumeInfo.filename}</span>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Section 4: Target Companies HR Email List Input */}
      <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-minimal space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-zinc-100 rounded-lg text-zinc-800 border border-zinc-200">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-900">5. Target Companies HR Email List ({leads.length} Added)</h2>
              <p className="text-xs text-zinc-500">Add HR emails of companies where you want to send your application</p>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-lg border border-zinc-200">
            <button
              onClick={() => setHrInputMode('single')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                hrInputMode === 'single' ? 'bg-zinc-900 text-white shadow-subtle' : 'text-zinc-600'
              }`}
            >
              Single Entry
            </button>
            <button
              onClick={() => setHrInputMode('bulk')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                hrInputMode === 'bulk' ? 'bg-zinc-900 text-white shadow-subtle' : 'text-zinc-600'
              }`}
            >
              Bulk HR List
            </button>
          </div>
        </div>

        {hrInputMode === 'single' ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-zinc-50 p-3.5 rounded-lg border border-zinc-200">
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">HR Name (Optional)</label>
              <input
                type="text"
                value={singleHrName}
                onChange={(e) => setSingleHrName(e.target.value)}
                placeholder="Priya Mehta"
                className="w-full bg-white border border-zinc-300 rounded-md px-3 py-1.5 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Company Name *</label>
              <input
                type="text"
                value={singleCompany}
                onChange={(e) => setSingleCompany(e.target.value)}
                placeholder="Google / Microsoft"
                className="w-full bg-white border border-zinc-300 rounded-md px-3 py-1.5 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">HR Email Address *</label>
              <input
                type="email"
                value={singleHrEmail}
                onChange={(e) => setSingleHrEmail(e.target.value)}
                placeholder="hr@google.com"
                className="w-full bg-white border border-zinc-300 rounded-md px-3 py-1.5 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={handleAddHrLeads}
                className="w-full py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs rounded-md transition-all flex items-center justify-center gap-1 shadow-subtle"
              >
                <Plus className="w-3.5 h-3.5" /> Add HR to List
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2 bg-zinc-50 p-3.5 rounded-lg border border-zinc-200">
            <label className="block text-xs font-medium text-zinc-700">
              Paste Bulk HR Emails (Format: <code className="text-zinc-900 font-semibold">hr@company.com</code> OR <code className="text-zinc-900 font-semibold">Company, hr@company.com</code>)
            </label>
            <textarea
              rows={4}
              value={bulkHrText}
              onChange={(e) => setBulkHrText(e.target.value)}
              placeholder={"Google, hr@google.com\nMicrosoft, careers@microsoft.com\nPriya, Meta, priya@meta.com"}
              className="w-full bg-white border border-zinc-300 rounded-md p-2.5 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900 font-mono"
            />
            <button
              onClick={handleAddHrLeads}
              className="px-4 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs rounded-md transition-all flex items-center gap-1.5 shadow-subtle"
            >
              <Plus className="w-3.5 h-3.5" /> Import Bulk HR List
            </button>
          </div>
        )}

        <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 text-zinc-500 uppercase text-[10px] font-semibold border-b border-zinc-200">
              <tr>
                <th className="py-2.5 px-3.5">HR Name</th>
                <th className="py-2.5 px-3.5">Company</th>
                <th className="py-2.5 px-3.5">HR Email</th>
                <th className="py-2.5 px-3.5">Role</th>
                <th className="py-2.5 px-3.5">Mail Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-zinc-700">
              {leads.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-zinc-400">
                    No HR emails added yet. Use the form above to add target HR emails.
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="py-2.5 px-3.5 font-medium text-zinc-900">{lead.name}</td>
                    <td className="py-2.5 px-3.5 text-zinc-900 font-semibold">{lead.company}</td>
                    <td className="py-2.5 px-3.5 font-mono text-zinc-600">{lead.email}</td>
                    <td className="py-2.5 px-3.5 text-zinc-500">{lead.industry || targetRole}</td>
                    <td className="py-2.5 px-3.5">
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
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {leads.length > 0 && (
          <div className="flex items-center justify-between pt-1">
            <button
              onClick={onClearLeads}
              className="text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1 font-medium transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear HR Email List
            </button>

            <button
              onClick={handleLaunchCampaignNow}
              className="flex items-center gap-2 px-5 py-2 bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs rounded-lg transition-all shadow-subtle"
            >
              <Rocket className="w-3.5 h-3.5" />
              Launch Job Outreach Campaign Now ({leads.length} Mails)
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
