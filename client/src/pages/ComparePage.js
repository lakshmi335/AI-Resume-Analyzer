import React, { useState, useEffect } from 'react';
import { resumeAPI } from '../api/requests';
import Spinner from '../components/Spinner';
import { GitCompare, Trophy, ChevronDown } from 'lucide-react';

const ComparePage = () => {
  const [resumes, setResumes] = useState([]);
  const [resumeId1, setResumeId1] = useState('');
  const [resumeId2, setResumeId2] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    resumeAPI.getAll().then((r) => setResumes(r.data.resumes));
  }, []);

  const handleCompare = async () => {
    if (!resumeId1 || !resumeId2 || resumeId1 === resumeId2) {
      setError('Please select two different resumes');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await resumeAPI.compare({ resumeId1, resumeId2, jobDescription });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Comparison failed');
    } finally {
      setLoading(false);
    }
  };

  const resumeName = (id) =>
    resumes.find((r) => r._id === id)?.fileName || 'Resume';

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Compare Resumes</h1>
          <p className="page-subtitle">Side-by-side AI comparison of two resumes</p>
        </div>
      </div>

      {resumes.length < 2 ? (
        <div className="empty-state section-card">
          <GitCompare size={40} className="empty-icon" />
          <p>You need at least 2 analyzed resumes to compare.</p>
          <a href="/upload" className="btn-primary">Upload a Resume</a>
        </div>
      ) : (
        <div className="section-card">
          <div className="compare-selects">
            <div className="form-group">
              <label>Resume 1</label>
              <div className="select-wrap">
                <select value={resumeId1} onChange={(e) => setResumeId1(e.target.value)}>
                  <option value="">Select resume</option>
                  {resumes.map((r) => (
                    <option key={r._id} value={r._id}>{r.fileName}</option>
                  ))}
                </select>
                <ChevronDown size={16} className="select-icon" />
              </div>
            </div>
            <div className="compare-vs">VS</div>
            <div className="form-group">
              <label>Resume 2</label>
              <div className="select-wrap">
                <select value={resumeId2} onChange={(e) => setResumeId2(e.target.value)}>
                  <option value="">Select resume</option>
                  {resumes.map((r) => (
                    <option key={r._id} value={r._id}>{r.fileName}</option>
                  ))}
                </select>
                <ChevronDown size={16} className="select-icon" />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Job Description (optional)</label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Add a job description to compare fit for a specific role..."
              rows={3}
              className="textarea"
            />
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button
            className="btn-primary"
            onClick={handleCompare}
            disabled={!resumeId1 || !resumeId2 || loading}
          >
            {loading ? <Spinner size="sm" /> : <><GitCompare size={16} /> Compare</>}
          </button>
        </div>
      )}

      {result && (
        <div className="compare-results">
          {/* Winner banner */}
          <div className="winner-banner">
            <Trophy size={20} />
            <span>
              <strong>{resumeName(result.winner === 1 ? resumeId1 : resumeId2)}</strong> is the stronger resume
            </span>
          </div>

          <p className="compare-rec">{result.comparison.recommendation}</p>

          <div className="compare-cards">
            {[1, 2].map((n) => {
              const id = n === 1 ? resumeId1 : resumeId2;
              const data = result.comparison[`resume${n}`];
              const isWinner = result.comparison.winner === n;
              return (
                <div key={n} className={`compare-card ${isWinner ? 'winner' : ''}`}>
                  {isWinner && <span className="winner-chip">🏆 Winner</span>}
                  <h3 className="compare-filename">{resumeName(id)}</h3>
                  <div className="compare-score-wrap">
                    <span
                      className="compare-score"
                      style={{ color: data.score >= 75 ? '#10b981' : data.score >= 50 ? '#f59e0b' : '#ef4444' }}
                    >
                      {data.score}
                    </span>
                    <span className="compare-score-den">/100</span>
                  </div>
                  <div className="compare-section">
                    <h4>Strengths</h4>
                    <ul className="list-green">
                      {data.strengths?.map((s, i) => <li key={i}>✓ {s}</li>)}
                    </ul>
                  </div>
                  <div className="compare-section">
                    <h4>Weaknesses</h4>
                    <ul className="list-red">
                      {data.weaknesses?.map((w, i) => <li key={i}>✗ {w}</li>)}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ComparePage;
