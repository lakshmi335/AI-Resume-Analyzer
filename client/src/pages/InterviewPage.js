import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react';

import {
  Send,
  Square,
  ChevronDown,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  CheckCircle,
  XCircle,
  Lightbulb,
  BookOpen,
  ArrowRight,
  Target,
  ThumbsUp,
  ThumbsDown,
  Minus,
  BarChart2,
  MessageSquare,
  Camera,
  CameraOff,
  AlertCircle,
  Eye,
  Trash2,
} from 'lucide-react';

import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

import {
  interviewAPI,
  resumeAPI,
} from '../api/requests';

import Spinner from '../components/Spinner';

// ============================================================
// SPEECH RECOGNITION
// ============================================================

const useSpeechRecognition = () => {
  const [transcript, setTranscript] =
    useState('');

  const [listening, setListening] =
    useState(false);

  const [error, setError] =
    useState('');

  const recognitionRef =
    useRef(null);

  const supported =
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window ||
      'webkitSpeechRecognition' in window);

  const startListening =
    useCallback(() => {
      if (!supported) {
        setError(
          'Speech recognition is not supported. Please use Google Chrome.'
        );
        return;
      }

      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}

        recognitionRef.current = null;
      }

      const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

      const recognition =
        new SpeechRecognition();

      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-IN';
      recognition.maxAlternatives = 1;

      setError('');
      setTranscript('');

      recognition.onstart = () => {
        setListening(true);
      };

      recognition.onresult = (event) => {
        let text = '';

        for (
          let i = event.resultIndex;
          i < event.results.length;
          i++
        ) {
          if (
            event.results[i] &&
            event.results[i][0]
          ) {
            text +=
              event.results[i][0]
                .transcript;
          }
        }

        if (text.trim()) {
          setTranscript(
            text.trim()
          );
        }
      };

      recognition.onerror = (
        event
      ) => {
        console.error(
          'Speech recognition error:',
          event.error
        );

        if (
          event.error ===
          'not-allowed'
        ) {
          setError(
            'Microphone permission denied.'
          );
        } else if (
          event.error ===
          'audio-capture'
        ) {
          setError(
            'Microphone not found.'
          );
        } else if (
          event.error === 'network'
        ) {
          setError(
            'Speech recognition network error.'
          );
        }

        setListening(false);
      };

      recognition.onend = () => {
        setListening(false);
        recognitionRef.current = null;
      };

      recognitionRef.current =
        recognition;

      try {
        recognition.start();
      } catch (error) {
        console.error(error);

        setListening(false);
        recognitionRef.current = null;
      }
    }, [supported]);

  const stopListening =
    useCallback(() => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}

        recognitionRef.current = null;
      }

      setListening(false);
    }, []);

  const clearTranscript =
    useCallback(() => {
      setTranscript('');
    }, []);

  return {
    transcript,
    listening,
    supported,
    error,
    startListening,
    stopListening,
    clearTranscript,
    setTranscript,
  };
};

// ============================================================
// TEXT TO SPEECH
// ============================================================

const useTTS = () => {
  const [speaking, setSpeaking] =
    useState(false);

  const [enabled, setEnabled] =
    useState(true);

  const speak =
    useCallback(
      (text) => {
        if (
          !enabled ||
          !window.speechSynthesis ||
          !text
        ) {
          return;
        }

        window.speechSynthesis.cancel();

        const utterance =
          new SpeechSynthesisUtterance(
            text
          );

        utterance.rate = 0.95;
        utterance.pitch = 1;
        utterance.volume = 1;

        const voices =
          window.speechSynthesis.getVoices();

        const voice =
          voices.find(
            (v) =>
              v.name.includes(
                'Google'
              ) &&
              v.lang === 'en-US'
          ) ||
          voices.find(
            (v) =>
              v.lang === 'en-US'
          ) ||
          voices[0];

        if (voice) {
          utterance.voice =
            voice;
        }

        utterance.onstart = () =>
          setSpeaking(true);

        utterance.onend = () =>
          setSpeaking(false);

        utterance.onerror = () =>
          setSpeaking(false);

        window.speechSynthesis.speak(
          utterance
        );
      },
      [enabled]
    );

  const stop =
    useCallback(() => {
      window.speechSynthesis?.cancel();
      setSpeaking(false);
    }, []);

  return {
    speaking,
    enabled,
    setEnabled,
    speak,
    stop,
  };
};

// ============================================================
// LOAD SCRIPT
// ============================================================

const loadScript = (
  src,
  id
) => {
  return new Promise(
    (resolve, reject) => {
      const existing =
        document.getElementById(id);

      if (existing) {
        if (
          existing.dataset.loaded ===
          'true'
        ) {
          resolve();
          return;
        }

        existing.addEventListener(
          'load',
          resolve,
          { once: true }
        );

        existing.addEventListener(
          'error',
          reject,
          { once: true }
        );

        return;
      }

      const script =
        document.createElement(
          'script'
        );

      script.id = id;
      script.src = src;
      script.async = true;

      script.onload = () => {
        script.dataset.loaded =
          'true';

        resolve();
      };

      script.onerror = () => {
        reject(
          new Error(
            'Failed to load detection library.'
          )
        );
      };

      document.head.appendChild(
        script
      );
    }
  );
};

// ============================================================
// CAMERA
// ============================================================

