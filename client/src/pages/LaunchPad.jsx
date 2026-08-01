import React, { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import { showToast } from '../components/ui/Toast';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  PageHeader, Button, Badge, ProgressBar, Modal, Card, EmptyState, CardSkeleton,
} from '../components/ui';

const LaunchPad = () => {
  const [assessments, setAssessments] = useState([]);
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    api.get('/assessment/launch-pad')
      .then(res => setAssessments(res.data))
      .catch(() => showToast.error('Failed to load data'))
      .finally(() => setLoading(false));
    if (location.state?.assessmentId) {
      handleLoad(location.state.assessmentId);
    }
  }, [location]);

  const handleLoad = async (id) => {
    if (!id) return;
    try {
      const { data } = await api.get(`/assessment/${id}`);
      setAssessment(data);
    } catch (error) {
      showToast.error('Failed to load assessment');
    }
  };

  const handleStart = () => {
    navigate(`/launch-pad/${assessment._id}/take`);
  };

  // State 1: Select Assessment
  if (!assessment) {
    return (
      <div className="max-w-container-max mx-auto pb-10">
        <PageHeader
          title="Launch Pad"
          subtitle="Select an assessment to begin."
          actions={
            <Link to="/builder" className="bg-primary text-on-primary px-xl py-sm rounded-lg font-label-md flex items-center gap-sm hover:shadow-md transition-all active:scale-95">
              <span className="material-symbols-outlined text-[18px]">add</span> Create New
            </Link>
          }
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-md">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)
          ) : assessments.length === 0 ? (
            <div className="col-span-full">
              <EmptyState
                icon="rocket_launch"
                title="No published assessments"
                subtitle="Publish an assessment from the Builder to make it available here."
                actionText="Go to Builder"
                actionIcon="construction"
                onAction={() => navigate('/builder')}
              />
            </div>
          ) : (
            assessments.map(a => {
              const hasSubmitted = a.hasSubmitted;
              return (
              <Card key={a._id} elevated onClick={() => !hasSubmitted && handleLoad(a._id)} className={`transition-all flex flex-col group ${hasSubmitted ? 'opacity-70 cursor-not-allowed' : 'hover:border-primary cursor-pointer'}`}>
                <div className="p-lg flex-1">
                  <div className="flex justify-between items-start mb-md">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${hasSubmitted ? 'bg-surface-container-high text-on-surface' : 'bg-primary-container text-on-primary-container'}`}>
                      <span className="material-symbols-outlined">assignment</span>
                    </div>
                    {hasSubmitted ? (
                      <Badge variant="success">Completed</Badge>
                    ) : (
                      <Badge variant="info">Published</Badge>
                    )}
                  </div>
                  <h3 className="font-headline-md text-on-surface mb-xs">{a.title}</h3>
                  <p className="font-body-md text-on-surface-variant line-clamp-2 mb-lg flex-1">{a.description || 'No description provided.'}</p>
                  {hasSubmitted ? (
                    <button disabled className="w-full py-sm bg-surface-container-highest text-on-surface-variant font-label-md rounded-lg flex items-center justify-center gap-xs cursor-not-allowed">
                      Already Submitted <span className="material-symbols-outlined text-[16px]">check_circle</span>
                    </button>
                  ) : (
                    <button className="w-full py-sm bg-surface-container-low text-primary font-label-md rounded-lg group-hover:bg-primary group-hover:text-on-primary transition-colors flex items-center justify-center gap-xs">
                      Launch <span className="material-symbols-outlined text-[16px]">rocket_launch</span>
                    </button>
                  )}
                </div>
              </Card>
            )})
          )}
        </div>
      </div>
    );
  }

  // State 2: Assessment Details (Ready to Start)
  return (
    <div className="max-w-container-max mx-auto pb-10">
        <PageHeader
          title={assessment.title}
          subtitle={assessment.description}
          titleSize="xl"
          breadcrumbs={[
            { label: 'Launch Pad', onClick: () => setAssessment(null) },
            { label: 'Ready to Start' },
          ]}
        />

        <div className="grid grid-cols-12 gap-lg">
          <div className="col-span-12 lg:col-span-8 space-y-lg">
            <Card elevated className="overflow-hidden">
              <ProgressBar value={100} max={100} color="primary" className="rounded-none" />
              <div className="p-xl">
                <div className="flex flex-wrap gap-xl mb-xl">
                  <div className="flex items-center gap-md">
                    <div className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined">quiz</span>
                    </div>
                    <div>
                      <p className="font-label-sm text-label-sm text-on-surface-variant uppercase">Questions</p>
                      <p className="font-headline-md text-headline-md">{assessment.categories.reduce((acc, c) => acc + c.factors.reduce((a, f) => a + f.questions.length, 0), 0)} Items</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-md">
                    <div className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined">category</span>
                    </div>
                    <div>
                      <p className="font-label-sm text-label-sm text-on-surface-variant uppercase">Categories</p>
                      <p className="font-headline-md text-headline-md">{assessment.categories.length} Sections</p>
                    </div>
                  </div>
                </div>

                <div className="border-l-4 border-l-primary bg-surface-container-low p-lg mb-xl">
                  <h3 className="font-headline-md text-headline-md mb-md flex items-center gap-sm">
                    <span className="material-symbols-outlined text-primary">info</span> Instructions
                  </h3>
                  <ul className="space-y-sm font-body-md text-body-md text-on-surface-variant">
                    <li className="flex items-start gap-sm">
                      <span className="material-symbols-outlined text-[18px] text-primary mt-1">check_circle</span>
                      Ensure you have a stable internet connection before starting.
                    </li>
                    <li className="flex items-start gap-sm">
                      <span className="material-symbols-outlined text-[18px] text-primary mt-1">check_circle</span>
                      Answer all required questions. You can navigate back and forth.
                    </li>
                  </ul>
                </div>

                <div className="flex items-center justify-between gap-lg pt-md border-t border-outline-variant">
                  <div className="text-sm text-on-surface-variant flex gap-2 items-center">
                    <span className="material-symbols-outlined">verified_user</span> Authenticated Session
                  </div>
                  <Button
                    variant="primary"
                    size="lg"
                    iconRight="play_arrow"
                    onClick={handleStart}
                  >
                    Start Assessment
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          <div className="col-span-12 lg:col-span-4 space-y-lg">
             <div className="bg-primary-container p-lg rounded-xl text-on-primary-container relative overflow-hidden group h-full flex flex-col justify-center">
                <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                    <div className="w-full h-full bg-[radial-gradient(circle_at_50%_50%,#fff_0%,transparent_70%)]"></div>
                </div>
                <span className="material-symbols-outlined text-[48px] mb-md opacity-50">support_agent</span>
                <h3 className="font-headline-md text-headline-md mb-sm">Technical Support</h3>
                <p className="font-body-md text-body-md opacity-90 mb-lg">Facing issues with the environment? Our team is live.</p>
                <button className="w-full bg-surface text-primary py-md rounded-lg font-label-md text-label-md hover:bg-opacity-90 transition-all shadow-md">
                    Open Live Chat
                </button>
             </div>
          </div>
        </div>
      </div>
    );
};

export default LaunchPad;
