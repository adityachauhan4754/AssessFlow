import React, { useState, useRef, useEffect } from 'react';
import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Avatar from '../components/ui/Avatar';

export const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [project, setProject] = useState(null);
  const mobileProfileRef = useRef(null);
  const desktopProfileRef = useRef(null);

  // Close profile menu on outside click
  useEffect(() => {
    const handleClick = (e) => {
      const isOutsideMobile = mobileProfileRef.current && !mobileProfileRef.current.contains(e.target);
      const isOutsideDesktop = desktopProfileRef.current && !desktopProfileRef.current.contains(e.target);
      
      if (isOutsideMobile && isOutsideDesktop) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Fetch project for the context card
  useEffect(() => {
    if (user) {
      api.get('/projects/current/settings')
        .then(res => setProject(res.data))
        .catch(err => console.error("Failed to fetch project context", err));
    }
  }, [user]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Global nav items
  const globalNav = [
    { to: '/builder', label: 'Builder', icon: 'construction' },
    { to: '/dashboard', label: 'Assessments', icon: 'assignment' },
    { to: '/launchpad', label: 'Launch Pad', icon: 'rocket_launch' },
    { to: '/reports', label: 'Reports', icon: 'monitoring' },
  ];

  // Project settings nav
  const projectNav = [
    { to: '/dashboard', label: 'Overview', icon: 'dashboard' },
    { to: '/project/history', label: 'History', icon: 'history' },
    { to: '/project/settings', label: 'Settings', icon: 'settings' },
  ];

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const SidebarContent = ({ profileRef }) => (
    <div className="flex flex-col h-full overflow-y-auto custom-scrollbar">
      {/* Brand Header */}
      <div className="flex flex-col items-center justify-center py-lg px-md border-b border-outline-variant shrink-0 gap-sm">
        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-on-primary shadow-sm">
          <span className="material-symbols-outlined text-[24px]">assessment</span>
        </div>
        <span className="font-headline-lg text-headline-lg font-bold text-primary tracking-tight">AssessFlow</span>
      </div>

      {/* Global Nav Group */}
      <div className="px-md pt-lg pb-sm">
        <p className="font-label-sm text-label-sm text-outline uppercase tracking-wider px-md mb-sm">Global</p>
        <nav className="space-y-xs">
          {globalNav.map((item) => {
            const active = isActive(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-md px-md py-sm rounded-lg transition-all active:scale-95 duration-150 ${
                  active
                    ? 'bg-primary-container text-on-primary-container font-bold shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                <span className="font-label-md text-label-md">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>


      <div className="px-md pb-sm">
        <p className="font-label-sm text-label-sm text-outline uppercase tracking-wider px-md mb-sm">Project Settings</p>
        <nav className="space-y-xs">
          {projectNav.map((item, idx) => {
            const active = item.label === 'Overview' 
              ? location.pathname === '/dashboard'
              : location.pathname === item.to;
            return (
              <Link
                key={idx}
                to={item.to}
                className={`flex items-center gap-md px-md py-sm rounded-lg transition-all active:scale-95 duration-150 ${
                  active
                    ? 'bg-secondary-fixed text-on-secondary-fixed font-bold'
                    : 'text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                <span className="font-label-md text-label-md">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* New Category Button */}
      <div className="px-md py-sm">
        <Link
          to="/builder"
          className="w-full flex items-center justify-center gap-sm px-md py-sm bg-primary text-on-primary rounded-lg font-label-md text-label-md hover:shadow-md active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          New Category
        </Link>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Footer */}
      <div className="border-t border-outline-variant px-md py-md space-y-sm shrink-0">
        <button className="w-full flex items-center gap-md px-md py-sm text-on-surface-variant hover:bg-surface-container-high transition-all rounded-lg">
          <span className="material-symbols-outlined text-[20px]">help</span>
          <span className="font-label-md text-label-md">Help Center</span>
        </button>

        {/* User Profile Card */}
        <div className="relative" ref={profileRef}>
          <button
            className="w-full flex items-center gap-md px-md py-sm hover:bg-surface-container-high rounded-lg transition-all"
            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
          >
            <Avatar name={user?.name || 'User'} size="sm" />
            <div className="flex-1 text-left min-w-0">
              <p className="font-label-md text-label-md text-on-surface truncate">{user?.name || 'User'}</p>
              <p className="text-[11px] text-outline truncate">{user?.email || 'Admin'}</p>
            </div>
            <span className="material-symbols-outlined text-[20px] text-on-surface-variant shrink-0">notifications</span>
          </button>

          {/* Profile Dropdown Menu */}
          {profileMenuOpen && (
            <div className="absolute bottom-full left-0 right-0 mb-sm bg-surface border border-outline-variant rounded-xl shadow-lg overflow-hidden animate-scaleIn z-50">
              <div className="p-md border-b border-outline-variant">
                <div className="flex items-center gap-sm">
                  <Avatar name={user?.name || 'User'} size="md" />
                  <div className="min-w-0">
                    <p className="font-label-md text-on-surface font-bold truncate">{user?.name}</p>
                    <p className="text-[12px] text-outline truncate">{user?.email}</p>
                  </div>
                </div>
              </div>
              <nav className="py-xs">
                <button className="w-full flex items-center gap-md px-lg py-sm text-on-surface-variant hover:bg-surface-container-high transition-colors text-left">
                  <span className="material-symbols-outlined text-[20px]">person</span>
                  <span className="font-label-md text-label-md">Profile Settings</span>
                </button>
                <button className="w-full flex items-center gap-md px-lg py-sm text-on-surface-variant hover:bg-surface-container-high transition-colors text-left">
                  <span className="material-symbols-outlined text-[20px]">notifications</span>
                  <span className="font-label-md text-label-md">Notifications</span>
                </button>
                <button className="w-full flex items-center gap-md px-lg py-sm text-on-surface-variant hover:bg-surface-container-high transition-colors text-left">
                  <span className="material-symbols-outlined text-[20px]">help</span>
                  <span className="font-label-md text-label-md">Help Center</span>
                </button>
                <div className="border-t border-outline-variant my-xs" />
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-md px-lg py-sm text-error hover:bg-error-container transition-colors text-left"
                >
                  <span className="material-symbols-outlined text-[20px]">logout</span>
                  <span className="font-label-md text-label-md">Log Out</span>
                </button>
              </nav>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-background text-on-surface min-h-screen font-['Inter']">
      {/* Mobile Menu Toggle */}
      <button
        onClick={() => setMobileMenuOpen(true)}
        className="md:hidden fixed top-md left-md z-50 p-sm bg-surface border border-outline-variant rounded-lg shadow-sm text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center"
      >
        <span className="material-symbols-outlined">menu</span>
      </button>

      {/* Mobile Sidebar Overlay */}
      <div
        className={`fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-[70] md:hidden transition-opacity duration-300 ${
          mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMobileMenuOpen(false)}
      >
        <div
          className={`absolute top-0 left-0 h-full w-72 bg-surface border-r border-outline-variant shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <SidebarContent profileRef={mobileProfileRef} />
        </div>
      </div>

      <div className="flex min-h-screen">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-72 bg-surface border-r border-outline-variant h-screen sticky top-0 shrink-0">
          <SidebarContent profileRef={desktopProfileRef} />
        </aside>

        {/* Main Content Canvas */}
        <main className="flex-1 bg-background overflow-x-hidden overflow-y-auto custom-scrollbar">
          <div className="p-md pt-20 md:p-lg md:pt-lg">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
