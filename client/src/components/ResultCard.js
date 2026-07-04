import React, { useState } from 'react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, ResponsiveContainer, Tooltip
} from 'recharts';
import { CheckCircle, XCircle, Lightbulb, Tag, ChevronDown, ChevronUp, TrendingUp } from 'lucide-react';
import JobRoles from './JobRoles';

const ScoreRing = ({ score, label, size = 120 }) => {
  const r = 45, circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 75 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444';
  return (
    <div className="score-ring-wrap">
      <svg width={size} height={size} viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#1e293b" strokeWidth="8"/>
        <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          transform="rotate(-90 50 50)" style={{ transition:'stroke-dashoffset 1s ease' }}/>
        <text x="50" y="46" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold">{score}</text>
        <text x="50" y="62" textAnchor="middle" fill="#94a3b8" fontSize="9">/100</text>
      </svg>
      <span className="score-label">{label}</span>
    </div>
  );
};

const Section = ({ title, icon: Icon, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="result-section">
      <button className="section-header" onClick={() => setOpen(!open)}>
        <div className="section-title"><Icon size={18}/><span>{title}</span></div>
        {open ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
      </button>
      {open && <div className="section-body">{children}</div>}
    </div>
  );
};

const ResultCard = ({ analysis, fileName }) => {
  if (!analysis) return null;

  const {
    overallScore, atsScore, strengths, weaknesses,
    suggestions, keywords, sections, formatFeedback, suitableRoles,
  } = analysis;

  const radarData = sections
    ? Object.entries(sections).map(([key, val]) => ({
        subject: key.charAt(0).toUpperCase() + key.slice(1),
        score: val.score || 0,
      }))
    : [];

  return (
    <div className="result-card">
      <div className="result-header">
        <h2 className="result-title">Analysis Results</h2>
        <span className="result-filename">{fileName}</span>
      </div>

      {/* Score rings */}
      <div className="scores-row">
        <ScoreRing score={overallScore} label="Overall Score" size={130}/>
        <ScoreRing score={atsScore} label="ATS Score" size={130}/>
      </div>

      {/* Radar */}
      {radarData.length > 0 && (
        <div className="radar-wrap">
          <h3 className="radar-title">Section Breakdown</h3>
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#1e293b"/>
              <PolarAngleAxis dataKey="subject" tick={{ fill:'#94a3b8', fontSize:12 }}/>
              <PolarRadiusAxis domain={[0,100]} tick={false}/>
              <Radar dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25}/>
              <Tooltip contentStyle={{ background:'#0f172a', border:'1px solid #1e293b', borderRadius:8 }} labelStyle={{ color:'#e2e8f0' }} itemStyle={{ color:'#a5b4fc' }}/>
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Suitable Roles */}
      {suitableRoles?.length > 0 && (
        <Section title="Suitable Job Roles For You" icon={TrendingUp} defaultOpen>
          <JobRoles roles={suitableRoles} />
        </Section>
      )}

      {/* Section details */}
      {sections && (
        <Section title="Section Details" icon={CheckCircle} defaultOpen>
          <div className="sections-grid">
            {Object.entries(sections).map(([key, val]) => (
              <div key={key} className="section-item">
                <div className="section-item-header">
                  <span className="section-item-name">{key}</span>
                  <span className="section-item-score" style={{ color:val.score>=75?'#10b981':val.score>=50?'#f59e0b':'#ef4444' }}>{val.score}/100</span>
                </div>
                <p className="section-item-feedback">{val.feedback}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Strengths */}
      {strengths?.length > 0 && (
        <Section title="Strengths" icon={CheckCircle}>
          <ul className="list-green">
            {strengths.map((s,i) => <li key={i}><CheckCircle size={14}/>{s}</li>)}
          </ul>
        </Section>
      )}

      {/* Weaknesses */}
      {weaknesses?.length > 0 && (
        <Section title="Areas to Improve" icon={XCircle}>
          <ul className="list-red">
            {weaknesses.map((w,i) => <li key={i}><XCircle size={14}/>{w}</li>)}
          </ul>
        </Section>
      )}

      {/* Suggestions */}
      {suggestions?.length > 0 && (
        <Section title="Suggestions" icon={Lightbulb}>
          <ul className="list-yellow">
            {suggestions.map((s,i) => <li key={i}><Lightbulb size={14}/>{s}</li>)}
          </ul>
        </Section>
      )}

      {/* Keywords */}
      {(keywords?.matched?.length > 0 || keywords?.missing?.length > 0) && (
        <Section title="Keywords" icon={Tag}>
          {keywords.matched?.length > 0 && (
            <div className="keywords-group">
              <h4 className="keywords-label matched">✓ Matched</h4>
              <div className="tags">
                {keywords.matched.map((k,i) => <span key={i} className="tag tag-green">{k}</span>)}
              </div>
            </div>
          )}
          {keywords.missing?.length > 0 && (
            <div className="keywords-group">
              <h4 className="keywords-label missing">✗ Missing</h4>
              <div className="tags">
                {keywords.missing.map((k,i) => <span key={i} className="tag tag-red">{k}</span>)}
              </div>
            </div>
          )}
        </Section>
      )}

      {/* Format feedback */}
      {formatFeedback && (
        <div className="format-feedback">
          <p className="format-label">Format Feedback</p>
          <p className="format-text">{formatFeedback}</p>
        </div>
      )}
    </div>
  );
};

export default ResultCard;