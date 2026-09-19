'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/store/app-store';
import PublicWebsite from '@/components/public/public-website';
import LoginPage from '@/components/public/login-page';
import AdminPanel from '@/components/admin/admin-panel';
import BranchPanel from '@/components/branch/branch-panel';
import StudentPanel from '@/components/student/student-panel';
import { Toaster } from '@/components/ui/sonner';

export default function Home() {
  const { currentView, setUser, setView } = useAppStore();

  // Check session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.user) {
            setUser(data.user);
            if (data.user.loginType === 'admin') setView('admin');
            else if (data.user.loginType === 'branch') setView('branch');
            else if (data.user.loginType === 'student') setView('student');
          }
        }
      } catch {
        // No valid session, stay on public
      }
    };
    checkSession();
  }, [setUser, setView]);

  return (
    <>
      <Toaster position="top-right" richColors />
      {currentView === 'public' && <PublicWebsite />}
      {currentView === 'login' && <LoginPage />}
      {currentView === 'admin' && <AdminPanel />}
      {currentView === 'branch' && <BranchPanel />}
      {currentView === 'student' && <StudentPanel />}
    </>
  );
}
