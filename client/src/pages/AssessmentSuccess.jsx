import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../components/ui';

const AssessmentSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const stats = location.state?.stats || { answered: 0, total: 0 };
  const assessmentTitle = location.state?.title || 'Assessment';
  const confirmationId = Math.random().toString(36).substring(2, 10).toUpperCase();

  return (
    <div className="min-h-screen bg-surface-container flex flex-col relative overflow-hidden">
      {/* Decorative Blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-fixed-dim opacity-30 rounded-full blur-[100px] pointer-events-none mix-blend-multiply" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-tertiary-fixed-dim opacity-30 rounded-full blur-[100px] pointer-events-none mix-blend-multiply" />

      {/* Distraction-free Top Bar */}
      <header className="h-16 bg-surface-container-lowest border-b border-outline-variant flex items-center justify-between px-lg shrink-0 relative z-10">
        <div className="flex items-center gap-sm text-primary">
          <span className="material-symbols-outlined text-[28px]">token</span>
          <span className="font-headline-sm font-bold tracking-tight">AssessFlow</span>
        </div>
        <div className="flex items-center gap-sm">
          <span className="text-label-sm text-on-surface-variant hidden sm:inline">Candidate ID: {confirmationId}</span>
          <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-sm">
            ME
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-md sm:p-lg relative z-10">
        <div className="w-full max-w-2xl bg-surface-container-lowest border border-outline-variant rounded-xl p-xl md:p-16 text-center shadow-sm relative overflow-hidden">
          
          <div className="transform transition-all duration-500 scale-100">
            <div className="w-24 h-24 mx-auto bg-primary-container text-on-primary-container rounded-full flex items-center justify-center mb-lg relative">
               <span className="material-symbols-outlined text-[48px]">check_circle</span>
               {/* Small floating accents */}
               <div className="absolute -top-2 -right-2 w-4 h-4 bg-tertiary rounded-full animate-bounce delay-100" />
               <div className="absolute top-1/2 -left-4 w-3 h-3 bg-secondary rounded-full animate-pulse" />
               <div className="absolute -bottom-2 right-4 w-2 h-2 bg-primary rounded-full animate-ping" />
            </div>
            
            <h1 className="font-headline-xl text-headline-xl text-on-surface mb-sm">Assessment Submitted!</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant mb-xl max-w-md mx-auto">
              You have successfully completed <strong>{assessmentTitle}</strong>. Your responses have been securely recorded.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-md mb-xl text-left">
            <div className="bg-surface-container-low border border-outline-variant rounded-lg p-md">
              <div className="flex items-center gap-sm text-primary mb-sm">
                <span className="material-symbols-outlined text-[20px]">hourglass_empty</span>
                <h3 className="font-label-md font-bold text-on-surface">Review Status</h3>
              </div>
              <p className="font-body-md text-on-surface-variant">
                Your results are being processed. Depending on the assessment type, manual review may take up to 48 hours.
              </p>
            </div>
            
            <div className="bg-surface-container-low border border-outline-variant rounded-lg p-md">
              <div className="flex items-center gap-sm text-primary mb-sm">
                <span className="material-symbols-outlined text-[20px]">mail</span>
                <h3 className="font-label-md font-bold text-on-surface">Notification</h3>
              </div>
              <p className="font-body-md text-on-surface-variant">
                A confirmation email with Reference ID <strong>#{confirmationId}</strong> has been sent to your registered address.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-md">
            <Button variant="primary-emphasis" size="lg" icon="history" onClick={() => navigate('/dashboard')}>
              View My Activity
            </Button>
            <Button variant="secondary" size="lg" onClick={() => navigate('/launchpad')}>
              Back to Launch Pad
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-md text-center shrink-0 relative z-10 border-t border-outline-variant/50">
        <p className="flex items-center justify-center gap-xs text-label-sm text-on-surface-variant mb-xs">
          <span className="material-symbols-outlined text-[14px]">lock</span>
          Secure transmission via AssessFlow Launch Pad v1.2.0
        </p>
        <p className="text-[12px] text-outline">
          &copy; {new Date().getFullYear()} AssessFlow. All rights reserved. | <a href="#" className="hover:underline">Privacy</a> | <a href="#" className="hover:underline">Terms</a>
        </p>
      </footer>
    </div>
  );
};

export default AssessmentSuccess;
