import React, { useState } from 'react';
import { CheckCircle, XCircle, TrendingUp, AlertCircle, Star, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import JobRoles from './JobRoles';

// ── Safe number helper ────────────────────────────────────
const safe = (val) => {
  const n = Number(val);
  return isNaN(n) || val === null || val === undefined ? 0 : n;
};

// ── Score Ring ────────────────────────────────────────────
const ScoreRing = ({ score, label, size = 120 }) => {
  const s = safe(score);
  const r = 42, circ = 2 * Math.PI * r;
  const color = s >= 75 ? '#10b981' : s >= 50 ? '#f59e0b' : '#ef4444';
  const offset = String(circ - (s / 100) * circ);
  return (
    <div className="score-ring-wrap">
      <svg width={size} height={size} viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#1e293b" strokeWidth="8"/>
        <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={String(circ)} strokeDashoffset={offset}
          strokeLinecap="round" transform="rotate(-90 50 50)"
          style={{ transition: 'stroke-dashoffset 1s ease' }}/>
        <text x="50" y="46" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold">{s}</text>
        <text x="50" y="62" textAnchor="middle" fill="#94a3b8" fontSize="9">/100</text>
      </svg>
      <span className="score-label">{label}</span>
    </div>
  );
};

// ── Section item ──────────────────────────────────────────
const SectionItem = ({ name, score, feedback }) => {
  const s = safe(score);
  const color = s >= 75 ? '#10b981' : s >= 50 ? '#f59e0b' : '#ef4444';
  return (
    <div className="section-item">
      <div className="section-item-header">
        <span className="section-item-name">{name}</span>
        <span className="section-item-score" style={{ color }}>{s}/100</span>
      </div>
      <div style={{ height: 5, background: '#1e293b', borderRadius: 99, margin: '0.4rem 0 0.5rem', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${s}%`, background: color, borderRadius: 99, transition: 'width 1s ease' }}/>
      </div>
      {feedback && <p className="section-item-feedback">{feedback}</p>}
    </div>
  );
};

// ── Keyword tag ───────────────────────────────────────────
const KeywordTag = ({ word, matched }) => (
  <span style={{
    display: 'inline-block', fontSize: '0.75rem', padding: '0.2rem 0.6rem',
    borderRadius: 20, margin: '0.2rem',
    background: matched ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.08)',
    color: matched ? '#10b981' : '#ef4444',
    border: `1px solid ${matched ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.15)'}`,
  }}>
    {matched ? '✓' : '✗'} {word}
  </span>
);

// ── Main ResultCard ───────────────────────────────────────
const ResultCard = ({ analysis, fileName }) => {
  const [activeTab, setActiveTab] = useState('overview');

  if (!analysis) return null;

  // Safe access with fallbacks
  const overallScore = safe(analysis.overallScore);
  const atsScore     = safe(analysis.atsScore);

  const sections = analysis.sections || analysis.sectionScores || {};
  const sectionData = [
    { name: 'Contact',    score: safe(sections.contact    ?? sections.contactInfo), feedback: sections.contactFeedback    || '' },
    { name: 'Summary',   score: safe(sections.summary    ?? sections.professionalSummary), feedback: sections.summaryFeedback   || '' },
    { name: 'Experience',score: safe(sections.experience ?? sections.workExperience), feedback: sections.experienceFeedback || '' },
    { name: 'Education', score: safe(sections.education), feedback: sections.educationFeedback || '' },
    { name: 'Skills',    score: safe(sections.skills    ?? sections.technicalSkills), feedback: sections.skillsFeedback    || '' },
  ].filter(s => s.score > 0 || s.feedback);

  const radarData = sectionData.map(s => ({ subject: s.name, score: s.score }));

  const strengths    = Array.isArray(analysis.strengths)    ? analysis.strengths    : [];
  const weaknesses   = Array.isArray(analysis.weaknesses)   ? analysis.weaknesses   : [];
  const suggestions  = Array.isArray(analysis.suggestions || analysis.improvements) ? (analysis.suggestions || analysis.improvements) : [];
  const matchedKw    = Array.isArray(analysis.matchedKeywords)  ? analysis.matchedKeywords  : [];
  const missingKw    = Array.isArray(analysis.missingKeywords)  ? analysis.missingKeywords  : [];
  const suitableRoles= Array.isArray(analysis.suitableRoles)   ? analysis.suitableRoles    : [];

  const atsColor = atsScore >= 75 ? '#10b981' : atsScore >= 50 ? '#f59e0b' : '#ef4444';

  const tabs = ['overview', 'sections', 'keywords', 'suggestions', 'roles'];

  return (
    <div className="result-card">
      {/* Header */}
      <div className="result-header">
        <div>
          <h2 className="result-title">Resume Analysis Report</h2>
          <span className="result-filename">{fileName}</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
          <div style={{ textAlign:'center', padding:'0.5rem 1rem', background:'rgba(99,102,241,0.08)', border:'1px solid rgba(99,102,241,0.15)', borderRadius:10 }}>
            <div style={{ fontSize:'0.7rem', color:'#64748b', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:2 }}>ATS Score</div>
            <div style={{ fontSize:'1.5rem', fontWeight:800, color:atsColor }}>{atsScore}</div>
          </div>
        </div>
      </div>

      {/* Score rings */}
      <div className="scores-row">
        <ScoreRing score={overallScore} label="Overall"/>
        {sectionData.map(s => (
          <ScoreRing key={s.name} score={s.score} label={s.name} size={90}/>
        ))}
      </div>

      {/* Radar chart */}
      {radarData.length > 0 && (
        <div className="radar-wrap">
          <h3 className="radar-title">Section Scores</h3>
          <ResponsiveContainer width="100%" height={240}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#1e293b"/>
              <PolarAngleAxis dataKey="subject" tick={{ fill:'#94a3b8', fontSize:12 }}/>
              <PolarRadiusAxis domain={[0,100]} tick={false}/>
              <Radar dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25}/>
              <Tooltip contentStyle={{ background:'#0f172a', border:'1px solid #1e293b', borderRadius:8 }}
                labelStyle={{ color:'#e2e8f0' }} itemStyle={{ color:'#a5b4fc' }}/>
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display:'flex', borderBottom:'1px solid #1e293b', overflowX:'auto' }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            style={{ padding:'0.75rem 1.1rem', background:'none', border:'none', borderBottom:`2px solid ${activeTab===t?'#6366f1':'transparent'}`, color:activeTab===t?'#a5b4fc':'#64748b', fontSize:'0.82rem', fontWeight:600, cursor:'pointer', whiteSpace:'nowrap', transition:'all 0.2s', fontFamily:'inherit', textTransform:'capitalize' }}>
            {t === 'roles' ? '🎯 Job Roles' : t.charAt(0).toUpperCase()+t.slice(1)}
          </button>
        ))}
      </div>

      {/* Overview tab */}
      {activeTab === 'overview' && (
        <div style={{ padding:'1.25rem 1.5rem', display:'flex', flexDirection:'column', gap:'1rem' }}>
          {/* ATS bar */}
          <div style={{ background:'#0a0f1a', border:'1px solid #1e293b', borderRadius:10, padding:'1rem' }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'0.5rem' }}>
              <span style={{ fontSize:'0.82rem', fontWeight:600, color:'#e2e8f0' }}>ATS Compatibility</span>
              <span style={{ fontSize:'0.82rem', fontWeight:700, color:atsColor }}>{atsScore}/100</span>
            </div>
            <div style={{ height:8, background:'#1e293b', borderRadius:99, overflow:'hidden' }}>
              <div style={{ height:'100%', width:`${atsScore}%`, background:atsColor, borderRadius:99, transition:'width 1s ease' }}/>
            </div>
            <p style={{ fontSize:'0.75rem', color:'#64748b', marginTop:'0.5rem' }}>
              {atsScore >= 75 ? '✅ Your resume should pass most ATS filters.' : atsScore >= 50 ? '⚠️ Your resume may be filtered by some ATS systems. See suggestions.' : '❌ Your resume needs improvement to pass ATS filters.'}
            </p>
          </div>

          {/* Strengths */}
          {strengths.length > 0 && (
            <div>
              <p style={{ fontSize:'0.82rem', fontWeight:700, color:'#10b981', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'0.6rem' }}>✓ Strengths</p>
              {strengths.map((s,i) => (
                <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:'0.6rem', padding:'0.6rem 0.9rem', background:'rgba(16,185,129,0.06)', border:'1px solid rgba(16,185,129,0.15)', borderRadius:8, marginBottom:'0.4rem' }}>
                  <CheckCircle size={14} style={{ color:'#10b981', flexShrink:0, marginTop:2 }}/>
                  <span style={{ fontSize:'0.85rem', color:'#94a3b8' }}>{s}</span>
                </div>
              ))}
            </div>
          )}

          {/* Weaknesses */}
          {weaknesses.length > 0 && (
            <div>
              <p style={{ fontSize:'0.82rem', fontWeight:700, color:'#ef4444', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'0.6rem' }}>✗ Weaknesses</p>
              {weaknesses.map((w,i) => (
                <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:'0.6rem', padding:'0.6rem 0.9rem', background:'rgba(239,68,68,0.06)', border:'1px solid rgba(239,68,68,0.15)', borderRadius:8, marginBottom:'0.4rem' }}>
                  <XCircle size={14} style={{ color:'#ef4444', flexShrink:0, marginTop:2 }}/>
                  <span style={{ fontSize:'0.85rem', color:'#94a3b8' }}>{w}</span>
                </div>
              ))}
            </div>
          )}

          {/* Format feedback */}
          {analysis.formatFeedback && (
            <div className="format-feedback">
              <p className="format-label">Format & Layout</p>
              <p className="format-text">{analysis.formatFeedback}</p>
            </div>
          )}
        </div>
      )}

      {/* Sections tab */}
      {activeTab === 'sections' && (
        <div style={{ padding:'1.25rem 1.5rem' }}>
          {sectionData.length > 0 ? sectionData.map(s => (
            <SectionItem key={s.name} name={s.name} score={s.score} feedback={s.feedback}/>
          )) : (
            <p style={{ color:'#64748b', textAlign:'center', padding:'2rem' }}>No section scores available.</p>
          )}
        </div>
      )}

      {/* Keywords tab */}
      {activeTab === 'keywords' && (
        <div style={{ padding:'1.25rem 1.5rem' }}>
          {matchedKw.length > 0 && (
            <div style={{ marginBottom:'1rem' }}>
              <p style={{ fontSize:'0.82rem', fontWeight:700, color:'#10b981', marginBottom:'0.5rem' }}>✓ Matched Keywords ({matchedKw.length})</p>
              <div>{matchedKw.map((k,i) => <KeywordTag key={i} word={k} matched={true}/>)}</div>
            </div>
          )}
          {missingKw.length > 0 && (
            <div>
              <p style={{ fontSize:'0.82rem', fontWeight:700, color:'#ef4444', marginBottom:'0.5rem' }}>✗ Missing Keywords ({missingKw.length})</p>
              <div>{missingKw.map((k,i) => <KeywordTag key={i} word={k} matched={false}/>)}</div>
            </div>
          )}
          {matchedKw.length === 0 && missingKw.length === 0 && (
            <p style={{ color:'#64748b', textAlign:'center', padding:'2rem' }}>Upload with a job description to see keyword matching.</p>
          )}
        </div>
      )}

      {/* Suggestions tab */}
      {activeTab === 'suggestions' && (
        <div style={{ padding:'1.25rem 1.5rem' }}>
          {suggestions.length > 0 ? suggestions.map((s,i) => (
            <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:'0.75rem', padding:'0.9rem 1rem', background:'rgba(245,158,11,0.05)', border:'1px solid rgba(245,158,11,0.12)', borderRadius:10, marginBottom:'0.6rem' }}>
              <span style={{ background:'rgba(245,158,11,0.15)', color:'#f59e0b', borderRadius:6, padding:'0 0.35rem', fontSize:'0.75rem', fontWeight:800, flexShrink:0, marginTop:2 }}>{i+1}</span>
              <span style={{ fontSize:'0.875rem', color:'#94a3b8', lineHeight:1.6 }}>{s}</span>
            </div>
          )) : (
            <p style={{ color:'#64748b', textAlign:'center', padding:'2rem' }}>No suggestions available.</p>
          )}
        </div>
      )}

      {/* Roles tab */}
      {activeTab === 'roles' && (
        <div style={{ padding:'1.25rem 1.5rem' }}>
          {suitableRoles.length > 0 ? (
            <JobRoles roles={suitableRoles}/>
          ) : (
            <p style={{ color:'#64748b', textAlign:'center', padding:'2rem' }}>No job role recommendations available.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ResultCard;
