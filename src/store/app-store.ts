import { create } from 'zustand';

export type ViewType = 'public' | 'login' | 'admin' | 'branch' | 'student';
export type AdminTab = 'dashboard' | 'students' | 'branches' | 'courses' | 'fees' | 'attendance' | 'results' | 'certificates' | 'notices' | 'admissions';
export type BranchTab = 'dashboard' | 'students' | 'fees' | 'attendance' | 'results' | 'certificates';
export type StudentTab = 'dashboard' | 'profile' | 'fees' | 'attendance' | 'results' | 'certificates';
export type PublicTab = 'home' | 'about' | 'courses' | 'admission' | 'gallery' | 'verify' | 'results' | 'contact';

interface User {
  id: string;
  name: string;
  email: string;
  loginType: 'admin' | 'branch' | 'student';
}

interface AppState {
  currentView: ViewType;
  publicTab: PublicTab;
  adminTab: AdminTab;
  branchTab: BranchTab;
  studentTab: StudentTab;
  user: User | null;
  sidebarOpen: boolean;
  
  setView: (view: ViewType) => void;
  setPublicTab: (tab: PublicTab) => void;
  setAdminTab: (tab: AdminTab) => void;
  setBranchTab: (tab: BranchTab) => void;
  setStudentTab: (tab: StudentTab) => void;
  setUser: (user: User | null) => void;
  setSidebarOpen: (open: boolean) => void;
  logout: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentView: 'public',
  publicTab: 'home',
  adminTab: 'dashboard',
  branchTab: 'dashboard',
  studentTab: 'dashboard',
  user: null,
  sidebarOpen: true,
  
  setView: (view) => set({ currentView: view }),
  setPublicTab: (tab) => set({ publicTab: tab }),
  setAdminTab: (tab) => set({ adminTab: tab }),
  setBranchTab: (tab) => set({ branchTab: tab }),
  setStudentTab: (tab) => set({ studentTab: tab }),
  setUser: (user) => set({ user }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  logout: () => {
    set({ user: null, currentView: 'public' });
    fetch('/api/auth/logout', { method: 'POST' });
  },
}));
