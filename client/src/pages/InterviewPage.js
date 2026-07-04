import React, { useState, useEffect, useRef, useCallback } from 'react';
import { interviewAPI, resumeAPI } from '../api/requests';
import Spinner from '../components/Spinner';
import {
  Send, Square, ChevronDown, Mic, MicOff, Volume2, VolumeX,
  BarChart2, MessageSquare, CheckCircle, XCircle, Lightbulb,
  BookOpen, ArrowRight, Target, ThumbsUp, ThumbsDown, Minus, Download
} from 'lucide-react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';

const useSpeechRecognition = () => {
  const [transcript, setTranscript] = useState('');
  const [listening, setListening] = useState(false);
  const recRef = useRef(null);
  const supported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  const startListening = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const r = new SR();
    r.continuous = true; r.interimResults = true; r.lang = 'en-US';
    r.onresult = (e) => {
      let final = '';
      for (let i = e.resultIndex; i < e.results.length; i++)
        if (e.results[i].isFinal) final += e.results[i][0].transcript;
      if (final) setTranscript(p => (p + ' ' + final).trim());
    };
    r.onend = () => setListening(false);
    r.onerror = () => setListening(false);
    recRef.current = r; r.start(); setListening(true);
  }, []);
  const stopListening = useCallback(() => { recRef.current?.stop(); setListening(false); }, []);
  const clearTranscript = useCallback(() => setTranscript(''), []);
  return { transcript, listening, supported, startListening, stopListening, clearTranscript, setTranscript };
};

const useTTS = () => {
  const [speaking, setSpeaking] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const speak = useCallback((text) => {
    if (!enabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.95; u.pitch = 1; u.volume = 1;
    const voices = window.speechSynthesis.getVoices();
    const v = voices.find(v => v.name.includes('Google') && v.lang === 'en-US') || voices.find(v => v.lang === 'en-US') || voices[0];
    if (v) u.voice = v;
    u.onstart = () => setSpeaking(true);
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(u);
  }, [enabled]);
  const stop = useCallback(() => { window.speechSynthesis?.cancel(); setSpeaking(false); }, []);
  return { speaking, enabled, setEnabled, speak, stop };
};

const ScoreRing = ({ score, label, size = 110 }) => {
  const r = 42, circ = 2 * Math.PI * r;
  const color = score >= 75 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444';
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
      <svg width={size} height={size} viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#1e293b" strokeWidth="8"/>
        <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={circ} strokeDashoffset={circ-(score/100)*circ}
          strokeLinecap="round" transform="rotate(-90 50 50)"
          style={{ transition:'stroke-dashoffset 1s ease' }}/>
        <text x="50" y="46" textAnchor="middle" fill="white" fontSize="20" fontWeight="bold">{score}</text>
        <text x="50" y="62" textAnchor="middle" fill="#94a3b8" fontSize="9">/100</text>
      </svg>
      <span style={{ fontSize:'0.72rem', color:'#64748b', textTransform:'uppercase', letterSpacing:'0.05em', fontWeight:600, textAlign:'center' }}>{label}</span>
    </div>
  );
};

const QualityBadge = ({ quality }) => {
  const map = {
    good:    { icon:ThumbsUp,   color:'#10b981', bg:'rgba(16,185,129,0.1)',  border:'rgba(16,185,129,0.25)', label:'Good' },
    average: { icon:Minus,      color:'#f59e0b', bg:'rgba(245,158,11,0.1)', border:'rgba(245,158,11,0.25)', label:'Average' },
    poor:    { icon:ThumbsDown, color:'#ef4444', bg:'rgba(239,68,68,0.1)',  border:'rgba(239,68,68,0.25)',  label:'Needs Work' },
  };
  const cfg = map[quality] || map.average;
  const Icon = cfg.icon;
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:4, fontSize:'0.72rem', fontWeight:700, color:cfg.color, background:cfg.bg, border:`1px solid ${cfg.border}`, borderRadius:20, padding:'0.15rem 0.55rem' }}>
      <Icon size={11}/>{cfg.label}
    </span>
  );
};

