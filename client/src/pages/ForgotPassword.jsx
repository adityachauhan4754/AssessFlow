import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FormField, Button } from '../components/ui';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    setError('');
    setLoading(true);
    // Stub — no backend endpoint yet
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-lg">
      {/* Logo */}
      <div className="text-center mb-xl">
        <div className="flex items-center justify-center gap-sm mb-md">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-on-primary">
            <span className="material-symbols-outlined">assessment</span>
          </div>
          <span className="font-headline-lg text-headline-lg font-bold text-primary">AssessFlow</span>
        </div>
      </div>

      <div className="w-full max-w-md bg-surface border border-outline-variant rounded-xl shadow-sm p-xl">
        {sent ? (
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center mx-auto mb-lg">
              <span className="material-symbols-outlined text-[32px]">mark_email_read</span>
            </div>
            <h2 className="font-headline-md text-headline-md text-on-surface mb-sm">Check your email</h2>
            <p className="text-body-md text-on-surface-variant mb-xl">
              We've sent a password reset link to <strong className="text-on-surface">{email}</strong>. Check your inbox and follow the instructions.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-sm text-primary font-label-md hover:underline"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              Back to Log In
            </Link>
          </div>
        ) : (
          <>
            <div className="text-center mb-xl">
              <div className="w-16 h-16 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center mx-auto mb-lg">
                <span className="material-symbols-outlined text-[32px]">lock_reset</span>
              </div>
              <h2 className="font-headline-md text-headline-md text-on-surface mb-xs">Forgot your password?</h2>
              <p className="text-body-md text-on-surface-variant">
                Enter your email address and we'll send you a link to reset your password.
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              <FormField
                label="Email Address"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                error={error}
                required
                icon="mail"
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                className="w-full mb-md"
              >
                Send Reset Link
              </Button>

              <div className="text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-xs text-on-surface-variant font-label-md hover:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                  Back to Log In
                </Link>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
