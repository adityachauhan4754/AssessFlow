import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, Navigate } from 'react-router-dom';
import { FormField, Button } from '../components/ui';

const EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
const PASSWORD_REGEX = /^(?=.*[0-9]).{8,}$/;

export const Login = () => {
  const { login, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  if (user) return <Navigate to="/dashboard" replace />;

  const validate = () => {
    const newErrors = {};
    if (!email) newErrors.email = 'Email is required';
    else if (!EMAIL_REGEX.test(email)) newErrors.email = 'Invalid email format';
    
    if (!password) newErrors.password = 'Password is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setLoading(true);
    await login(email, password);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-lg">
      {/* Logo & Welcome */}
      <div className="text-center mb-xl">
        <div className="flex items-center justify-center gap-sm mb-md">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-on-primary">
            <span className="material-symbols-outlined">assessment</span>
          </div>
          <span className="font-headline-lg text-headline-lg font-bold text-primary">AssessFlow</span>
        </div>
        <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight">Welcome back</h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant mt-xs">Sign in to your account to continue</p>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md bg-surface border border-outline-variant rounded-xl shadow-sm p-xl">
        <form onSubmit={handleSubmit} noValidate>
          <FormField
            label="Email Address"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            error={errors.email}
            required
            icon="mail"
          />
          
          <FormField
            label="Password"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            error={errors.password}
            required
            icon="lock"
          />

          <div className="flex justify-end mb-lg">
            <Link to="/forgot-password" className="text-primary font-label-md text-label-md hover:underline">
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            className="w-full"
          >
            Log In
          </Button>
        </form>
      </div>

      {/* Footer link */}
      <p className="mt-lg font-body-md text-body-md text-on-surface-variant">
        New here?{' '}
        <Link to="/register" className="text-primary font-bold hover:underline">
          Create Account →
        </Link>
      </p>
    </div>
  );
};

export const Register = () => {
  const { register, user } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  if (user) return <Navigate to="/dashboard" replace />;

  const validate = () => {
    const newErrors = {};
    if (!name) newErrors.name = 'Name is required';
    
    if (!email) newErrors.email = 'Email is required';
    else if (!EMAIL_REGEX.test(email)) newErrors.email = 'Invalid email format';
    
    if (!password) newErrors.password = 'Password is required';
    else if (!PASSWORD_REGEX.test(password)) newErrors.password = 'Password must be at least 8 characters and contain a number';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setLoading(true);
    await register(name, email, password);
    setLoading(false);
  };

  // Password strength
  const getPasswordStrength = () => {
    if (!password) return { level: 0, label: '', color: '' };
    if (password.length < 6) return { level: 1, label: 'Weak', color: 'bg-error' };
    if (password.length < 8 || !/[0-9]/.test(password)) return { level: 2, label: 'Fair', color: 'bg-yellow-500' };
    if (password.length >= 8 && /[0-9]/.test(password) && /[A-Z]/.test(password)) return { level: 4, label: 'Strong', color: 'bg-green-500' };
    return { level: 3, label: 'Good', color: 'bg-primary' };
  };

  const strength = getPasswordStrength();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-lg">
      {/* Logo & Header */}
      <div className="text-center mb-xl">
        <div className="flex items-center justify-center gap-sm mb-md">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-on-primary">
            <span className="material-symbols-outlined">assessment</span>
          </div>
          <span className="font-headline-lg text-headline-lg font-bold text-primary">AssessFlow</span>
        </div>
        <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight">Create your account</h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant mt-xs">Start building and deploying assessments today</p>
      </div>

      {/* Register Card */}
      <div className="w-full max-w-md bg-surface border border-outline-variant rounded-xl shadow-sm p-xl">
        <form onSubmit={handleSubmit} noValidate>
          <FormField
            label="Full Name"
            name="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            error={errors.name}
            required
            icon="person"
          />

          <FormField
            label="Email Address"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            error={errors.email}
            required
            icon="mail"
          />
          
          <FormField
            label="Password"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create a strong password"
            error={errors.password}
            required
            icon="lock"
          />

          {/* Password Strength Indicator */}
          {password && (
            <div className="mb-md -mt-sm">
              <div className="flex gap-xs mb-xs">
                {[1,2,3,4].map(i => (
                  <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= strength.level ? strength.color : 'bg-surface-container-highest'}`} />
                ))}
              </div>
              <p className="text-[12px] text-on-surface-variant">{strength.label}</p>
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            className="w-full"
          >
            Create Account
          </Button>
        </form>
      </div>

      {/* Footer link */}
      <p className="mt-lg font-body-md text-body-md text-on-surface-variant">
        Already have an account?{' '}
        <Link to="/login" className="text-primary font-bold hover:underline">
          Log in →
        </Link>
      </p>
    </div>
  );
};