const MetricCard = ({ label, score, feedback, color }) => (
  <div style={{ background:'#0c1120', border:'1px solid #1e293b', borderRadius:12, padding:'1.25rem' }}>
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.5rem' }}>
      <span style={{ fontSize:'0.875rem', fontWeight:600, color:'#e2e8f0' }}>{label}</span>
      <span style={{ fontSize:'1.1rem', fontWeight:800, fontFamily:'Syne,sans-serif', color }}>{score}/100</span>
    </div>
    <div style={{ height:6, background:'#1e293b', borderRadius:99, marginBottom:'0.75rem', overflow:'hidden' }}>
      <div style={{ height:'100%', width:`${score}%`, background:color, borderRadius:99, transition:'width 1s ease' }}/>
    </div>
    <p style={{ fontSize:'0.8rem', color:'#64748b', margin:0, lineHeight:1.6 }}>{feedback}</p>
  </div>
);

const InterviewPage = () => {
  const [step, setStep]           = useState('setup');
  const [resumes, setResumes]     = useState([]);
  const [form, setForm]           = useState({ jobRole:'', jobDescription:'', resumeId:'', difficulty:'medium' });
  const [interview, setInterview] = useState(null);
  const [messages, setMessages]   = useState([]);
  const [input, setInput]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [feedback, setFeedback]   = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const messagesEndRef = useRef(null);

  const { transcript, listening, supported:sttOk, startListening, stopListening, clearTranscript, setTranscript } = useSpeechRecognition();
  const { speaking, enabled:ttsOn, setEnabled:setTts, speak, stop:stopSpeak } = useTTS();

  useEffect(() => { resumeAPI.getAll().then(r => setResumes(r.data.resumes)); }, []);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior:'smooth' }); }, [messages]);
  useEffect(() => { if (transcript) setInput(transcript.trim()); }, [transcript]);

  const toggleMic = () => { if (listening) stopListening(); else { clearTranscript(); setInput(''); startListening(); } };

  const startInterview = async () => {
    if (!form.jobRole.trim()) return;
    setLoading(true); setError('');
    try {
      const res = await interviewAPI.start(form);
      setInterview(res.data.interview);
      setMessages(res.data.interview.messages);
      setStep('active');
      if (res.data.interview.messages[0]) speak(res.data.interview.messages[0].content);
    } catch (err) { setError(err.response?.data?.error || 'Failed to start'); }
    finally { setLoading(false); }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const msg = input.trim();
    setInput(''); clearTranscript(); if (listening) stopListening();
    setMessages(p => [...p, { role:'user', content:msg }]);
    setLoading(true);
    try {
      const res = await interviewAPI.sendMessage(interview._id, msg);
      setMessages(p => [...p, { role:'assistant', content:res.data.message }]);
      speak(res.data.message);
    } catch { setMessages(p => [...p, { role:'assistant', content:'Sorry, something went wrong.' }]); }
    finally { setLoading(false); }
  };

  const endInterview = async () => {
    setLoading(true); stopSpeak();
    try {
      const res = await interviewAPI.end(interview._id);
      setFeedback(res.data.interview.feedback);
      setStep('feedback');
    } catch (err) { setError(err.response?.data?.error || 'Failed to get feedback'); }
    finally { setLoading(false); }
  };

  const reset = () => {
    setStep('setup'); setFeedback(null); setMessages([]);
    setInterview(null); setInput(''); clearTranscript(); stopSpeak(); setActiveTab('overview');
  };

  // ── SETUP ─────────────────────────────────────────────
  if (step === 'setup') return (
    <div className="page">
      <div className="page-header">
        <div><h1 className="page-title">Mock Interview</h1><p className="page-subtitle">AI-powered interview with voice & detailed analysis</p></div>
      </div>
      <div className="setup-card">
        <div className="form-group">
          <label>Job Role *</label>
          <input type="text" value={form.jobRole} onChange={e => setForm({...form, jobRole:e.target.value})} placeholder="e.g. Senior Frontend Engineer"/>
        </div>
        <div className="form-group">
          <label>Difficulty</label>
          <div className="difficulty-tabs">
            {['easy','medium','hard'].map(d => (
              <button key={d} className={`difficulty-tab ${form.difficulty===d?'active':''} diff-${d}`} onClick={() => setForm({...form,difficulty:d})}>
                {d.charAt(0).toUpperCase()+d.slice(1)}
              </button>
            ))}
          </div>
        </div>
        {resumes.length > 0 && (
          <div className="form-group">
            <label>Resume (optional)</label>
            <div className="select-wrap">
              <select value={form.resumeId} onChange={e => setForm({...form,resumeId:e.target.value})}>
                <option value="">— No resume —</option>
                {resumes.map(r => <option key={r._id} value={r._id}>{r.fileName}</option>)}
              </select>
              <ChevronDown size={16} className="select-icon"/>
            </div>
          </div>
        )}
        <div className="form-group">
          <label>Job Description (optional)</label>
          <textarea value={form.jobDescription} onChange={e => setForm({...form,jobDescription:e.target.value})}
            placeholder="Paste job description for a targeted interview..." rows={4} className="textarea"/>
        </div>
        {sttOk && (
          <div style={{ background:'rgba(99,102,241,0.08)', border:'1px solid rgba(99,102,241,0.2)', borderRadius:10, padding:'0.9rem 1rem', display:'flex', alignItems:'center', gap:'0.75rem' }}>
            <Mic size={18} style={{ color:'#a5b4fc', flexShrink:0 }}/>
            <p style={{ fontSize:'0.82rem', color:'#94a3b8', margin:0 }}>Voice input & text-to-speech supported. Speak your answers during the interview.</p>
          </div>
        )}
        {error && <div className="auth-error">{error}</div>}
        <button className="btn-primary btn-full" onClick={startInterview} disabled={!form.jobRole.trim()||loading}>
          {loading ? <Spinner size="sm"/> : '🎤 Start Interview'}
        </button>
      </div>
    </div>
  );

  // ── ACTIVE ────────────────────────────────────────────
  if (step === 'active') return (
    <div className="page interview-page">
      <div className="interview-header">
        <div><h2 className="interview-role">{interview.jobRole}</h2><span className={`diff-badge diff-${interview.difficulty}`}>{interview.difficulty}</span></div>
        <div style={{ display:'flex', gap:'0.5rem', alignItems:'center' }}>
          <button onClick={() => { setTts(!ttsOn); if (ttsOn) stopSpeak(); }}
            style={{ background:ttsOn?'rgba(99,102,241,0.15)':'rgba(100,116,139,0.1)', border:`1px solid ${ttsOn?'rgba(99,102,241,0.3)':'#1e293b'}`, color:ttsOn?'#a5b4fc':'#64748b', padding:'0.45rem 0.75rem', borderRadius:8, cursor:'pointer', display:'flex', alignItems:'center', gap:'0.4rem', fontSize:'0.8rem', fontWeight:600 }}>
            {ttsOn?<Volume2 size={15}/>:<VolumeX size={15}/>} {ttsOn?'Voice On':'Voice Off'}
          </button>
          <button className="btn-danger" onClick={endInterview} disabled={loading}><Square size={14}/> End & Analyze</button>
        </div>
      </div>
      {speaking && (
        <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', padding:'0.5rem 0.75rem', background:'rgba(99,102,241,0.08)', border:'1px solid rgba(99,102,241,0.2)', borderRadius:8, marginBottom:'0.75rem' }}>
          <div style={{ display:'flex', gap:3 }}>{[0,1,2,3].map(i => <div key={i} style={{ width:3, height:16, background:'#6366f1', borderRadius:2, animation:'sw 0.8s ease infinite', animationDelay:`${i*0.15}s` }}/>)}</div>
          <span style={{ fontSize:'0.8rem', color:'#a5b4fc' }}>AI Interviewer is speaking...</span>
          <button onClick={stopSpeak} style={{ marginLeft:'auto', background:'none', border:'none', color:'#64748b', cursor:'pointer', fontSize:'0.75rem' }}>Stop</button>
        </div>
      )}
      <div className="chat-window">
        {messages.map((m,i) => (
          <div key={i} className={`chat-msg ${m.role}`}>
            <div className="chat-bubble">
              {m.role==='assistant' && <div style={{ fontSize:'0.7rem', color:'#6366f1', fontWeight:700, marginBottom:'0.35rem', textTransform:'uppercase', letterSpacing:'0.05em' }}>AI Interviewer</div>}
              <p>{m.content}</p>
              {m.role==='assistant' && (
                <button onClick={() => speak(m.content)} style={{ background:'none', border:'none', color:'#475569', cursor:'pointer', padding:'0.25rem 0', display:'flex', alignItems:'center', gap:'0.3rem', fontSize:'0.72rem', marginTop:'0.35rem' }}>
                  <Volume2 size={12}/> Replay
                </button>
              )}
            </div>
          </div>
        ))}
        {loading && <div className="chat-msg assistant"><div className="chat-bubble typing"><span/><span/><span/></div></div>}
        <div ref={messagesEndRef}/>
      </div>
      <div style={{ marginTop:'0.75rem' }}>
        {listening && (
          <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', padding:'0.4rem 0.75rem', background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:8, marginBottom:'0.5rem' }}>
            <div style={{ width:8, height:8, background:'#ef4444', borderRadius:'50%', animation:'pulse 1s infinite' }}/>
            <span style={{ fontSize:'0.8rem', color:'#fca5a5' }}>Listening... speak your answer</span>
          </div>
        )}
        <div className="chat-input-row">
          <textarea className="chat-input" value={input}
            onChange={e => { setInput(e.target.value); setTranscript(e.target.value); }}
            onKeyDown={e => { if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendMessage();} }}
            placeholder={listening?'Listening...':'Type or speak your answer... (Enter to send)'}
            rows={2} disabled={loading}/>
          {sttOk && (
            <button onClick={toggleMic} disabled={loading}
              style={{ padding:'0.65rem 0.85rem', borderRadius:10, border:'none', cursor:'pointer', background:listening?'rgba(239,68,68,0.15)':'rgba(99,102,241,0.15)', color:listening?'#ef4444':'#a5b4fc', flexShrink:0, display:'flex', alignItems:'center' }}>
              {listening?<MicOff size={18}/>:<Mic size={18}/>}
            </button>
          )}
          <button className="btn-primary chat-send" onClick={sendMessage} disabled={!input.trim()||loading}><Send size={18}/></button>
        </div>
      </div>
      {error && <div className="auth-error" style={{ marginTop:'0.5rem' }}>{error}</div>}
      <style>{`
        @keyframes sw{0%,100%{transform:scaleY(0.4);opacity:0.5}50%{transform:scaleY(1);opacity:1}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}
      `}</style>
    </div>
  );

  // ── FEEDBACK ──────────────────────────────────────────
  if (step === 'feedback' && feedback) {
    const radarData = [
      { subject:'Communication',  score:feedback.communication||0 },
      { subject:'Technical',      score:feedback.technicalKnowledge||0 },
      { subject:'Problem Solving',score:feedback.problemSolving||0 },
      { subject:'Confidence',     score:feedback.confidence||0 },
    ];
    const barData = [
      { name:'Communication',  score:feedback.communication||0,      fill:'#6366f1' },
      { name:'Technical',      score:feedback.technicalKnowledge||0, fill:'#3b82f6' },
      { name:'Problem Solving',score:feedback.problemSolving||0,     fill:'#10b981' },
      { name:'Confidence',     score:feedback.confidence||0,         fill:'#f59e0b' },
    ];
    const getGrade = s => s>=90?{g:'A+',c:'#10b981'}:s>=80?{g:'A',c:'#10b981'}:s>=70?{g:'B',c:'#6366f1'}:s>=60?{g:'C',c:'#f59e0b'}:{g:'D',c:'#ef4444'};
    const { g:grade, c:gradeColor } = getGrade(feedback.overallScore);

    const tabs = [
      { id:'overview',   label:'Overview',       icon:BarChart2 },
      { id:'detailed',   label:'Skill Analysis', icon:Target },
      { id:'questions',  label:'Q&A Review',     icon:MessageSquare },
      { id:'improve',    label:'How to Improve', icon:Lightbulb },
      { id:'transcript', label:'Transcript',      icon:BookOpen },
    ];

    return (
      <div className="page">
        <div className="page-header">
          <div>
            <h1 className="page-title">Interview Analysis</h1>
            <p className="page-subtitle">{interview?.jobRole} · {interview?.difficulty} · {messages.filter(m=>m.role==='user').length} answers</p>
          </div>
          <button className="btn-primary" onClick={reset}>+ New Interview</button>
        </div>

        {/* Hero */}
        <div style={{ background:'linear-gradient(135deg,rgba(99,102,241,0.15),rgba(124,58,237,0.08))', border:'1px solid rgba(99,102,241,0.25)', borderRadius:16, padding:'2rem', marginBottom:'1.5rem' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'2rem', flexWrap:'wrap' }}>
            <div style={{ textAlign:'center', minWidth:80 }}>
              <div style={{ fontSize:'4.5rem', fontWeight:800, fontFamily:'Syne,sans-serif', color:gradeColor, lineHeight:1 }}>{grade}</div>
              <div style={{ fontSize:'0.72rem', color:'#64748b', textTransform:'uppercase', letterSpacing:'0.06em', marginTop:4 }}>Grade</div>
            </div>
            <div style={{ flex:1, minWidth:180 }}>
              <div style={{ fontSize:'3rem', fontWeight:800, fontFamily:'Syne,sans-serif', color:'#fff', lineHeight:1 }}>
                {feedback.overallScore}<span style={{ fontSize:'1.2rem', color:'#64748b' }}>/100</span>
              </div>
              <p style={{ fontSize:'0.875rem', color:'#94a3b8', marginTop:'0.5rem', lineHeight:1.7 }}>{feedback.summary}</p>
              {feedback.hireable !== undefined && (
                <div style={{ marginTop:'0.75rem', display:'inline-flex', alignItems:'center', gap:'0.5rem', padding:'0.3rem 0.75rem', borderRadius:20, background:feedback.hireable?'rgba(16,185,129,0.12)':'rgba(239,68,68,0.1)', border:`1px solid ${feedback.hireable?'rgba(16,185,129,0.3)':'rgba(239,68,68,0.25)'}`, color:feedback.hireable?'#10b981':'#ef4444', fontSize:'0.8rem', fontWeight:700 }}>
                  {feedback.hireable?<CheckCircle size={14}/>:<XCircle size={14}/>}
                  {feedback.hireable?'Likely Hireable':'Needs More Preparation'}
                </div>
              )}
            </div>
            <div style={{ display:'flex', gap:'1.25rem', flexWrap:'wrap' }}>
              <ScoreRing score={feedback.communication||0}      label="Communication"/>
              <ScoreRing score={feedback.technicalKnowledge||0} label="Technical"/>
              <ScoreRing score={feedback.problemSolving||0}     label="Problem Solving"/>
              <ScoreRing score={feedback.confidence||0}         label="Confidence"/>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', gap:'0.4rem', marginBottom:'1.25rem', flexWrap:'wrap' }}>
          {tabs.map(({ id, label, icon:Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              style={{ display:'flex', alignItems:'center', gap:'0.4rem', padding:'0.45rem 0.9rem', borderRadius:8, border:'1px solid', fontSize:'0.82rem', fontWeight:600, cursor:'pointer', fontFamily:'inherit', transition:'all 0.2s', borderColor:activeTab===id?'rgba(99,102,241,0.4)':'#1e293b', background:activeTab===id?'rgba(99,102,241,0.12)':'transparent', color:activeTab===id?'#a5b4fc':'#64748b' }}>
              <Icon size={14}/>{label}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab==='overview' && (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
            <div className="section-card">
              <h3 style={{ fontSize:'0.82rem', fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'1rem' }}>Skill Radar</h3>
              <ResponsiveContainer width="100%" height={250}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#1e293b"/>
                  <PolarAngleAxis dataKey="subject" tick={{ fill:'#94a3b8', fontSize:11 }}/>
                  <PolarRadiusAxis domain={[0,100]} tick={false}/>
                  <Radar dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25}/>
                  <Tooltip contentStyle={{ background:'#0f172a', border:'1px solid #1e293b', borderRadius:8 }} labelStyle={{ color:'#e2e8f0' }} itemStyle={{ color:'#a5b4fc' }}/>
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="section-card">
              <h3 style={{ fontSize:'0.82rem', fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'1rem' }}>Score Breakdown</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={barData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b"/>
                  <XAxis type="number" domain={[0,100]} tick={{ fill:'#64748b', fontSize:11 }}/>
                  <YAxis type="category" dataKey="name" tick={{ fill:'#94a3b8', fontSize:11 }} width={110}/>
                  <Tooltip contentStyle={{ background:'#0f172a', border:'1px solid #1e293b', borderRadius:8 }} labelStyle={{ color:'#e2e8f0' }} itemStyle={{ color:'#a5b4fc' }}/>
                  <Bar dataKey="score" radius={[0,4,4,0]} fill="#6366f1"/>
                </BarChart>
              </ResponsiveContainer>
            </div>
            {feedback.strengths?.length > 0 && (
              <div className="section-card" style={{ gridColumn:'span 2' }}>
                <h3 style={{ fontSize:'0.9rem', fontWeight:700, color:'#e2e8f0', marginBottom:'0.75rem', display:'flex', alignItems:'center', gap:'0.5rem' }}><CheckCircle size={16} style={{ color:'#10b981' }}/> What You Did Well</h3>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:'0.75rem' }}>
                  {feedback.strengths.map((s,i) => (
                    <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:'0.6rem', padding:'0.75rem', background:'rgba(16,185,129,0.06)', border:'1px solid rgba(16,185,129,0.15)', borderRadius:8 }}>
                      <CheckCircle size={14} style={{ color:'#10b981', flexShrink:0, marginTop:2 }}/>
                      <span style={{ fontSize:'0.85rem', color:'#94a3b8' }}>{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Skill Analysis */}
        {activeTab==='detailed' && (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:'1rem' }}>
            <MetricCard label="Communication"      score={feedback.communication||0}       feedback={feedback.communicationFeedback  ||'No feedback available.'} color="#6366f1"/>
            <MetricCard label="Technical Knowledge" score={feedback.technicalKnowledge||0} feedback={feedback.technicalFeedback      ||'No feedback available.'} color="#3b82f6"/>
            <MetricCard label="Problem Solving"    score={feedback.problemSolving||0}       feedback={feedback.problemSolvingFeedback ||'No feedback available.'} color="#10b981"/>
            <MetricCard label="Confidence"         score={feedback.confidence||0}           feedback={feedback.confidenceFeedback     ||'No feedback available.'} color="#f59e0b"/>
          </div>
        )}

        {/* Q&A Review */}
        {activeTab==='questions' && (
          <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
            {feedback.questionAnalysis?.length > 0 ? feedback.questionAnalysis.map((qa,i) => (
              <div key={i} style={{ background:'#0c1120', border:'1px solid #1e293b', borderRadius:12, padding:'1.25rem' }}>
                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:'1rem', marginBottom:'0.75rem' }}>
                  <div style={{ display:'flex', alignItems:'flex-start', gap:'0.6rem', flex:1 }}>
                    <span style={{ background:'rgba(99,102,241,0.15)', color:'#a5b4fc', borderRadius:6, padding:'0.2rem 0.5rem', fontSize:'0.72rem', fontWeight:700, flexShrink:0 }}>Q{i+1}</span>
                    <p style={{ fontSize:'0.875rem', color:'#e2e8f0', margin:0, lineHeight:1.6 }}>{qa.question}</p>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', flexShrink:0 }}>
                    <QualityBadge quality={qa.answerQuality}/>
                    <span style={{ fontSize:'0.85rem', fontWeight:700, fontFamily:'Syne,sans-serif', color:qa.score>=75?'#10b981':qa.score>=50?'#f59e0b':'#ef4444' }}>{qa.score}</span>
                  </div>
                </div>
                <div style={{ background:'rgba(255,255,255,0.02)', border:'1px solid #1e293b', borderRadius:8, padding:'0.75rem' }}>
                  <p style={{ fontSize:'0.8rem', color:'#64748b', margin:'0 0 0.3rem', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.04em' }}>Feedback</p>
                  <p style={{ fontSize:'0.85rem', color:'#94a3b8', margin:0, lineHeight:1.6 }}>{qa.feedback}</p>
                </div>
              </div>
            )) : (
              <div style={{ textAlign:'center', padding:'3rem', color:'#475569' }}>
                <MessageSquare size={40} style={{ marginBottom:'1rem', opacity:0.4 }}/>
                <p>Q&A analysis not available for this interview.</p>
              </div>
            )}
          </div>
        )}

        {/* How to Improve */}
        {activeTab==='improve' && (
          <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
            {feedback.improvements?.length > 0 && (
              <div className="section-card">
                <h3 style={{ fontSize:'0.9rem', fontWeight:700, color:'#e2e8f0', marginBottom:'1rem', display:'flex', alignItems:'center', gap:'0.5rem' }}><Target size={16} style={{ color:'#f59e0b' }}/> Priority Improvements</h3>
                <div style={{ display:'flex', flexDirection:'column', gap:'0.6rem' }}>
                  {feedback.improvements.map((imp,i) => (
                    <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:'0.75rem', padding:'0.9rem 1rem', background:'rgba(245,158,11,0.05)', border:'1px solid rgba(245,158,11,0.12)', borderRadius:10 }}>
                      <span style={{ background:'rgba(245,158,11,0.15)', color:'#f59e0b', borderRadius:6, padding:'0.15rem 0.5rem', fontSize:'0.75rem', fontWeight:800, flexShrink:0 }}>{i+1}</span>
                      <span style={{ fontSize:'0.875rem', color:'#94a3b8', lineHeight:1.6 }}>{imp}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {feedback.nextSteps?.length > 0 && (
              <div className="section-card">
                <h3 style={{ fontSize:'0.9rem', fontWeight:700, color:'#e2e8f0', marginBottom:'1rem', display:'flex', alignItems:'center', gap:'0.5rem' }}><ArrowRight size={16} style={{ color:'#6366f1' }}/> Next Steps</h3>
                <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
                  {feedback.nextSteps.map((s,i) => (
                    <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:'0.75rem', padding:'0.75rem', background:'rgba(99,102,241,0.05)', border:'1px solid rgba(99,102,241,0.1)', borderRadius:8 }}>
                      <ArrowRight size={14} style={{ color:'#6366f1', flexShrink:0, marginTop:3 }}/>
                      <span style={{ fontSize:'0.875rem', color:'#94a3b8' }}>{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {feedback.recommendedResources?.length > 0 && (
              <div className="section-card">
                <h3 style={{ fontSize:'0.9rem', fontWeight:700, color:'#e2e8f0', marginBottom:'1rem', display:'flex', alignItems:'center', gap:'0.5rem' }}><BookOpen size={16} style={{ color:'#10b981' }}/> Recommended Resources</h3>
                <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
                  {feedback.recommendedResources.map((r,i) => (
                    <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:'0.75rem', padding:'0.75rem', background:'rgba(16,185,129,0.05)', border:'1px solid rgba(16,185,129,0.1)', borderRadius:8 }}>
                      <BookOpen size={14} style={{ color:'#10b981', flexShrink:0, marginTop:3 }}/>
                      <span style={{ fontSize:'0.875rem', color:'#94a3b8' }}>{r}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Transcript */}
        {activeTab==='transcript' && (
          <div className="section-card">
            <h3 style={{ fontSize:'0.9rem', fontWeight:700, color:'#e2e8f0', marginBottom:'1rem' }}>💬 Full Interview Transcript</h3>
            <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
              {messages.map((m,i) => (
                <div key={i} style={{ padding:'0.75rem 1rem', borderRadius:10, background:m.role==='user'?'rgba(99,102,241,0.08)':'rgba(255,255,255,0.02)', borderLeft:`3px solid ${m.role==='user'?'#6366f1':'#1e293b'}` }}>
                  <div style={{ fontSize:'0.7rem', fontWeight:700, color:m.role==='user'?'#a5b4fc':'#475569', marginBottom:'0.35rem', textTransform:'uppercase', letterSpacing:'0.05em' }}>
                    {m.role==='user'?'You':'Interviewer'}
                  </div>
                  <p style={{ fontSize:'0.875rem', color:'#94a3b8', margin:0, lineHeight:1.6 }}>{m.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
  return null;
};

export default InterviewPage;