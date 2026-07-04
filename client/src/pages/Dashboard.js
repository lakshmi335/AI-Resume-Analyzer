import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { resumeAPI, interviewAPI } from '../api/requests';
import Spinner from '../components/Spinner';
import {
  FileText, MessageSquare, GitCompare, TrendingUp, Plus,
  Trash2, Eye, ChevronLeft, ChevronRight
} from 'lucide-react';

const StatCard = ({ label, value, icon: Icon, color }) => (
  <div className={`stat-card stat-${color}`}>
    <div className="stat-icon"><Icon size={22}/></div>
    <div className="stat-info">
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
    </div>
  </div>
);

// ── Horizontal Slider ─────────────────────────────────────
const Slider = ({ children, itemCount }) => {
  const scrollRef = useRef(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);
  const [activeIdx, setActiveIdx] = useState(0);

  const updateArrows = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 5);
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 5);
    const cardWidth = el.scrollWidth / itemCount;
    setActiveIdx(Math.round(el.scrollLeft / cardWidth));
  };

  const scroll = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.scrollWidth / itemCount;
    el.scrollBy({ left: dir * (cardWidth + 12), behavior: 'smooth' });
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateArrows();
    el.addEventListener('scroll', updateArrows);
    window.addEventListener('resize', updateArrows);
    return () => {
      el.removeEventListener('scroll', updateArrows);
      window.removeEventListener('resize', updateArrows);
    };
    // eslint-disable-next-line
  }, [itemCount]);

  if (itemCount === 0) return null;

  return (
    <div style={{ position:'relative' }}>
      {/* Left arrow */}
      {canLeft && (
        <button onClick={() => scroll(-1)}
          style={{
            position:'absolute', left:-14, top:'50%', transform:'translateY(-50%)', zIndex:5,
            width:34, height:34, borderRadius:'50%', background:'#0c1120', border:'1px solid #1e293b',
            color:'#a5b4fc', display:'flex', alignItems:'center', justifyContent:'center',
            cursor:'pointer', boxShadow:'0 4px 12px rgba(0,0,0,0.4)'
          }}>
          <ChevronLeft size={18}/>
        </button>
      )}

      {/* Right arrow */}
      {canRight && (
        <button onClick={() => scroll(1)}
          style={{
            position:'absolute', right:-14, top:'50%', transform:'translateY(-50%)', zIndex:5,
            width:34, height:34, borderRadius:'50%', background:'#0c1120', border:'1px solid #1e293b',
            color:'#a5b4fc', display:'flex', alignItems:'center', justifyContent:'center',
            cursor:'pointer', boxShadow:'0 4px 12px rgba(0,0,0,0.4)'
          }}>
          <ChevronRight size={18}/>
        </button>
      )}

      {/* Scrollable track */}
      <div ref={scrollRef}
        style={{
          display:'flex', gap:12, overflowX:'auto', scrollSnapType:'x mandatory',
          paddingBottom:4, scrollbarWidth:'none', msOverflowStyle:'none',
        }}
        className="slider-track">
        {children}
      </div>

      {/* Dots */}
      {itemCount > 1 && (
        <div style={{ display:'flex', justifyContent:'center', gap:5, marginTop:10 }}>
          {Array.from({ length: itemCount }).map((_, i) => (
            <div key={i} style={{
              width: activeIdx===i ? 16 : 6, height:6, borderRadius:99,
              background: activeIdx===i ? '#6366f1' : '#1e293b',
              transition:'all 0.25s ease',
            }}/>
          ))}
        </div>
      )}

      <style>{`.slider-track::-webkit-scrollbar { display: none; }`}</style>
    </div>
  );
};

