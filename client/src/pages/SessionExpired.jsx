import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui';

const SessionExpired = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-lg">
      <div className="w-full max-w-md bg-surface border border-outline-variant rounded-xl shadow-sm p-xl text-center">
        <div className="w-20 h-20 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center mx-auto mb-lg">
          <span className="material-symbols-outlined text-[40px]">lock_clock</span>
        </div>
        <h1 className="font-headline-lg text-headline-lg text-on-surface mb-sm">Session Expired</h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant mb-xl">
          Your session has timed out for security reasons. Please log in again to continue where you left off.
        </p>
        <Link to="/login">
          <Button variant="primary" size="lg" icon="login" className="w-full">
            Log In Again
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default SessionExpired;