const useCamera = () => {
  const [cameraOn, setCameraOn] =
    useState(false);

  const [cameraError, setCameraError] =
    useState('');

  const [postureTip, setPostureTip] =
    useState('');

  const [peopleCount, setPeopleCount] =
    useState(0);

  const [
    multiplePeopleDetected,
    setMultiplePeopleDetected,
  ] = useState(false);

  const [
    faceDetectionSupported,
    setFaceDetectionSupported,
  ] = useState(false);

  const [cameraWarning, setCameraWarning] =
    useState('');

  const streamRef =
    useRef(null);

  const videoRef =
    useRef(null);

  const detectorRef =
    useRef(null);

  const detectionIntervalRef =
    useRef(null);

  const detectingRef =
    useRef(false);

  const multipleCountRef =
    useRef(0);

  const warningShownRef =
    useRef(false);

  const postureIntervalRef =
    useRef(null);

  const postureTips = [
    '✅ Great posture! Sit straight and maintain eye contact.',
    '📏 Sit up straight and keep your shoulders relaxed.',
    '👁️ Look directly at the camera.',
    '💡 Make sure your face is well-lit.',
    '📐 Center yourself in the frame.',
    '🤝 Keep your hands visible when possible.',
    '😊 Maintain a confident expression.',
  ];

  const handlePeopleCount =
    useCallback((count) => {
      setPeopleCount(count);

      if (count >= 2) {
        multipleCountRef.current += 1;

        if (
          multipleCountRef.current >=
          2
        ) {
          setMultiplePeopleDetected(
            true
          );

          setCameraWarning(
            `⚠️ ${count} people detected. Only the candidate should be visible during the interview.`
          );

          if (
            !warningShownRef.current
          ) {
            warningShownRef.current =
              true;

            window.alert(
              `⚠️ MULTIPLE PEOPLE DETECTED\n\n${count} people are visible in the camera frame.\n\nPlease make sure only the candidate is present.`
            );
          }
        }
      } else {
        multipleCountRef.current = 0;

        setMultiplePeopleDetected(
          false
        );

        setCameraWarning('');

        warningShownRef.current =
          false;
      }
    }, []);

  const processPeople =
    useCallback(
      (predictions) => {
        if (
          !Array.isArray(
            predictions
          )
        ) {
          return;
        }

        const people =
          predictions.filter(
            (prediction) =>
              prediction.class ===
                'person' &&
              prediction.score >=
                0.3
          );

        handlePeopleCount(
          people.length
        );
      },
      [handlePeopleCount]
    );

  const loadPersonDetector =
    useCallback(async () => {
      try {
        await loadScript(
          'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js',
          'tensorflow-js-script'
        );

        await loadScript(
          'https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd@2.2.3/dist/coco-ssd.min.js',
          'coco-ssd-script'
        );

        if (!window.cocoSsd) {
          throw new Error(
            'COCO-SSD unavailable'
          );
        }

        const model =
          await window.cocoSsd.load({
            base: 'lite_mobilenet_v2',
          });

        detectorRef.current =
          model;

        setFaceDetectionSupported(
          true
        );

        return model;
      } catch (error) {
        console.error(error);

        setFaceDetectionSupported(
          false
        );

        setCameraWarning(
          'Person detection could not be loaded.'
        );

        return null;
      }
    }, []);

  const detectPeople =
    useCallback(async () => {
      if (
        !videoRef.current ||
        !detectorRef.current ||
        detectingRef.current
      ) {
        return;
      }

      const video =
        videoRef.current;

      if (
        video.readyState < 2 ||
        video.videoWidth === 0 ||
        video.videoHeight === 0
      ) {
        return;
      }

      detectingRef.current = true;

      try {
        const predictions =
          await detectorRef.current.detect(
            video,
            20,
            0.3
          );

        processPeople(
          predictions
        );
      } catch (error) {
        console.error(error);
      } finally {
        detectingRef.current = false;
      }
    }, [processPeople]);

  const startPersonDetection =
    useCallback(async () => {
      if (!videoRef.current) {
        return;
      }

      const model =
        await loadPersonDetector();

      if (!model) {
        return;
      }

      if (
        detectionIntervalRef.current
      ) {
        clearInterval(
          detectionIntervalRef.current
        );
      }

      detectionIntervalRef.current =
        setInterval(
          detectPeople,
          500
        );

      detectPeople();
    }, [
      loadPersonDetector,
      detectPeople,
    ]);

  const stopPersonDetection =
    useCallback(() => {
      if (
        detectionIntervalRef.current
      ) {
        clearInterval(
          detectionIntervalRef.current
        );

        detectionIntervalRef.current =
          null;
      }

      detectorRef.current = null;
      detectingRef.current = false;

      multipleCountRef.current = 0;
      warningShownRef.current = false;

      setPeopleCount(0);
      setMultiplePeopleDetected(
        false
      );
      setCameraWarning('');
      setFaceDetectionSupported(
        false
      );
    }, []);

  const startCamera =
    useCallback(async () => {
      try {
        setCameraError('');
        setCameraWarning('');

        const stream =
          await navigator.mediaDevices.getUserMedia(
            {
              video: {
                width: {
                  ideal: 1280,
                },
                height: {
                  ideal: 720,
                },
                facingMode: 'user',
              },
              audio: false,
            }
          );

        streamRef.current =
          stream;

        setCameraOn(true);

        setPostureTip(
          postureTips[0]
        );

        let index = 1;

        postureIntervalRef.current =
          setInterval(() => {
            setPostureTip(
              postureTips[
                index %
                  postureTips.length
              ]
            );

            index++;
          }, 8000);
      } catch (error) {
        console.error(error);

        setCameraError(
          'Camera access denied. Please allow camera permission in Chrome.'
        );

        setCameraOn(false);
      }
    }, []);

  useEffect(() => {
    if (
      !cameraOn ||
      !streamRef.current ||
      !videoRef.current
    ) {
      return;
    }

    const video =
      videoRef.current;

    video.srcObject =
      streamRef.current;

    const start =
      async () => {
        try {
          await video.play();

          await startPersonDetection();
        } catch (error) {
          console.error(error);
        }
      };

    if (
      video.readyState >= 2
    ) {
      start();
    } else {
      video.onloadedmetadata =
        start;
    }

    return () => {
      video.onloadedmetadata =
        null;
    };
  }, [
    cameraOn,
    startPersonDetection,
  ]);

  const stopCamera =
    useCallback(() => {
      stopPersonDetection();

      if (
        postureIntervalRef.current
      ) {
        clearInterval(
          postureIntervalRef.current
        );

        postureIntervalRef.current =
          null;
      }

      if (streamRef.current) {
        streamRef.current
          .getTracks()
          .forEach((track) =>
            track.stop()
          );

        streamRef.current =
          null;
      }

      if (videoRef.current) {
        videoRef.current.srcObject =
          null;
      }

      setCameraOn(false);
      setPostureTip('');
      setCameraWarning('');
    }, [stopPersonDetection]);

  const toggleCamera =
    useCallback(() => {
      if (cameraOn) {
        stopCamera();
      } else {
        startCamera();
      }
    }, [
      cameraOn,
      startCamera,
      stopCamera,
    ]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return {
    cameraOn,
    cameraError,
    postureTip,
    peopleCount,
    multiplePeopleDetected,
    faceDetectionSupported,
    cameraWarning,
    videoRef,
    toggleCamera,
    stopCamera,
  };
};

// ============================================================
// SCORE RING
// ============================================================

const ScoreRing = ({
  score,
  label,
  size = 120,
}) => {
  const radius = 42;

  const circumference =
    2 * Math.PI * radius;

  const safeScore = Math.max(
    0,
    Math.min(
      100,
      Number(score) || 0
    )
  );

  const color =
    safeScore >= 75
      ? '#10b981'
      : safeScore >= 50
      ? '#f59e0b'
      : '#ef4444';

  return (
    <div
      style={{
        textAlign: 'center',
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
      >
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="#1e293b"
          strokeWidth="8"
        />

        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={
            circumference
          }
          strokeDashoffset={
            circumference -
            (safeScore / 100) *
              circumference
          }
          strokeLinecap="round"
          transform="rotate(-90 50 50)"
        />

        <text
          x="50"
          y="46"
          textAnchor="middle"
          fill="white"
          fontSize="18"
          fontWeight="bold"
        >
          {safeScore}
        </text>

        <text
          x="50"
          y="62"
          textAnchor="middle"
          fill="#94a3b8"
          fontSize="9"
        >
          /100
        </text>
      </svg>

      <div
        style={{
          color: '#94a3b8',
          fontSize: '0.75rem',
        }}
      >
        {label}
      </div>
    </div>
  );
};

// ============================================================
// QUALITY BADGE
// ============================================================

const QualityBadge = ({
  quality,
}) => {
  const map = {
    good: {
      icon: ThumbsUp,
      color: '#10b981',
      label: 'Good',
    },

    average: {
      icon: Minus,
      color: '#f59e0b',
      label: 'Average',
    },

    poor: {
      icon: ThumbsDown,
      color: '#ef4444',
      label: 'Needs Work',
    },
  };

  const config =
    map[quality] ||
    map.average;

  const Icon =
    config.icon;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        color: config.color,
        fontWeight: 700,
        fontSize: '0.75rem',
      }}
    >
      <Icon size={12} />
      {config.label}
    </span>
  );
};