// ── Resume Slide Card ─────────────────────────────────────
const ResumeSlideCard = ({ r, onDelete }) => (
  <div style={{
    minWidth: 260, maxWidth: 260, scrollSnapAlign:'start',
    background:'#0a0f1a', border:'1px solid #1e293b', borderRadius:12, padding:'1rem',
    display:'flex', flexDirection:'column', gap:'0.6rem', flexShrink:0,
  }}>
    <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
      <div style={{ width:34, height:34, borderRadius:8, background:'rgba(99,102,241,0.12)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
        <FileText size={16} style={{ color:'#a5b4fc' }}/>
      </div>
      <div style={{ minWidth:0, flex:1 }}>
        <p style={{ fontSize:'0.82rem', fontWeight:600, color:'#e2e8f0', margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{r.fileName}</p>
        <p style={{ fontSize:'0.7rem', color:'#475569', margin:0 }}>{new Date(r.createdAt).toLocaleDateString()}</p>
      </div>
    </div>

    {r.analysis?.overallScore != null && (
      <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
        <div style={{ flex:1, height:5, background:'#1e293b', borderRadius:99, overflow:'hidden' }}>
          <div style={{
            height:'100%', width:`${r.analysis.overallScore}%`, borderRadius:99,
            background: r.analysis.overallScore>=75?'#10b981':r.analysis.overallScore>=50?'#f59e0b':'#ef4444',
          }}/>
        </div>
        <span style={{ fontSize:'0.78rem', fontWeight:700, color: r.analysis.overallScore>=75?'#10b981':r.analysis.overallScore>=50?'#f59e0b':'#ef4444' }}>
          {r.analysis.overallScore}
        </span>
      </div>
    )}

    <div style={{ display:'flex', gap:'0.5rem', marginTop:'0.25rem' }}>
      <Link to={`/resume/${r._id}`} className="btn-ghost" style={{ flex:1, justifyContent:'center', fontSize:'0.78rem', padding:'0.4rem' }}>
        <Eye size={13}/> View
      </Link>
      <button onClick={() => onDelete(r._id)} className="btn-icon btn-icon-danger" style={{ border:'1px solid #1e293b', borderRadius:8 }}>
        <Trash2 size={14}/>
      </button>
    </div>
  </div>
);

// ── Interview Slide Card ──────────────────────────────────
const InterviewSlideCard = ({ i }) => (
  <div style={{
    minWidth: 260, maxWidth: 260, scrollSnapAlign:'start',
    background:'#0a0f1a', border:'1px solid #1e293b', borderRadius:12, padding:'1rem',
    display:'flex', flexDirection:'column', gap:'0.6rem', flexShrink:0,
  }}>
    <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
      <div style={{ width:34, height:34, borderRadius:8, background:'rgba(59,130,246,0.12)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
        <MessageSquare size={16} style={{ color:'#93c5fd' }}/>
      </div>
      <div style={{ minWidth:0, flex:1 }}>
        <p style={{ fontSize:'0.82rem', fontWeight:600, color:'#e2e8f0', margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{i.jobRole}</p>
        <p style={{ fontSize:'0.7rem', color:'#475569', margin:0 }}>{new Date(i.createdAt).toLocaleDateString()}</p>
      </div>
    </div>

    <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
      <span className={`diff-badge diff-${i.difficulty}`}>{i.difficulty}</span>
      <span className={`status-badge status-${i.status}`}>{i.status}</span>
    </div>

    {i.feedback?.overallScore != null && (
      <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
        <div style={{ flex:1, height:5, background:'#1e293b', borderRadius:99, overflow:'hidden' }}>
          <div style={{
            height:'100%', width:`${i.feedback.overallScore}%`, borderRadius:99,
            background: i.feedback.overallScore>=75?'#10b981':i.feedback.overallScore>=50?'#f59e0b':'#ef4444',
          }}/>
        </div>
        <span style={{ fontSize:'0.78rem', fontWeight:700, color: i.feedback.overallScore>=75?'#10b981':i.feedback.overallScore>=50?'#f59e0b':'#ef4444' }}>
          {i.feedback.overallScore}
        </span>
      </div>
    )}
  </div>
);

// ── Main Dashboard ────────────────────────────────────────
const Dashboard = () => {
  const { user } = useAuth();
  const [resumes, setResumes] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([resumeAPI.getAll(), interviewAPI.getAll()])
      .then(([r, i]) => { setResumes(r.data.resumes); setInterviews(i.data.interviews); })
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this resume?')) return;
    await resumeAPI.delete(id);
    setResumes(prev => prev.filter(r => r._id !== id));
  };

  const avgScore = resumes.filter(r => r.analysis?.overallScore).length > 0
    ? Math.round(resumes.reduce((acc, r) => acc + (r.analysis?.overallScore || 0), 0) / resumes.filter(r => r.analysis?.overallScore).length)
    : 0;

  if (loading) return <div className="page-center"><Spinner size="lg" text="Loading dashboard..."/></div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="page-subtitle">Here's your resume activity overview</p>
        </div>
        <Link to="/upload" className="btn-primary"><Plus size={16}/> Analyze Resume</Link>
      </div>

      <div className="stats-grid">
        <StatCard label="Resumes Analyzed" value={resumes.length} icon={FileText} color="purple"/>
        <StatCard label="Mock Interviews" value={interviews.length} icon={MessageSquare} color="blue"/>
        <StatCard label="Avg. Score" value={avgScore || '—'} icon={TrendingUp} color="green"/>
      </div>

      <div className="quick-actions">
        <Link to="/upload" className="action-card"><FileText size={24}/><span>Analyze Resume</span></Link>
        <Link to="/interview" className="action-card"><MessageSquare size={24}/><span>Mock Interview</span></Link>
        <Link to="/compare" className="action-card"><GitCompare size={24}/><span>Compare Resumes</span></Link>
      </div>

      {/* Recent Resumes Slider */}
      <div className="section-card">
        <div className="section-card-header">
          <h2>Recent Resumes <span style={{ color:'#475569', fontWeight:500, fontSize:'0.8rem' }}>({resumes.length} analyzed)</span></h2>
          <Link to="/upload" className="btn-ghost">+ New</Link>
        </div>
        {resumes.length === 0 ? (
          <div className="empty-state">
            <FileText size={40} className="empty-icon"/>
            <p>No resumes yet. Upload your first one!</p>
            <Link to="/upload" className="btn-primary">Upload Resume</Link>
          </div>
        ) : (
          <Slider itemCount={resumes.length}>
            {resumes.map(r => <ResumeSlideCard key={r._id} r={r} onDelete={handleDelete}/>)}
          </Slider>
        )}
      </div>

      {/* Recent Interviews Slider */}
      <div className="section-card">
        <div className="section-card-header">
          <h2>Recent Interviews <span style={{ color:'#475569', fontWeight:500, fontSize:'0.8rem' }}>({interviews.length} completed)</span></h2>
          <Link to="/interview" className="btn-ghost">+ New</Link>
        </div>
        {interviews.length === 0 ? (
          <div className="empty-state">
            <MessageSquare size={40} className="empty-icon"/>
            <p>No interviews yet. Start practicing!</p>
            <Link to="/interview" className="btn-primary">Start Interview</Link>
          </div>
        ) : (
          <Slider itemCount={interviews.length}>
            {interviews.map(i => <InterviewSlideCard key={i._id} i={i}/>)}
          </Slider>
        )}
      </div>
    </div>
  );
};

export default Dashboard;