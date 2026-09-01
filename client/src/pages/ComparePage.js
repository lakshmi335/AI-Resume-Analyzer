
import React, { useState, useEffect } from 'react';
import { resumeAPI } from '../api/requests';
import Spinner from '../components/Spinner';
import { ChevronDown, Trophy, CheckCircle, XCircle } from 'lucide-react';

const ComparePage = () => {
  const [resumes, setResumes]     = useState([]);
  const [resumeId1, setResumeId1] = useState('');
  const [resumeId2, setResumeId2] = useState('');
  const [jobDesc, setJobDesc]     = useState('');
  const [result, setResult]       = useState(null);
  const [rawData, setRawData]     = useState(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');

  useEffect(() => {
    resumeAPI.getAll()
      .then(r => setResumes(r.data.resumes || []))
      .catch(() => setError('Failed to load resumes'));
  }, []);

  // ── Safe helpers ─────────────────────────────────────────
  const safeNum = (v) => { const n = Number(v); return isNaN(n) ? 0 : n; };
  const safeArr = (v) => Array.isArray(v) ? v : [];
  const getName = (id) => resumes.find(r => r._id === id)?.fileName || 'Resume';

  // ── Extract score from many possible field names ──────────
  const getScore = (obj) => {
    if (!obj) return 0;
    return safeNum(
      obj.overallScore ?? obj.overall_score ?? obj.score ??
      obj.totalScore ?? obj.total ?? obj.overall ?? 0
    );
  };

  const getStrengths = (obj) => {
    if (!obj) return [];
    return safeArr(obj.strengths ?? obj.pros ?? obj.advantages ?? []);
  };

  const getWeaknesses = (obj) => {
    if (!obj) return [];
    return safeArr(obj.weaknesses ?? obj.cons ?? obj.disadvantages ?? obj.improvements ?? []);
  };

  const handleCompare = async () => {
    if (!resumeId1 || !resumeId2) { setError('Please select two resumes'); return; }
    if (resumeId1 === resumeId2)  { setError('Please select two different resumes'); return; }
    setLoading(true); setError(''); setResult(null); setRawData(null);
    try {
      const res = await resumeAPI.compare({ resumeId1, resumeId2, jobDescription: jobDesc });
      console.log('Compare API response:', JSON.stringify(res.data, null, 2));
      setRawData(res.data);
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Comparison failed. Please try again.');
    } finally { setLoading(false); }
  };

  // ── Extract comparison data from any structure ────────────
  const extractComparison = (data) => {
    if (!data) return null;
    // Try common structures
    const c = data.comparison ?? data.result ?? data.data ?? data;
    if (!c) return null;

    // Extract winner
    const winner = c.winner ?? c.winnerResume ?? c.betterResume ?? null;

    // Extract resume data — try many possible field names
    const r1 = c.resume1 ?? c.resumeOne ?? c.first ?? c.resume_1 ?? {};
    const r2 = c.resume2 ?? c.resumeTwo ?? c.second ?? c.resume_2 ?? {};

    return {
      winner,
      summary:        c.summary ?? c.explanation ?? c.reason ?? '',
      recommendation: c.recommendation ?? c.advice ?? c.suggestion ?? '',
      resume1: { ...r1, _score: getScore(r1), _strengths: getStrengths(r1), _weaknesses: getWeaknesses(r1) },
      resume2: { ...r2, _score: getScore(r2), _strengths: getStrengths(r2), _weaknesses: getWeaknesses(r2) },
    };
  };

  const comp = extractComparison(result);

  // ── Determine winner name ─────────────────────────────────
  const getWinnerName = () => {
    if (!comp) return '';
    const w = comp.winner;
    if (w === 1 || w === '1' || w === 'resume1' || w === 'first') return getName(resumeId1);
    if (w === 2 || w === '2' || w === 'resume2' || w === 'second') return getName(resumeId2);
    if (typeof w === 'string' && w.toLowerCase().includes('tie')) return "It's a tie!";
    // Check scores
    if (comp.resume1._score > comp.resume2._score) return getName(resumeId1);
    if (comp.resume2._score > comp.resume1._score) return getName(resumeId2);
    return "It's a tie!";
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Compare Resumes</h1>
          <p className="page-subtitle">Find the stronger resume with AI analysis</p>
        </div>
      </div>

      {resumes.length < 2 ? (
        <div className="setup-card" style={{ textAlign:'center', padding:'3rem' }}>
          <Trophy size={48} style={{ color:'#475569', marginBottom:'1rem' }}/>
          <h3 style={{ color:'#e2e8f0' }}>Need at least 2 resumes</h3>
          <p style={{ color:'#64748b' }}>Analyze more resumes on the Upload page first.</p>
        </div>
      ) : (
        <>
          {/* Resume selectors */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr auto 1fr', gap:'1rem', alignItems:'end', marginBottom:'1rem' }}>
            <div className="form-group" style={{ margin:0 }}>
              <label>Resume 1</label>
              <div className="select-wrap">
                <select value={resumeId1} onChange={e => setResumeId1(e.target.value)}>
                  <option value="">— Select resume —</option>
                  {resumes.map(r => <option key={r._id} value={r._id}>{r.fileName}</option>)}
                </select>
                <ChevronDown size={16} className="select-icon"/>
              </div>
            </div>
            <div style={{ fontSize:'1.25rem', fontWeight:800, color:'#475569', paddingBottom:'0.5rem', textAlign:'center' }}>VS</div>
            <div className="form-group" style={{ margin:0 }}>
              <label>Resume 2</label>
              <div className="select-wrap">
                <select value={resumeId2} onChange={e => setResumeId2(e.target.value)}>
                  <option value="">— Select resume —</option>
                  {resumes.map(r => <option key={r._id} value={r._id}>{r.fileName}</option>)}
                </select>
                <ChevronDown size={16} className="select-icon"/>
              </div>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom:'1rem' }}>
            <label>Job Description (optional)</label>
            <textarea value={jobDesc} onChange={e => setJobDesc(e.target.value)}
              placeholder="Paste job description for targeted comparison..."
              rows={3} className="textarea"/>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button className="btn-primary" onClick={handleCompare}
            disabled={!resumeId1 || !resumeId2 || loading}
            style={{ marginBottom:'1.5rem', display:'flex', alignItems:'center', gap:'0.5rem' }}>
            {loading ? <Spinner size="sm"/> : <><Trophy size={16}/> Compare Resumes</>}
          </button>

          {/* Debug: show raw data to understand structure */}
          {rawData && !comp && (
            <div style={{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:10, padding:'1rem', marginBottom:'1rem' }}>
              <p style={{ color:'#fca5a5', fontSize:'0.82rem', fontWeight:600, marginBottom:'0.5rem' }}>⚠️ Could not parse comparison data. Raw response:</p>
              <pre style={{ color:'#94a3b8', fontSize:'0.72rem', overflow:'auto', maxHeight:200 }}>
                {JSON.stringify(rawData, null, 2)}
              </pre>
            </div>
          )}

          {/* Results */}
          {comp && (
            <div>
              {/* Winner banner */}
              <div style={{ background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.2)', borderRadius:12, padding:'1rem 1.5rem', marginBottom:'1rem', display:'flex', alignItems:'center', gap:'0.75rem', flexWrap:'wrap' }}>
                <Trophy size={22} style={{ color:'#f59e0b', flexShrink:0 }}/>
                <div>
                  <p style={{ fontSize:'0.72rem', color:'#64748b', textTransform:'uppercase', letterSpacing:'0.05em', margin:0 }}>Stronger Resume</p>
                  <p style={{ fontSize:'1rem', fontWeight:700, color:'#f59e0b', margin:0 }}>{getWinnerName()}</p>
                </div>
                {comp.summary && (
                  <p style={{ fontSize:'0.85rem', color:'#94a3b8', margin:'0 0 0 auto', maxWidth:400 }}>{comp.summary}</p>
                )}
              </div>

              {/* Side by side cards */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginBottom:'1rem' }}>
                {[
                  { id:resumeId1, name:getName(resumeId1), d:comp.resume1 },
                  { id:resumeId2, name:getName(resumeId2), d:comp.resume2 },
                ].map(({ id, name, d }, idx) => {
                  const isWinner = getWinnerName() === name;
                  const score = d._score;
                  return (
                    <div key={id} style={{ background:'#0a1022', border:`1.5px solid ${isWinner?'rgba(245,158,11,0.35)':'#1e293b'}`, borderRadius:12, padding:'1.25rem', position:'relative' }}>
                      {isWinner && (
                        <span style={{ position:'absolute', top:-11, left:14, background:'rgba(245,158,11,0.15)', color:'#f59e0b', border:'1px solid rgba(245,158,11,0.3)', padding:'2px 10px', borderRadius:20, fontSize:'11px', fontWeight:700 }}>
                          🏆 Winner
                        </span>
                      )}
                      <p style={{ fontSize:'0.82rem', fontWeight:600, color:'#e2e8f0', marginBottom:'0.75rem', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{name}</p>
                      <div style={{ fontSize:'2.5rem', fontWeight:800, color:isWinner?'#10b981':'#f59e0b', lineHeight:1, marginBottom:'0.75rem' }}>
                        {score}<span style={{ fontSize:'1rem', color:'#475569', fontWeight:400 }}>/100</span>
                      </div>
                      {/* Score bar */}
                      <div style={{ height:5, background:'#1e293b', borderRadius:99, overflow:'hidden', marginBottom:'0.75rem' }}>
                        <div style={{ height:'100%', width:`${score}%`, background:isWinner?'#10b981':'#6366f1', borderRadius:99, transition:'width 1s ease' }}/>
                      </div>
                      {d._strengths.slice(0,3).map((s,i) => (
                        <div key={i} style={{ display:'flex', gap:'0.5rem', fontSize:'0.78rem', color:'#10b981', marginBottom:'0.3rem', alignItems:'flex-start' }}>
                          <CheckCircle size={12} style={{ flexShrink:0, marginTop:2 }}/>{s}
                        </div>
                      ))}
                      {d._weaknesses.slice(0,2).map((w,i) => (
                        <div key={i} style={{ display:'flex', gap:'0.5rem', fontSize:'0.78rem', color:'#ef4444', marginBottom:'0.3rem', alignItems:'flex-start' }}>
                          <XCircle size={12} style={{ flexShrink:0, marginTop:2 }}/>{w}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>

              {/* Recommendation */}
              {comp.recommendation && (
                <div style={{ background:'rgba(99,102,241,0.06)', border:'1px solid rgba(99,102,241,0.15)', borderRadius:12, padding:'1rem 1.25rem' }}>
                  <p style={{ fontSize:'0.75rem', fontWeight:700, color:'#6366f1', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'0.5rem' }}>💡 AI Recommendation</p>
                  <p style={{ fontSize:'0.875rem', color:'#94a3b8', lineHeight:1.7, margin:0 }}>{comp.recommendation}</p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ComparePage;