// ============================================================
// SECTION
// ============================================================

const Section = ({
  title,
  icon: Icon,
  children,
  defaultOpen = false,
}) => {
  const [open, setOpen] =
    useState(defaultOpen);

  return (
    <div className="result-section">
      <button
        className="section-header"
        onClick={() =>
          setOpen(!open)
        }
      >
        <div className="section-title">
          <Icon size={18} />
          <span>{title}</span>
        </div>

        <span>
          {open ? '▲' : '▼'}
        </span>
      </button>

      {open && (
        <div className="section-body">
          {children}
        </div>
      )}
    </div>
  );
};

// ============================================================
// MAIN PAGE
// ============================================================

const InterviewPage = () => {
  const [step, setStep] =
    useState('setup');

  const [resumes, setResumes] =
    useState([]);

  const [
    previousInterviews,
    setPreviousInterviews,
  ] = useState([]);

  const [form, setForm] =
    useState({
      jobRole: '',
      jobDescription: '',
      resumeId: '',
      difficulty: 'medium',
    });

  const [interview, setInterview] =
    useState(null);

  const [messages, setMessages] =
    useState([]);

  const [input, setInput] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState('');

  const [feedback, setFeedback] =
    useState(null);

  const [activeTab, setActiveTab] =
    useState('overview');

  const messagesEndRef =
    useRef(null);

  // ==========================================================
  // SPEECH
  // ==========================================================

  const {
    transcript,
    listening,
    supported: sttOk,
    startListening,
    stopListening,
    clearTranscript,
    setTranscript,
  } =
    useSpeechRecognition();

  // ==========================================================
  // TTS
  // ==========================================================

  const {
    speaking,
    enabled: ttsOn,
    setEnabled: setTts,
    speak,
    stop: stopSpeak,
  } = useTTS();

  // ==========================================================
  // CAMERA
  // ==========================================================

  const {
    cameraOn,
    cameraError,
    postureTip,
    peopleCount,
    multiplePeopleDetected,
    faceDetectionSupported,
    cameraWarning,
    videoRef,
    toggleCamera,
    stopCamera,
  } = useCamera();

  // ==========================================================
  // LOAD DATA
  // ==========================================================

  const loadInterviewHistory =
    useCallback(async () => {
      try {
        const res =
          await interviewAPI.getAll();

        setPreviousInterviews(
          res.data.interviews || []
        );
      } catch (err) {
        console.error(
          'Interview history error:',
          err
        );
      }
    }, []);

  useEffect(() => {
    resumeAPI
      .getAll()
      .then((res) => {
        setResumes(
          res.data.resumes || []
        );
      })
      .catch((err) => {
        console.error(
          'Resume loading error:',
          err
        );
      });

    loadInterviewHistory();
  }, [loadInterviewHistory]);

  // ==========================================================
  // SCROLL
  // ==========================================================

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
    });
  }, [messages]);

  // ==========================================================
  // SPEECH INPUT
  // ==========================================================

  useEffect(() => {
    if (transcript) {
      setInput(transcript);
    }
  }, [transcript]);

  // ==========================================================
  // MIC
  // ==========================================================

  const toggleMic = () => {
    if (listening) {
      stopListening();
      return;
    }

    clearTranscript();
    setInput('');
    startListening();
  };

  // ==========================================================
  // START INTERVIEW
  // ==========================================================

  const startInterview =
    async () => {
      if (!form.jobRole.trim()) {
        setError(
          'Please enter a job role.'
        );
        return;
      }

      if (!cameraOn) {
        setError(
          'Camera is mandatory. Please enable your camera.'
        );

        window.alert(
          '⚠️ CAMERA REQUIRED\n\nPlease enable your camera before starting the interview.'
        );

        return;
      }

      setLoading(true);
      setError('');

      try {
        const res =
          await interviewAPI.start(
            form
          );

        const newInterview =
          res.data.interview;

        setInterview(
          newInterview
        );

        setMessages(
          newInterview.messages ||
            []
        );

        setFeedback(null);

        setStep('active');

        if (
          newInterview.messages
            ?.length
        ) {
          const first =
            newInterview.messages[0];

          if (
            first.role ===
            'assistant'
          ) {
            speak(
              first.content
            );
          }
        }
      } catch (err) {
        console.error(err);

        setError(
          err.response?.data
            ?.error ||
            'Failed to start interview'
        );
      } finally {
        setLoading(false);
      }
    };

  // ==========================================================
  // SEND MESSAGE
  // ==========================================================

  const sendMessage =
    async () => {
      if (
        !input.trim() ||
        loading ||
        !interview
      ) {
        return;
      }

      const msg =
        input.trim();

      setInput('');
      clearTranscript();

      if (listening) {
        stopListening();
      }

      setMessages((prev) => [
        ...prev,
        {
          role: 'user',
          content: msg,
        },
      ]);

      setLoading(true);

      try {
        const res =
          await interviewAPI.sendMessage(
            interview._id,
            msg
          );

        const aiMessage =
          res.data.message;

        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content:
              aiMessage,
          },
        ]);

        speak(aiMessage);
      } catch (err) {
        console.error(err);

        setError(
          err.response?.data
            ?.error ||
            'Failed to send answer'
        );
      } finally {
        setLoading(false);
      }
    };

  // ==========================================================
  // END INTERVIEW
  // ==========================================================

  const endInterview =
    async () => {
      if (!interview) {
        return;
      }

      setLoading(true);
      setError('');

      stopSpeak();

      if (listening) {
        stopListening();
      }

      try {
        const res =
          await interviewAPI.end(
            interview._id
          );

        const completedInterview =
          res.data.interview;

        const report =
          completedInterview?.feedback ||
          res.data.feedback ||
          null;

        if (!report) {
          throw new Error(
            'Report was not returned by the server.'
          );
        }

        setInterview(
          completedInterview
        );

        setMessages(
          completedInterview.messages ||
            messages
        );

        setFeedback(report);

        stopCamera();

        setActiveTab(
          'overview'
        );

        setStep('feedback');

        // Refresh saved reports
        await loadInterviewHistory();
      } catch (err) {
        console.error(
          'End interview error:',
          err
        );

        setError(
          err.response?.data
            ?.error ||
            err.message ||
            'Failed to generate interview report'
        );
      } finally {
        setLoading(false);
      }
    };

  // ==========================================================
  // VIEW PREVIOUS REPORT
  // ==========================================================

  const viewPreviousInterview =
    async (id) => {
      try {
        setLoading(true);
        setError('');

        const res =
          await interviewAPI.getOne(
            id
          );

        const loaded =
          res.data.interview;

        setInterview(loaded);

        setMessages(
          loaded.messages || []
        );

        setFeedback(
          loaded.feedback ||
            res.data.feedback ||
            null
        );

        setActiveTab(
          'overview'
        );

        setStep('feedback');
      } catch (err) {
        console.error(err);

        setError(
          err.response?.data
            ?.error ||
            'Failed to load interview report'
        );
      } finally {
        setLoading(false);
      }
    };

  // ==========================================================
  // DELETE REPORT
  // ==========================================================

  const deletePreviousInterview =
    async (id) => {
      const confirmed =
        window.confirm(
          'Are you sure you want to delete this interview report?'
        );

      if (!confirmed) {
        return;
      }

      try {
        setLoading(true);

        await interviewAPI.delete(
          id
        );

        setPreviousInterviews(
          (prev) =>
            prev.filter(
              (item) =>
                item._id !== id
            )
        );
      } catch (err) {
        console.error(err);

        setError(
          err.response?.data
            ?.error ||
            'Failed to delete report'
        );
      } finally {
        setLoading(false);
      }
    };

  // ==========================================================
  // RESET
  // ==========================================================

  const reset = () => {
    stopSpeak();
    stopCamera();

    if (listening) {
      stopListening();
    }

    setStep('setup');
    setInterview(null);
    setMessages([]);
    setFeedback(null);
    setInput('');
    clearTranscript();
    setActiveTab('overview');
    setError('');

    loadInterviewHistory();
  };

  // ==========================================================
  // SETUP
  // ==========================================================

  if (step === 'setup') {
    return (
      <div className="page">
        <div className="page-header">
          <div>
            <h1 className="page-title">
              Mock Interview
            </h1>

            <p className="page-subtitle">
              AI-powered interview with
              camera & voice support
            </p>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              '1fr 1fr',
            gap: '1.5rem',
          }}
        >
          {/* FORM */}

          <div className="setup-card">
            <div className="form-group">
              <label>
                Job Role *
              </label>

              <input
                type="text"
                value={
                  form.jobRole
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    jobRole:
                      e.target.value,
                  })
                }
                placeholder="e.g. Frontend Developer"
              />
            </div>

            <div className="form-group">
              <label>
                Difficulty
              </label>

              <div className="difficulty-tabs">
                {[
                  'easy',
                  'medium',
                  'hard',
                ].map((d) => (
                  <button
                    key={d}
                    className={`difficulty-tab ${
                      form.difficulty ===
                      d
                        ? 'active'
                        : ''
                    }`}
                    onClick={() =>
                      setForm({
                        ...form,
                        difficulty: d,
                      })
                    }
                  >
                    {d
                      .charAt(0)
                      .toUpperCase() +
                      d.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {resumes.length >
              0 && (
              <div className="form-group">
                <label>
                  Resume
                </label>

                <div className="select-wrap">
                  <select
                    value={
                      form.resumeId
                    }
                    onChange={(e) =>
                      setForm({
                        ...form,
                        resumeId:
                          e.target.value,
                      })
                    }
                  >
                    <option value="">
                      — No resume —
                    </option>

                    {resumes.map(
                      (r) => (
                        <option
                          key={
                            r._id
                          }
                          value={
                            r._id
                          }
                        >
                          {
                            r.fileName
                          }
                        </option>
                      )
                    )}
                  </select>

                  <ChevronDown
                    size={16}
                    className="select-icon"
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label>
                Job Description
              </label>

              <textarea
                value={
                  form.jobDescription
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    jobDescription:
                      e.target.value,
                  })
                }
                placeholder="Paste job description..."
                rows={4}
                className="textarea"
              />
            </div>

            {error && (
              <div className="auth-error">
                {error}
              </div>
            )}

            <div
              style={{
                padding:
                  '0.8rem',
                marginBottom:
                  '1rem',
                borderRadius: 10,
                background:
                  cameraOn
                    ? 'rgba(16,185,129,0.08)'
                    : 'rgba(239,68,68,0.08)',
                border:
                  cameraOn
                    ? '1px solid rgba(16,185,129,.3)'
                    : '1px solid rgba(239,68,68,.3)',
                color:
                  cameraOn
                    ? '#86efac'
                    : '#fca5a5',
                fontSize:
                  '.78rem',
              }}
            >
              {cameraOn
                ? '✅ Camera enabled. Candidate monitoring is active.'
                : '⚠️ Camera is mandatory before starting the interview.'}
            </div>

            <button
              className="btn-primary btn-full"
              onClick={
                startInterview
              }
              disabled={
                !form.jobRole.trim() ||
                !cameraOn ||
                loading
              }
            >
              {loading ? (
                <Spinner size="sm" />
              ) : (
                '🎤 Start Interview'
              )}
            </button>
          </div>

          {/* CAMERA */}

          <div
            style={{
              background:
                '#0c1120',
              border:
                '1px solid #1e293b',
              borderRadius: 14,
              overflow:
                'hidden',
            }}
          >
            <div
              style={{
                padding:
                  '12px 16px',
                display:
                  'flex',
                justifyContent:
                  'space-between',
                borderBottom:
                  '1px solid #1e293b',
              }}
            >
              <span>
                📷 Camera Preview
              </span>

              <button
                onClick={
                  toggleCamera
                }
                className="btn-ghost"
              >
                {cameraOn ? (
                  <Camera
                    size={14}
                  />
                ) : (
                  <CameraOff
                    size={14}
                  />
                )}

                {cameraOn
                  ? 'On'
                  : 'Enable Camera'}
              </button>
            </div>

            <div
              style={{
                aspectRatio:
                  '4/3',
                position:
                  'relative',
                background:
                  '#050810',
              }}
            >
              {cameraOn ? (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    style={{
                      width:
                        '100%',
                      height:
                        '100%',
                      objectFit:
                        'cover',
                      transform:
                        'scaleX(-1)',
                    }}
                  />

                  <div
                    style={{
                      position:
                        'absolute',
                      top: 8,
                      left: 8,
                      background:
                        'rgba(0,0,0,.7)',
                      padding:
                        '4px 10px',
                      borderRadius: 20,
                      color:
                        '#ef4444',
                      fontSize: 10,
                      fontWeight: 700,
                    }}
                  >
                    🔴 LIVE
                  </div>

                  {faceDetectionSupported && (
                    <div
                      style={{
                        position:
                          'absolute',
                        bottom: 8,
                        left: 8,
                        right: 8,
                        padding:
                          '8px',
                        borderRadius: 8,
                        background:
                          multiplePeopleDetected
                            ? 'rgba(127,29,29,.95)'
                            : 'rgba(0,0,0,.75)',
                        color:
                          multiplePeopleDetected
                            ? '#fecaca'
                            : '#86efac',
                        textAlign:
                          'center',
                        fontWeight:
                          700,
                        fontSize: 12,
                      }}
                    >
                      {multiplePeopleDetected
                        ? `⚠️ ${peopleCount} PEOPLE DETECTED`
                        : peopleCount ===
                          1
                        ? '✓ 1 CANDIDATE DETECTED'
                        : '🔍 SCANNING...'}
                    </div>
                  )}
                </>
              ) : (
                <div
                  style={{
                    height:
                      '100%',
                    display:
                      'flex',
                    alignItems:
                      'center',
                    justifyContent:
                      'center',
                    flexDirection:
                      'column',
                    gap: 10,
                  }}
                >
                  <CameraOff
                    size={40}
                  />

                  <button
                    className="btn-ghost"
                    onClick={
                      toggleCamera
                    }
                  >
                    Enable Camera
                  </button>
                </div>
              )}
            </div>

            {cameraError && (
              <div
                style={{
                  padding: 12,
                  color:
                    '#fca5a5',
                }}
              >
                <AlertCircle
                  size={14}
                />{' '}
                {cameraError}
              </div>
            )}

            {postureTip &&
              cameraOn && (
                <div
                  style={{
                    padding: 12,
                    color:
                      '#94a3b8',
                    borderTop:
                      '1px solid #1e293b',
                    fontSize: 12,
                  }}
                >
                  {postureTip}
                </div>
              )}
          </div>
        </div>

        {/* ====================================================
            PREVIOUS REPORTS
        ==================================================== */}

        <div
          style={{
            marginTop:
              '2rem',
          }}
        >
          <div
            style={{
              marginBottom:
                '1rem',
            }}
          >
            <h2>
              Recent Interviews
            </h2>

            <p
              style={{
                color:
                  '#94a3b8',
              }}
            >
              Your completed interview
              reports are saved here.
            </p>
          </div>

          {previousInterviews.length ===
          0 ? (
            <div
              className="setup-card"
              style={{
                textAlign:
                  'center',
                padding:
                  '2rem',
              }}
            >
              <BarChart2
                size={40}
              />

              <h3>
                No previous reports
              </h3>

              <p
                style={{
                  color:
                    '#94a3b8',
                }}
              >
                Complete an interview
                to generate your
                first report.
              </p>
            </div>
          ) : (
            <div
              style={{
                display:
                  'grid',
                gridTemplateColumns:
                  'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1rem',
              }}
            >
              {previousInterviews.map(
                (item) => (
                  <div
                    key={
                      item._id
                    }
                    className="setup-card"
                    style={{
                      padding:
                        '1.2rem',
                    }}
                  >
                    <div
                      style={{
                        display:
                          'flex',
                        justifyContent:
                          'space-between',
                        gap: 10,
                      }}
                    >
                      <strong>
                        {
                          item.jobRole
                        }
                      </strong>

                      <span
                        style={{
                          color:
                            item.status ===
                            'completed'
                              ? '#86efac'
                              : '#fcd34d',
                        }}
                      >
                        {item.status ===
                        'completed'
                          ? 'Completed'
                          : 'Active'}
                      </span>
                    </div>

                    <p
                      style={{
                        color:
                          '#94a3b8',
                        fontSize:
                          12,
                      }}
                    >
                      {item.createdAt
                        ? new Date(
                            item.createdAt
                          ).toLocaleString()
                        : ''}
                    </p>

                    <div
                      style={{
                        margin:
                          '1rem 0',
                      }}
                    >
                      <span
                        style={{
                          color:
                            '#94a3b8',
                          fontSize:
                            12,
                        }}
                      >
                        Overall Score
                      </span>

                      <div
                        style={{
                          fontSize:
                            '2rem',
                          fontWeight:
                            800,
                        }}
                      >
                        {item.feedback
                          ?.overallScore ??
                          0}
                        /100
                      </div>
                    </div>

                    <div
                      style={{
                        display:
                          'flex',
                        gap: 8,
                      }}
                    >
                      <button
                        className="btn-primary"
                        style={{
                          flex: 1,
                        }}
                        onClick={() =>
                          viewPreviousInterview(
                            item._id
                          )
                        }
                      >
                        <Eye
                          size={14}
                        />
                        View Report
                      </button>

                      <button
                        className="btn-ghost"
                        onClick={() =>
                          deletePreviousInterview(
                            item._id
                          )
                        }
                      >
                        <Trash2
                          size={14}
                        />
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ==========================================================
  // ACTIVE INTERVIEW
  // ==========================================================

  if (step === 'active') {
    return (
      <div
        className="page"
        style={{
          display: 'flex',
          flexDirection:
            'column',
          height:
            'calc(100vh - 80px)',
        }}
      >
        <div
          style={{
            display:
              'flex',
            justifyContent:
              'space-between',
            alignItems:
              'center',
            marginBottom: 12,
            gap: 10,
          }}
        >
          <div>
            <h2 className="interview-role">
              {interview?.jobRole}
            </h2>

            <span>
              {interview?.difficulty}
            </span>
          </div>

          <div
            style={{
              display:
                'flex',
              gap: 8,
            }}
          >
            <div
              style={{
                padding:
                  '7px 10px',
                borderRadius: 8,
                background:
                  cameraOn
                    ? 'rgba(16,185,129,.1)'
                    : 'rgba(239,68,68,.1)',
                color:
                  cameraOn
                    ? '#86efac'
                    : '#fca5a5',
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              {cameraOn
                ? '📷 Camera Active'
                : '⚠️ Camera Required'}
            </div>

            <button
              className="btn-ghost"
              onClick={() => {
                setTts(
                  !ttsOn
                );

                if (ttsOn) {
                  stopSpeak();
                }
              }}
            >
              {ttsOn ? (
                <Volume2
                  size={14}
                />
              ) : (
                <VolumeX
                  size={14}
                />
              )}

              {ttsOn
                ? 'Voice On'
                : 'Voice Off'}
            </button>

            <button
              className="btn-danger"
              onClick={
                endInterview
              }
              disabled={
                loading
              }
            >
              <Square
                size={14}
              />
              End & Analyze
            </button>
          </div>
        </div>

        {multiplePeopleDetected && (
          <div
            style={{
              padding:
                '12px 15px',
              marginBottom: 12,
              borderRadius: 10,
              background:
                'rgba(239,68,68,.15)',
              border:
                '2px solid rgba(239,68,68,.55)',
              color:
                '#fecaca',
              fontWeight: 700,
            }}
          >
            <AlertCircle
              size={22}
            />

            ⚠️ MULTIPLE PEOPLE
            DETECTED —{' '}
            {peopleCount}{' '}
            people are visible.
          </div>
        )}

        {cameraWarning &&
          !multiplePeopleDetected && (
            <div
              style={{
                padding: 10,
                marginBottom: 10,
                borderRadius: 8,
                background:
                  'rgba(245,158,11,.1)',
                color:
                  '#fcd34d',
              }}
            >
              {cameraWarning}
            </div>
          )}

        <div
          style={{
            display:
              'grid',
            gridTemplateColumns:
              '1fr 300px',
            gap: 15,
            flex: 1,
            minHeight: 0,
          }}
        >
          <div
            style={{
              display:
                'flex',
              flexDirection:
                'column',
              minHeight: 0,
            }}
          >
            {speaking && (
              <div
                style={{
                  padding: 8,
                  marginBottom: 8,
                  background:
                    'rgba(99,102,241,.1)',
                  borderRadius: 8,
                }}
              >
                🔊 AI Interviewer
                is speaking...

                <button
                  onClick={
                    stopSpeak
                  }
                  style={{
                    marginLeft: 10,
                  }}
                >
                  Stop
                </button>
              </div>
            )}

            <div
              className="chat-window"
              style={{
                flex: 1,
                overflowY:
                  'auto',
              }}
            >
              {messages.map(
                (
                  message,
                  index
                ) => (
                  <div
                    key={
                      index
                    }
                    className={`chat-msg ${message.role}`}
                  >
                    <div className="chat-bubble">
                      <strong>
                        {message.role ===
                        'user'
                          ? '👤 You'
                          : '🤖 AI Interviewer'}
                      </strong>

                      <p>
                        {
                          message.content
                        }
                      </p>

                      {message.role ===
                        'assistant' && (
                        <button
                          onClick={() =>
                            speak(
                              message.content
                            )
                          }
                        >
                          <Volume2
                            size={
                              12
                            }
                          />{' '}
                          Replay
                        </button>
                      )}
                    </div>
                  </div>
                )
              )}

              {loading && (
                <div className="chat-msg assistant">
                  <div className="chat-bubble">
                    AI is analyzing...
                  </div>
                </div>
              )}

              <div
                ref={
                  messagesEndRef
                }
              />
            </div>

            {listening && (
              <div
                style={{
                  padding: 8,
                  color:
                    '#fca5a5',
                }}
              >
                🔴 🎤 Listening...
              </div>
            )}

            <div
              className="chat-input-row"
              style={{
                marginTop: 10,
              }}
            >
              <textarea
                className="chat-input"
                value={input}
                onChange={(e) => {
                  setInput(
                    e.target.value
                  );

                  setTranscript(
                    e.target.value
                  );
                }}
                onKeyDown={(e) => {
                  if (
                    e.key ===
                      'Enter' &&
                    !e.shiftKey
                  ) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder={
                  listening
                    ? '🎤 Listening...'
                    : 'Type or speak your answer...'
                }
                rows={3}
                disabled={
                  loading
                }
              />

              {sttOk && (
                <button
                  onClick={
                    toggleMic
                  }
                  disabled={
                    loading
                  }
                  className="btn-ghost"
                >
                  {listening ? (
                    <MicOff
                      size={20}
                    />
                  ) : (
                    <Mic
                      size={20}
                    />
                  )}
                </button>
              )}

              <button
                className="btn-primary"
                onClick={
                  sendMessage
                }
                disabled={
                  !input.trim() ||
                  loading
                }
              >
                <Send
                  size={18}
                />
              </button>
            </div>
          </div>

          <div
            style={{
              display:
                'flex',
              flexDirection:
                'column',
              gap: 12,
            }}
          >
            <div
              style={{
                background:
                  '#0a0f1a',
                border:
                  '1px solid #1e293b',
                borderRadius: 12,
                overflow:
                  'hidden',
              }}
            >
              <div
                style={{
                  padding: 10,
                  display:
                    'flex',
                  justifyContent:
                    'space-between',
                }}
              >
                <span>
                  👤 Candidate
                </span>

                <span
                  style={{
                    color:
                      cameraOn
                        ? '#86efac'
                        : '#fca5a5',
                  }}
                >
                  {cameraOn
                    ? '🔴 LIVE'
                    : '⚠️ REQUIRED'}
                </span>
              </div>

              <div
                style={{
                  aspectRatio:
                    '4/3',
                  position:
                    'relative',
                  background:
                    '#050810',
                }}
              >
                {cameraOn ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    style={{
                      width:
                        '100%',
                      height:
                        '100%',
                      objectFit:
                        'cover',
                      transform:
                        'scaleX(-1)',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      height:
                        '100%',
                      display:
                        'flex',
                      alignItems:
                        'center',
                      justifyContent:
                        'center',
                    }}
                  >
                    <CameraOff
                      size={30}
                    />
                  </div>
                )}
              </div>

              <div
                style={{
                  padding: 10,
                  fontSize: 12,
                }}
              >
                {multiplePeopleDetected
                  ? `⚠️ ${peopleCount} people detected`
                  : peopleCount ===
                    1
                  ? '✓ Candidate detected'
                  : '🔍 Monitoring camera...'}
              </div>
            </div>

            <div
              style={{
                padding: 15,
                textAlign:
                  'center',
                background:
                  '#0a0f1a',
                border:
                  '1px solid #1e293b',
                borderRadius: 12,
              }}
            >
              <div
                style={{
                  fontSize:
                    30,
                }}
              >
                🤖
              </div>

              <p>
                AI Interviewer
              </p>

              <p>
                {speaking
                  ? '🔊 Speaking...'
                  : listening
                  ? '👂 Listening...'
                  : '⏳ Waiting for answer'}
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div
            className="auth-error"
            style={{
              marginTop: 8,
            }}
          >
            {error}
          </div>
        )}
      </div>
    );
  }

  // ==========================================================
  // REPORT
  // ==========================================================

  if (
    step === 'feedback' &&
    feedback
  ) {
    const radarData = [
      {
        subject:
          'Communication',
        score:
          Number(
            feedback.communication
          ) || 0,
      },
      {
        subject:
          'Technical',
        score:
          Number(
            feedback.technicalKnowledge
          ) || 0,
      },
      {
        subject:
          'Problem Solving',
        score:
          Number(
            feedback.problemSolving
          ) || 0,
      },
      {
        subject:
          'Confidence',
        score:
          Number(
            feedback.confidence
          ) || 0,
      },
    ];

    const barData = [
      {
        name: 'Communication',
        score:
          Number(
            feedback.communication
          ) || 0,
      },
      {
        name: 'Technical',
        score:
          Number(
            feedback.technicalKnowledge
          ) || 0,
      },
      {
        name: 'Problem Solving',
        score:
          Number(
            feedback.problemSolving
          ) || 0,
      },
      {
        name: 'Confidence',
        score:
          Number(
            feedback.confidence
          ) || 0,
      },
    ];

    const overall =
      Number(
        feedback.overallScore
      ) || 0;

    const getGrade =
      (score) => {
        if (score >= 90)
          return 'A+';
        if (score >= 80)
          return 'A';
        if (score >= 70)
          return 'B';
        if (score >= 60)
          return 'C';
        return 'D';
      };

    const tabs = [
      {
        id: 'overview',
        label: 'Overview',
        icon: BarChart2,
      },
      {
        id: 'skills',
        label: 'Skill Analysis',
        icon: Target,
      },
      {
        id: 'questions',
        label: 'Q&A Review',
        icon: MessageSquare,
      },
      {
        id: 'improve',
        label: 'How to Improve',
        icon: Lightbulb,
      },
      {
        id: 'transcript',
        label: 'Transcript',
        icon: BookOpen,
      },
    ];

    return (
      <div className="page">
        <div className="page-header">
          <div>
            <h1 className="page-title">
              Interview Analysis
            </h1>

            <p className="page-subtitle">
              {interview?.jobRole}
              {' · '}
              {interview?.difficulty}
            </p>
          </div>

          <button
            className="btn-primary"
            onClick={reset}
          >
            + New Interview
          </button>
        </div>

        <div className="result-card">
          <div className="result-header">
            <div>
              <h2 className="result-title">
                Interview Performance Report
              </h2>

              <span>
                {interview?.jobRole}
              </span>
            </div>

            <div>
              {feedback.hireable
                ? '✅ Likely Hireable'
                : '❌ Needs More Preparation'}
            </div>
          </div>

          <div
            style={{
              display:
                'flex',
              justifyContent:
                'space-around',
              alignItems:
                'center',
              flexWrap:
                'wrap',
              gap: 20,
              padding: 20,
            }}
          >
            <div
              style={{
                textAlign:
                  'center',
              }}
            >
              <div
                style={{
                  fontSize:
                    '4rem',
                  fontWeight:
                    800,
                }}
              >
                {getGrade(
                  overall
                )}
              </div>

              <div>
                Grade
              </div>
            </div>

            <ScoreRing
              score={
                overall
              }
              label="Overall"
            />

            <ScoreRing
              score={
                feedback.communication
              }
              label="Communication"
            />

            <ScoreRing
              score={
                feedback.technicalKnowledge
              }
              label="Technical"
            />

            <ScoreRing
              score={
                feedback.problemSolving
              }
              label="Problem Solving"
            />

            <ScoreRing
              score={
                feedback.confidence
              }
              label="Confidence"
            />
          </div>

          <div
            style={{
              padding:
                '1rem 1.5rem',
            }}
          >
            <h3>
              Overall Assessment
            </h3>

            <p>
              {feedback.summary ||
                'No overall assessment available.'}
            </p>
          </div>

          <div
            style={{
              padding: 20,
            }}
          >
            <h3>
              Skill Radar
            </h3>

            <ResponsiveContainer
              width="100%"
              height={260}
            >
              <RadarChart
                data={
                  radarData
                }
              >
                <PolarGrid />

                <PolarAngleAxis
                  dataKey="subject"
                />

                <PolarRadiusAxis
                  domain={[
                    0,
                    100,
                  ]}
                />

                <Radar
                  dataKey="score"
                  stroke="#6366f1"
                  fill="#6366f1"
                  fillOpacity={
                    0.25
                  }
                />

                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div
            style={{
              display:
                'flex',
              borderBottom:
                '1px solid #1e293b',
              overflowX:
                'auto',
            }}
          >
            {tabs.map(
              ({
                id,
                label,
                icon: Icon,
              }) => (
                <button
                  key={id}
                  onClick={() =>
                    setActiveTab(
                      id
                    )
                  }
                  style={{
                    padding:
                      '0.8rem 1rem',
                    background:
                      'none',
                    border:
                      'none',
                    borderBottom:
                      `2px solid ${
                        activeTab ===
                        id
                          ? '#6366f1'
                          : 'transparent'
                      }`,
                    color:
                      activeTab ===
                      id
                        ? '#a5b4fc'
                        : '#64748b',
                    cursor:
                      'pointer',
                    whiteSpace:
                      'nowrap',
                  }}
                >
                  <Icon
                    size={14}
                  />{' '}
                  {label}
                </button>
              )
            )}
          </div>

          {/* OVERVIEW */}

          {activeTab ===
            'overview' && (
            <div
              style={{
                padding: 20,
              }}
            >
              <h3>
                Performance Overview
              </h3>

              <ResponsiveContainer
                width="100%"
                height={250}
              >
                <BarChart
                  data={
                    barData
                  }
                  layout="vertical"
                >
                  <CartesianGrid />

                  <XAxis
                    type="number"
                    domain={[
                      0,
                      100,
                    ]}
                  />

                  <YAxis
                    type="category"
                    dataKey="name"
                  />

                  <Tooltip />

                  <Bar
                    dataKey="score"
                    fill="#6366f1"
                  />
                </BarChart>
              </ResponsiveContainer>

              {feedback.strengths
                ?.length >
                0 && (
                <div>
                  <h3>
                    ✓ What You Did Well
                  </h3>

                  {feedback.strengths.map(
                    (
                      item,
                      i
                    ) => (
                      <div
                        key={i}
                        style={{
                          padding: 10,
                        }}
                      >
                        <CheckCircle
                          size={
                            14
                          }
                        />{' '}
                        {item}
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          )}

          {/* SKILLS */}

          {activeTab ===
            'skills' && (
            <div
              style={{
                padding: 20,
              }}
            >
              <h3>
                Detailed Skill Analysis
              </h3>

              {[
                {
                  label:
                    'Communication',
                  score:
                    feedback.communication,
                  feedback:
                    feedback.communicationFeedback,
                },
                {
                  label:
                    'Technical Knowledge',
                  score:
                    feedback.technicalKnowledge,
                  feedback:
                    feedback.technicalFeedback,
                },
                {
                  label:
                    'Problem Solving',
                  score:
                    feedback.problemSolving,
                  feedback:
                    feedback.problemSolvingFeedback,
                },
                {
                  label:
                    'Confidence',
                  score:
                    feedback.confidence,
                  feedback:
                    feedback.confidenceFeedback,
                },
              ].map(
                (item) => (
                  <div
                    key={
                      item.label
                    }
                    style={{
                      padding: 15,
                      marginBottom: 12,
                      background:
                        '#0a0f1a',
                      borderRadius: 10,
                    }}
                  >
                    <div
                      style={{
                        display:
                          'flex',
                        justifyContent:
                          'space-between',
                      }}
                    >
                      <strong>
                        {
                          item.label
                        }
                      </strong>

                      <strong>
                        {
                          item.score
                        }
                        /100
                      </strong>
                    </div>

                    <div
                      style={{
                        height: 6,
                        background:
                          '#1e293b',
                        marginTop: 8,
                        borderRadius: 10,
                      }}
                    >
                      <div
                        style={{
                          height:
                            '100%',
                          width: `${
                            item.score ||
                            0
                          }%`,
                          background:
                            '#6366f1',
                          borderRadius: 10,
                        }}
                      />
                    </div>

                    <p>
                      {item.feedback ||
                        'No detailed feedback available.'}
                    </p>
                  </div>
                )
              )}
            </div>
          )}

          {/* QUESTIONS */}

          {activeTab ===
            'questions' && (
            <div
              style={{
                padding: 20,
              }}
            >
              <h3>
                Q&A Review
              </h3>

              {feedback.questionAnalysis
                ?.length >
              0 ? (
                feedback.questionAnalysis.map(
                  (
                    qa,
                    i
                  ) => (
                    <div
                      key={
                        i
                      }
                      style={{
                        padding: 15,
                        marginBottom: 12,
                        borderRadius: 10,
                        background:
                          '#0a0f1a',
                      }}
                    >
                      <strong>
                        Q{i +
                          1}
                      </strong>

                      <p>
                        {
                          qa.question
                        }
                      </p>

                      <QualityBadge
                        quality={
                          qa.answerQuality
                        }
                      />

                      <span>
                        {' '}
                        Score:{' '}
                        {
                          qa.score
                        }
                      </span>

                      <p>
                        {
                          qa.feedback
                        }
                      </p>
                    </div>
                  )
                )
              ) : (
                <p
                  style={{
                    color:
                      '#94a3b8',
                  }}
                >
                  Q&A analysis not
                  available.
                </p>
              )}
            </div>
          )}

          {/* IMPROVEMENTS */}

          {activeTab ===
            'improve' && (
            <div>
              {feedback.improvements
                ?.length >
                0 && (
                <Section
                  title="Priority Improvements"
                  icon={
                    XCircle
                  }
                  defaultOpen
                >
                  {feedback.improvements.map(
                    (
                      item,
                      i
                    ) => (
                      <p
                        key={
                          i
                        }
                      >
                        {i +
                          1}
                        .{' '}
                        {
                          item
                        }
                      </p>
                    )
                  )}
                </Section>
              )}

              {feedback.nextSteps
                ?.length >
                0 && (
                <Section
                  title="Next Steps"
                  icon={
                    ArrowRight
                  }
                >
                  {feedback.nextSteps.map(
                    (
                      item,
                      i
                    ) => (
                      <p
                        key={
                          i
                        }
                      >
                        →{' '}
                        {
                          item
                        }
                      </p>
                    )
                  )}
                </Section>
              )}

              {feedback.recommendedResources
                ?.length >
                0 && (
                <Section
                  title="Recommended Resources"
                  icon={
                    BookOpen
                  }
                >
                  {feedback.recommendedResources.map(
                    (
                      item,
                      i
                    ) => (
                      <p
                        key={
                          i
                        }
                      >
                        📚{' '}
                        {
                          item
                        }
                      </p>
                    )
                  )}
                </Section>
              )}
            </div>
          )}

          {/* TRANSCRIPT */}

          {activeTab ===
            'transcript' && (
            <div
              style={{
                padding: 20,
              }}
            >
              <h3>
                Interview Transcript
              </h3>

              {messages.length >
              0 ? (
                messages.map(
                  (
                    message,
                    i
                  ) => (
                    <div
                      key={
                        i
                      }
                      style={{
                        padding: 12,
                        marginBottom: 8,
                        borderRadius: 10,
                        background:
                          message.role ===
                          'user'
                            ? 'rgba(99,102,241,.08)'
                            : 'rgba(255,255,255,.02)',
                      }}
                    >
                      <strong>
                        {message.role ===
                        'user'
                          ? '👤 You'
                          : '🤖 Interviewer'}
                      </strong>

                      <p>
                        {
                          message.content
                        }
                      </p>
                    </div>
                  )
                )
              ) : (
                <p>
                  No transcript available.
                </p>
              )}
            </div>
          )}

          <div
            style={{
              padding: 20,
            }}
          >
            <div className="format-feedback">
              <p className="format-label">
                💡 Interview Tip
              </p>

              <p className="format-text">
                Use the STAR method:
                Situation, Task,
                Action and Result.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default InterviewPage;
