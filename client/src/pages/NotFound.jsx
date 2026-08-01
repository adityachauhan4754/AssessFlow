import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui';

const NotFound = () => {
  const { user } = useAuth();
  const location = useLocation();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-lg">
      <h1 className="text-[120px] font-bold text-primary leading-none mb-sm">404</h1>
      <h2 className="font-headline-lg text-headline-lg text-on-surface mb-sm">Page not found</h2>
      <p className="font-body-lg text-body-lg text-on-surface-variant mb-xl max-w-md">
        The page <code className="bg-surface-container-high px-sm py-xs rounded text-primary text-label-md">{location.pathname}</code> doesn't exist or has been moved.
      </p>
      <Link to={user ? '/dashboard' : '/login'}>
        <Button variant="primary" icon="home">
          {user ? 'Back to Dashboard' : 'Go to Login'}
        </Button>
      </Link>
    </div>
  );
};

export default NotFound;
