import React, { useState } from 'react';
import FileUpload from '../components/FileUpload';
import ResultCard from '../components/ResultCard';
import Spinner from '../components/Spinner';
import { resumeAPI } from '../api/requests';
import { Sparkles, FileText, Download, Copy, Check } from 'lucide-react';

// ── Resume Builder from Job Description ──────────────────
const ResumeBuilder = () => {
  const [jobDesc, setJobDesc] = useState('');
  const [name, setName]       = useState('');
  const [skills, setSkills]   = useState('');
  const [exp, setExp]         = useState('');
  const [edu, setEdu]         = useState('');
  const [result, setResult]   = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied]   = useState(false);
  const [error, setError]     = useState('');

  const buildResume = async () => {
    if (!jobDesc.trim()) return;
    setLoading(true); setError(''); setResult('');
    try {
      const res = await resumeAPI.buildFromJD({
        jobDescription: jobDesc,
        name, skills, experience: exp, education: edu,
      });
      setResult(res.data.resume);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to build resume');
    } finally { setLoading(false); }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadTxt = () => {
    const blob = new Blob([result], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'resume.txt'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="upload-layout">
      <div className="upload-panel">
        <div className="section-card">
          <h2 className="card-title">🤖 AI Resume Builder</h2>
          <p style={{ fontSize:'0.85rem', color:'#64748b', marginBottom:'1.25rem', marginTop:'-0.5rem' }}>
            Paste a job description and get a tailored resume instantly
          </p>

          <div className="form-group">
            <label>Your Full Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Jane Smith"/>
          </div>

          <div className="form-group">
            <label>Job Description *</label>
            <textarea value={jobDesc} onChange={e => setJobDesc(e.target.value)}
              placeholder="Paste the full job description here — the AI will tailor your resume to match it exactly..."
              rows={6} className="textarea"/>
          </div>

          <div className="form-group">
            <label>Your Skills (optional)</label>
            <textarea value={skills} onChange={e => setSkills(e.target.value)}
              placeholder="e.g. React, Node.js, Python, SQL, AWS, Team Leadership..."
              rows={2} className="textarea"/>
          </div>

          <div className="form-group">
            <label>Work Experience (optional)</label>
            <textarea value={exp} onChange={e => setExp(e.target.value)}
              placeholder="e.g. 3 years as Frontend Developer at XYZ Corp, built e-commerce platforms..."
              rows={3} className="textarea"/>
          </div>

          <div className="form-group">
            <label>Education (optional)</label>
            <textarea value={edu} onChange={e => setEdu(e.target.value)}
              placeholder="e.g. B.Tech Computer Science, ABC University, 2021..."
              rows={2} className="textarea"/>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button className="btn-primary btn-full" onClick={buildResume} disabled={!jobDesc.trim()||loading}>
            {loading ? <Spinner size="sm"/> : <><Sparkles size={16}/> Build Resume</>}
          </button>

          {loading && <p className="analyzing-hint">⏳ Building your tailored resume... 15-30 seconds</p>}
        </div>
      </div>

      <div className="result-panel">
        {result ? (
          <div className="section-card" style={{ height:'100%' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1rem' }}>
              <h2 style={{ fontSize:'1rem', fontWeight:700, color:'#e2e8f0' }}>✅ Your Tailored Resume</h2>
              <div style={{ display:'flex', gap:'0.5rem' }}>
                <button onClick={copyToClipboard} className="btn-ghost" style={{ fontSize:'0.8rem', padding:'0.4rem 0.75rem' }}>
                  {copied ? <><Check size={14}/> Copied!</> : <><Copy size={14}/> Copy</>}
                </button>
                <button onClick={downloadTxt} className="btn-primary" style={{ fontSize:'0.8rem', padding:'0.4rem 0.75rem' }}>
                  <Download size={14}/> Download
                </button>
              </div>
            </div>
            <pre style={{ whiteSpace:'pre-wrap', fontFamily:'DM Sans,sans-serif', fontSize:'0.82rem', color:'#94a3b8', lineHeight:1.8, background:'#050810', padding:'1.25rem', borderRadius:10, border:'1px solid #1e293b', maxHeight:600, overflowY:'auto' }}>
              {result}
            </pre>
            <div style={{ marginTop:'0.75rem', padding:'0.75rem 1rem', background:'rgba(99,102,241,0.08)', border:'1px solid rgba(99,102,241,0.2)', borderRadius:8 }}>
              <p style={{ fontSize:'0.8rem', color:'#94a3b8', margin:0 }}>
                💡 <strong style={{ color:'#a5b4fc' }}>Tip:</strong> Copy this resume, paste it into a Word doc or Google Doc, then format it with your preferred style before submitting.
              </p>
            </div>
          </div>
        ) : (
          !loading && (
            <div className="result-placeholder">
              <FileText size={48} className="placeholder-icon"/>
              <h3>Your resume will appear here</h3>
              <p>Fill in the details and click Build Resume</p>
              <div style={{ marginTop:'1rem', textAlign:'left', background:'rgba(99,102,241,0.08)', border:'1px solid rgba(99,102,241,0.15)', borderRadius:10, padding:'1rem' }}>
                <p style={{ fontSize:'0.82rem', color:'#94a3b8', margin:'0 0 0.5rem', fontWeight:600 }}>What this does:</p>
                <ul style={{ listStyle:'none', display:'flex', flexDirection:'column', gap:'0.35rem' }}>
                  {['Matches keywords from the job description','Highlights relevant skills and experience','Writes a professional summary tailored to the role','Structures sections for maximum ATS score','Ready to copy and paste into any format'].map((item,i) => (
                    <li key={i} style={{ fontSize:'0.8rem', color:'#64748b', display:'flex', gap:'0.5rem' }}>
                      <span style={{ color:'#10b981' }}>✓</span>{item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};

// ── Main Upload Page ──────────────────────────────────────
const UploadPage = () => {
  const [tab, setTab]             = useState('analyze');
  const [file, setFile]           = useState(null);
  const [jobDescription, setJD]   = useState('');
  const [result, setResult]       = useState(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true); setError(''); setResult(null);
    try {
      const formData = new FormData();
      formData.append('resume', file);
      if (jobDescription.trim()) formData.append('jobDescription', jobDescription);
      const res = await resumeAPI.upload(formData);
      setResult(res.data.resume);
    } catch (err) {
      setError(err.response?.data?.error || 'Analysis failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Resume Tools</h1>
          <p className="page-subtitle">Analyze your resume or build one tailored to a job description</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:'0.5rem', marginBottom:'1.5rem' }}>
        <button onClick={() => setTab('analyze')}
          style={{ display:'flex', alignItems:'center', gap:'0.4rem', padding:'0.55rem 1.25rem', borderRadius:8, border:'1px solid', fontSize:'0.875rem', fontWeight:600, cursor:'pointer', fontFamily:'inherit', transition:'all 0.2s', borderColor:tab==='analyze'?'rgba(99,102,241,0.4)':'#1e293b', background:tab==='analyze'?'rgba(99,102,241,0.12)':'transparent', color:tab==='analyze'?'#a5b4fc':'#64748b' }}>
          <Sparkles size={15}/> Analyze Resume
        </button>
        <button onClick={() => setTab('build')}
          style={{ display:'flex', alignItems:'center', gap:'0.4rem', padding:'0.55rem 1.25rem', borderRadius:8, border:'1px solid', fontSize:'0.875rem', fontWeight:600, cursor:'pointer', fontFamily:'inherit', transition:'all 0.2s', borderColor:tab==='build'?'rgba(99,102,241,0.4)':'#1e293b', background:tab==='build'?'rgba(99,102,241,0.12)':'transparent', color:tab==='build'?'#a5b4fc':'#64748b' }}>
          <FileText size={15}/> Build from Job Description
        </button>
      </div>

      {/* Analyze Tab */}
      {tab === 'analyze' && (
        <div className="upload-layout">
          <div className="upload-panel">
            <div className="section-card">
              <h2 className="card-title">Upload Resume</h2>
              <FileUpload onFileSelect={setFile} file={file} onClear={() => { setFile(null); setResult(null); }}/>
              <div className="form-group" style={{ marginTop:'1.5rem' }}>
                <label>Job Description (optional)</label>
                <textarea value={jobDescription} onChange={e => setJD(e.target.value)}
                  placeholder="Paste the job description to get tailored keyword analysis and ATS score..."
                  rows={5} className="textarea"/>
              </div>
              {error && <div className="auth-error">{error}</div>}
              <button className="btn-primary btn-full" onClick={handleAnalyze} disabled={!file||loading}>
                {loading ? <Spinner size="sm"/> : <><Sparkles size={16}/> Analyze with AI</>}
              </button>
              {loading && <p className="analyzing-hint">⏳ Analyzing your resume… this may take 15–30 seconds</p>}
            </div>
          </div>
          <div className="result-panel">
            {result ? (
              <ResultCard analysis={result.analysis} fileName={result.fileName}/>
            ) : !loading && (
              <div className="result-placeholder">
                <Sparkles size={48} className="placeholder-icon"/>
                <h3>Your analysis will appear here</h3>
                <p>Upload a PDF and click Analyze to get started</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Build Tab */}
      {tab === 'build' && <ResumeBuilder/>}
    </div>
  );
};

export default UploadPage;