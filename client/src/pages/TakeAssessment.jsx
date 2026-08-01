import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { showToast } from '../components/ui/Toast';
import { Button, ProgressBar, Modal } from '../components/ui';
import debounce from 'lodash.debounce';

const TakeAssessment = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [assessment, setAssessment] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(1800); // 30 mins
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeMobileTab, setActiveMobileTab] = useState('current');
  const [saveStatus, setSaveStatus] = useState(''); // 'saving', 'saved', 'error'

  useEffect(() => {
    loadAssessment();
  }, [id]);

  const loadAssessment = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/assessment/${id}/take`);
      setAssessment(data.assessment);
      if (data.response && data.response.answers) {
         const initialAnswers = {};
         data.response.answers.forEach(a => {
            initialAnswers[a.questionId] = a.value;
         });
         setAnswers(initialAnswers);
      }
    } catch (err) {
      if (err.response?.status === 409) {
         showToast.error('You have already submitted this assessment.');
         navigate('/launchpad');
      } else {
         showToast.error('Failed to load assessment');
      }
    } finally {
      setLoading(false);
    }
  };

  const flattenedQuestions = useMemo(() => {
    if (!assessment) return [];
    const qs = [];
    assessment.categories.forEach((c, cIdx) => {
      c.factors.forEach((f, fIdx) => {
        f.questions.forEach((q, qIdx) => {
          qs.push({ ...q, categoryName: c.name, factorName: f.name, originalIndex: qs.length });
        });
      });
    });
    return qs;
  }, [assessment]);

  const answeredCount = useMemo(() => {
    return flattenedQuestions.filter(q => answers[q._id] && answers[q._id].toString().trim() !== '').length;
  }, [flattenedQuestions, answers]);

  const unansweredCount = flattenedQuestions.length - answeredCount;

  // Auto-save logic
  const debouncedSave = useCallback(
    debounce(async (currentAnswers) => {
      setSaveStatus('saving');
      try {
        const formattedAnswers = Object.entries(currentAnswers).map(([questionId, value]) => ({ questionId, value }));
        await api.post(`/assessment/${id}/answers`, { answers: formattedAnswers });
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus(''), 2000);
      } catch (error) {
        setSaveStatus('error');
      }
    }, 1500),
    [id]
  );

  const handleAnswerChange = (questionId, value) => {
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);
    debouncedSave(newAnswers);
  };

  // Timer logic
  useEffect(() => {
    if (loading || submitting) return;
    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [loading, submitting]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleAutoSubmit = async () => {
     showToast.error("Time's up! Auto-submitting...");
     await handleSubmit();
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const formattedAnswers = Object.entries(answers).map(([questionId, value]) => ({ questionId, value }));
    try {
      await api.post(`/assessment/${id}/submit`, { answers: formattedAnswers });
      setShowSubmitModal(false);
      navigate('/launch-pad/submitted', { 
         state: { 
            title: assessment.title, 
            stats: { answered: answeredCount, total: flattenedQuestions.length } 
         }
      });
    } catch (err) {
      showToast.error(err.response?.data?.message || 'Failed to submit response');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    if (currentQIndex < flattenedQuestions.length - 1) setCurrentQIndex(currentQIndex + 1);
  };

  const handlePrev = () => {
    if (currentQIndex > 0) setCurrentQIndex(currentQIndex - 1);
  };

  if (loading || !assessment) {
    return <div className="min-h-screen flex items-center justify-center bg-surface">Loading...</div>;
  }

  const currentQ = flattenedQuestions[currentQIndex];
  const progressPercent = Math.round((answeredCount / flattenedQuestions.length) * 100);
  const isDangerTime = timeRemaining <= 300; // less than 5 mins

  return (
    <div className="flex flex-col h-screen bg-surface-container overflow-hidden">
      
      {/* Top Bar (Sticky) */}
      <header className="h-16 bg-surface-container-lowest border-b border-outline-variant flex items-center justify-between px-md md:px-lg shrink-0 z-40">
        <div className="flex items-center gap-sm md:gap-md">
          {/* Mobile hamburger */}
          <button 
             className="md:hidden p-xs rounded-lg hover:bg-surface-container text-on-surface"
             onClick={() => setSidebarOpen(true)}
          >
             <span className="material-symbols-outlined">menu</span>
          </button>
          
          <div className="flex items-center gap-sm text-primary">
            <span className="material-symbols-outlined text-[24px]">token</span>
            <span className="font-headline-sm font-bold tracking-tight hidden sm:block">AssessFlow</span>
          </div>
        </div>

        <div className="flex items-center gap-sm md:gap-lg">
          <div className={`flex items-center gap-xs px-sm py-xs rounded-full font-label-md font-bold transition-colors ${
             isDangerTime ? 'bg-error-container text-on-error-container animate-pulse' : 'bg-surface-container-high text-on-surface'
          }`}>
             <span className="material-symbols-outlined text-[18px]">timer</span>
             {formatTime(timeRemaining)}
          </div>
          
          <div className="hidden sm:flex items-center gap-sm">
             <button className="p-xs text-on-surface-variant hover:text-on-surface rounded-full hover:bg-surface-container">
               <span className="material-symbols-outlined">notifications</span>
             </button>
             <button className="p-xs text-on-surface-variant hover:text-on-surface rounded-full hover:bg-surface-container">
               <span className="material-symbols-outlined">settings</span>
             </button>
             <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-sm ml-sm">
               ME
             </div>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* Left Rail (Desktop: persistent, Mobile: drawer) */}
        <div className={`
           fixed md:static inset-y-0 left-0 z-50 md:z-auto
           w-72 md:w-64 bg-surface-container-lowest border-r border-outline-variant
           flex flex-col transform transition-transform duration-300 ease-in-out
           ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
           <div className="p-md border-b border-outline-variant flex justify-between items-center bg-surface-container-lowest sticky top-0 z-10">
              <h2 className="font-headline-sm font-bold text-on-surface">Progress</h2>
              <button className="md:hidden text-on-surface" onClick={() => setSidebarOpen(false)}>
                 <span className="material-symbols-outlined">close</span>
              </button>
           </div>
           
           <div className="p-md overflow-y-auto flex-1">
              <div className="mb-md">
                 <div className="flex justify-between font-label-sm text-on-surface-variant mb-xs">
                    <span>{progressPercent}% Completed</span>
                    <span>{answeredCount}/{flattenedQuestions.length}</span>
                 </div>
                 <ProgressBar value={progressPercent} max={100} color="primary" />
              </div>

              <div className="space-y-sm mt-lg">
                 {flattenedQuestions.map((q, idx) => {
                    const isAnswered = answers[q._id] && answers[q._id].toString().trim() !== '';
                    const isCurrent = idx === currentQIndex;
                    return (
                       <button
                          key={idx}
                          onClick={() => {
                             setCurrentQIndex(idx);
                             setSidebarOpen(false);
                          }}
                          className={`w-full text-left p-sm rounded-lg flex items-center justify-between transition-colors ${
                             isCurrent ? 'bg-primary-container text-on-primary-container font-bold' 
                             : isAnswered ? 'hover:bg-surface-container' 
                             : 'hover:bg-surface-container opacity-60'
                          }`}
                       >
                          <span className="truncate mr-2">Q{idx + 1}. {q.text}</span>
                          {isAnswered && <span className="material-symbols-outlined text-[16px] text-primary">check_circle</span>}
                       </button>
                    );
                 })}
              </div>
           </div>
        </div>

        {/* Mobile Overlay */}
        {sidebarOpen && (
           <div 
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setSidebarOpen(false)}
           />
        )}

        {/* Center Canvas */}
        <div className="flex-1 flex flex-col bg-surface-container overflow-y-auto relative">
           
           {/* Auto-save indicator */}
           <div className="absolute top-md right-md z-10 flex items-center gap-xs text-label-sm text-on-surface-variant">
              {saveStatus === 'saving' && <><span className="material-symbols-outlined text-[16px] animate-spin">sync</span> Saving...</>}
              {saveStatus === 'saved' && <><span className="material-symbols-outlined text-[16px] text-success">cloud_done</span> Saved to draft</>}
              {saveStatus === 'error' && <><span className="material-symbols-outlined text-[16px] text-error">cloud_off</span> Save failed</>}
           </div>

           <div className="flex-1 p-md md:p-xl max-w-3xl mx-auto w-full pb-32">
              <nav className="flex flex-wrap items-center gap-xs mb-lg text-on-surface-variant pt-lg md:pt-0">
                 <span className="font-label-md text-label-md">Category: {currentQ.categoryName}</span>
                 <span className="material-symbols-outlined text-sm">chevron_right</span>
                 <span className="font-label-md text-label-md font-bold text-on-surface">Factor: {currentQ.factorName}</span>
              </nav>

              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden relative">
                 {/* Top gradient strip */}
                 <div className="h-2 bg-gradient-to-r from-primary to-secondary w-full" />
                 
                 <div className="p-xl">
                    <div className="flex items-start gap-md mb-xl">
                       <div className="bg-primary-fixed text-primary px-3 py-1 rounded-lg font-bold font-label-md text-label-md whitespace-nowrap shrink-0">
                          Q{currentQIndex + 1}
                       </div>
                       <h2 className="font-headline-lg text-headline-lg text-on-surface leading-tight">
                          {currentQ.text}
                          {currentQ.isRequired && <span className="text-error ml-1" title="Required">*</span>}
                       </h2>
                    </div>

                    <div className={currentQ.images && currentQ.images.length > 0 ? "grid grid-cols-1 md:grid-cols-2 gap-xl" : ""}>
                      <div className="space-y-md">
                        {currentQ.type === 'Text' && (
                          <textarea 
                             className="w-full bg-surface border border-outline-variant rounded-lg p-md text-body-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-y min-h-[160px]"
                             placeholder="Type your answer here..."
                             value={answers[currentQ._id] || ''}
                             onChange={e => handleAnswerChange(currentQ._id, e.target.value)}
                          />
                        )}

                        {currentQ.type === 'Number' && (
                          <input 
                             type="number"
                             className="w-full max-w-sm bg-surface border border-outline-variant rounded-lg p-md text-body-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                             placeholder="Enter a number..."
                             value={answers[currentQ._id] || ''}
                             onChange={e => handleAnswerChange(currentQ._id, e.target.value)}
                          />
                        )}

                        {currentQ.type === 'MCQ' && (
                          <div className="space-y-sm">
                            {currentQ.options.map((opt, i) => {
                              const isSelected = answers[currentQ._id] === opt;
                              return (
                                <label key={i} className={`flex items-center p-md border rounded-lg cursor-pointer transition-all active:scale-[0.99] ${isSelected ? 'border-primary bg-primary-container/20 shadow-sm' : 'border-outline-variant hover:bg-surface-container-low hover:border-outline'}`}>
                                  <input 
                                    type="radio" 
                                    name={currentQ._id} 
                                    value={opt}
                                    checked={isSelected}
                                    onChange={e => handleAnswerChange(currentQ._id, e.target.value)}
                                    className="hidden"
                                  />
                                  <div className={`w-5 h-5 rounded-full border-2 mr-md flex-shrink-0 transition-colors ${isSelected ? 'border-primary bg-primary shadow-[inset_0_0_0_3px_#ffffff]' : 'border-outline-variant'}`}></div>
                                  <span className={`font-body-lg text-body-lg text-on-surface ${isSelected ? 'font-medium' : ''}`}>{opt}</span>
                                </label>
                              );
                            })}
                          </div>
                        )}

                        {currentQ.type === 'Rating' && (
                          <div className="flex flex-wrap gap-sm md:gap-md mt-md">
                            {[1,2,3,4,5].map(rating => {
                              const isSelected = answers[currentQ._id] === rating.toString();
                              return (
                                <label key={rating} className={`w-12 h-12 md:w-16 md:h-16 flex items-center justify-center rounded-xl border font-headline-sm md:font-headline-md cursor-pointer transition-all ${isSelected ? 'bg-primary border-primary text-on-primary shadow-md md:scale-110' : 'bg-surface border-outline-variant text-on-surface hover:border-primary hover:bg-surface-container'}`}>
                                  <input type="radio" name={currentQ._id} value={rating} className="hidden" checked={isSelected} onChange={e => handleAnswerChange(currentQ._id, e.target.value)} />
                                  {rating}
                                </label>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Visual Aid Panel */}
                      {currentQ.images && currentQ.images.length > 0 && (
                        <div className="bg-surface-container rounded-xl overflow-hidden border border-outline-variant flex items-center justify-center min-h-[200px]">
                          <img src={currentQ.images[0].url} alt={currentQ.images[0].alt || 'Question Image'} className="w-full h-auto max-h-[400px] object-contain" />
                        </div>
                      )}
                    </div>
                 </div>
              </div>
           </div>

           {/* Mobile Tab Bar */}
           <div className="md:hidden fixed bottom-16 w-full bg-surface-container-lowest border-t border-outline-variant flex justify-around p-xs z-30">
              <button className={`flex flex-col items-center p-xs ${activeMobileTab === 'current' ? 'text-primary' : 'text-on-surface-variant'}`} onClick={() => setActiveMobileTab('current')}>
                 <span className="material-symbols-outlined text-[20px]">assignment</span>
                 <span className="text-[10px] font-bold">Current</span>
              </button>
              <button className={`flex flex-col items-center p-xs ${activeMobileTab === 'overview' ? 'text-primary' : 'text-on-surface-variant'}`} onClick={() => setSidebarOpen(true)}>
                 <span className="material-symbols-outlined text-[20px]">list_alt</span>
                 <span className="text-[10px] font-bold">Overview</span>
              </button>
           </div>
        </div>

        {/* Right Rail (Desktop only) */}
        <div className="hidden lg:flex w-72 bg-surface-container-lowest border-l border-outline-variant flex-col shrink-0">
           <div className="p-xl border-b border-outline-variant">
              <div className="bg-primary-container p-lg rounded-xl text-on-primary-container relative overflow-hidden group">
                 <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                     <div className="w-full h-full bg-[radial-gradient(circle_at_50%_50%,#fff_0%,transparent_70%)]"></div>
                 </div>
                 <span className="material-symbols-outlined text-[32px] mb-sm opacity-50">support_agent</span>
                 <h3 className="font-headline-sm font-bold mb-xs">Need Help?</h3>
                 <p className="font-body-sm opacity-90 mb-md">Our proctors are online to assist you.</p>
                 <button className="w-full bg-surface text-primary py-sm rounded-lg font-label-md hover:bg-opacity-90 transition-all shadow-sm">
                     Live Chat
                 </button>
              </div>
           </div>
        </div>
      </div>

      {/* Persistent Bottom Action Bar */}
      <div className="h-16 fixed bottom-0 w-full bg-surface-container-lowest border-t border-outline-variant px-md md:px-xl flex items-center justify-between z-40">
        <Button
          variant="secondary"
          icon="arrow_back"
          onClick={handlePrev}
          disabled={currentQIndex === 0}
        >
          Previous
        </Button>
        
        <div className="flex items-center gap-md">
          {currentQIndex < flattenedQuestions.length - 1 ? (
            <Button
              variant="primary-emphasis"
              iconRight="arrow_forward"
              onClick={handleNext}
            >
              Next Question
            </Button>
          ) : (
            <Button
              variant="primary-emphasis"
              iconRight="check_circle"
              onClick={() => setShowSubmitModal(true)}
            >
              Submit Assessment
            </Button>
          )}
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      <Modal
        open={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        icon="assignment_turned_in"
        iconBg="bg-primary-container"
        iconColor="text-on-primary-container"
        title="Submit Assessment"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowSubmitModal(false)}>Cancel</Button>
            <Button variant="primary" icon="check_circle" loading={submitting} onClick={handleSubmit}>
              Confirm Submission
            </Button>
          </>
        }
      >
        <div className="space-y-md">
          <div className="flex justify-center gap-xl py-md">
            <div className="text-center">
              <p className="font-headline-lg text-headline-lg text-primary">{answeredCount}</p>
              <p className="text-label-sm font-label-sm text-on-surface-variant uppercase">Answered</p>
            </div>
            <div className="w-px bg-outline-variant" />
            <div className="text-center">
              <p className="font-headline-lg text-headline-lg text-on-surface">{flattenedQuestions.length}</p>
              <p className="text-label-sm font-label-sm text-on-surface-variant uppercase">Total</p>
            </div>
          </div>
          {unansweredCount > 0 && (
            <div className="bg-error-container border border-error rounded-lg p-md flex items-start gap-sm">
              <span className="material-symbols-outlined text-on-error-container text-[20px] shrink-0 mt-0.5">warning</span>
              <p className="text-on-error-container text-body-md">
                You have <strong>{unansweredCount} unanswered question{unansweredCount > 1 ? 's' : ''}</strong>. Are you sure you want to submit?
              </p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default TakeAssessment;
