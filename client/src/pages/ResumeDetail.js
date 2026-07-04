import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { resumeAPI } from '../api/requests';
import ResultCard from '../components/ResultCard';
import Spinner from '../components/Spinner';
import { ArrowLeft } from 'lucide-react';

const ResumeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    resumeAPI.getOne(id)
      .then((res) => setResume(res.data.resume))
      .catch(() => setError('Resume not found'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="page-center"><Spinner size="lg" /></div>;
  if (error) return <div className="page-center"><p className="error-text">{error}</p></div>;

  return (
    <div className="page">
      <div className="page-header">
        <button className="btn-ghost" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Back
        </button>
      </div>
      <ResultCard analysis={resume.analysis} fileName={resume.fileName} />
    </div>
  );
};

export default ResumeDetail;
