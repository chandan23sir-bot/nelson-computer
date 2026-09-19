'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '@/store/app-store';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { toast } from 'sonner';
import { Laptop, Lock, Mail, Phone, ArrowLeft, GraduationCap, ShieldCheck, UserPlus } from 'lucide-react';

type LoginType = 'admin' | 'branch' | 'student';
type StudentMode = 'login' | 'register';

type Course = { id: string; courseName: string; duration: string };

export default function LoginPage() {
  const { setUser, setView } = useAppStore();
  const [activeTab, setActiveTab] = useState<LoginType>('student');
  const [studentMode, setStudentMode] = useState<StudentMode>('login');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [studentName, setStudentName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [mobile, setMobile] = useState('');
  const [courseId, setCourseId] = useState('');
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    if (activeTab !== 'student') return;
    fetch('/api/courses').then(r => r.json()).then(d => {
      if (d.success) setCourses(d.data || []);
    }).catch(() => undefined);
  }, [activeTab]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setInterval(() => setCooldown(v => Math.max(0, v - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [cooldown]);

  const applyUser = (user: { id: string; name: string; email?: string; loginType: LoginType }) => {
    setUser({ id: user.id, name: user.name, email: user.email || '', loginType: user.loginType });
    setView(user.loginType === 'admin' ? 'admin' : user.loginType === 'branch' ? 'branch' : 'student');
  };

  const adminOrBranchLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Please enter email and password.');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, loginType: activeTab }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Invalid credentials');
      applyUser(data.user);
      toast.success(`Welcome back, ${data.user.name}!`);
    } catch (error) { toast.error(error instanceof Error ? error.message : 'Login failed.'); }
    finally { setLoading(false); }
  };

  const sendStudentOtp = async () => {
    if (cooldown > 0) return;
    if (!email) return toast.error('Please enter your email address.');
    if (studentMode === 'register' && (!studentName || !fatherName || !mobile)) {
      return toast.error('Please fill name, father name and mobile number.');
    }
    setLoading(true);
    try {
      const action = studentMode === 'register' ? 'register-start' : 'login-start';
      const res = await fetch('/api/auth/otp', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, email, studentName, fatherName, mobile, courseId }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Could not send OTP');
      setOtpSent(true); setOtp(''); setCooldown(60);
      toast.success('OTP sent. Check your email.');
    } catch (error) { toast.error(error instanceof Error ? error.message : 'Could not send OTP.'); }
    finally { setLoading(false); }
  };

  const verifyStudentOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) return toast.error('Enter the 6-digit OTP.');
    setLoading(true);
    try {
      const action = studentMode === 'register' ? 'register-verify' : 'login-verify';
      const res = await fetch('/api/auth/otp', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, email, otp }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'OTP verification failed');
      applyUser(data.user);
      toast.success(studentMode === 'register' ? 'Account created successfully!' : `Welcome back, ${data.user.name}!`);
    } catch (error) { toast.error(error instanceof Error ? error.message : 'OTP verification failed.'); }
    finally { setLoading(false); }
  };

  const resetStudent = (mode: StudentMode) => {
    setStudentMode(mode); setOtpSent(false); setOtp(''); setCooldown(0);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 px-4 py-8">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="w-full max-w-lg mb-6">
        <button onClick={() => setView('public')} className="flex items-center gap-2 text-slate-400 hover:text-amber-400 transition-colors text-sm">
          <ArrowLeft className="h-4 w-4" /> Back to Website
        </button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg">
        <Card className="bg-white/95 backdrop-blur shadow-2xl border-slate-200 overflow-hidden">
          <CardHeader className="bg-slate-950 text-white text-center pb-7 pt-8">
            <div className="flex justify-center mb-3"><div className="w-16 h-16 rounded-2xl bg-amber-500 flex items-center justify-center shadow-lg"><GraduationCap className="h-9 w-9 text-slate-950" /></div></div>
            <h1 className="text-xl font-bold">NELSON <span className="text-amber-500">COMPUTER</span> INSTITUTE</h1>
            <p className="text-slate-400 text-sm mt-1">Secure portal access</p>
          </CardHeader>

          <CardContent className="p-6 sm:p-8">
            <div className="grid grid-cols-3 rounded-xl bg-slate-100 p-1 mb-6">
              {(['admin', 'branch', 'student'] as LoginType[]).map(tab => (
                <button key={tab} onClick={() => { setActiveTab(tab); setOtpSent(false); setPassword(''); }} className={`rounded-lg py-2.5 text-sm font-semibold capitalize transition ${activeTab === tab ? (tab === 'student' ? 'bg-amber-500 text-slate-950 shadow' : 'bg-slate-950 text-white shadow') : 'text-slate-500 hover:text-slate-900'}`}>
                  {tab}
                </button>
              ))}
            </div>

            {activeTab !== 'student' ? (
              <form onSubmit={adminOrBranchLogin} className="space-y-5">
                <div className="flex items-center gap-2 text-slate-600 text-sm"><Laptop className="h-4 w-4 text-amber-500" /> {activeTab === 'admin' ? 'Admin Portal Access' : 'Branch Portal Access'}</div>
                <div className="space-y-2"><Label>Email Address</Label><div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" /><Input type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} className="pl-10" /></div></div>
                <div className="space-y-2"><Label>Password</Label><div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" /><Input type="password" placeholder="Enter password" value={password} onChange={e => setPassword(e.target.value)} className="pl-10" /></div></div>
                <Button disabled={loading} className="w-full bg-slate-950 hover:bg-slate-800 text-white">{loading ? 'Signing in...' : `${activeTab === 'admin' ? 'Admin' : 'Branch'} Login`}</Button>
              </form>
            ) : (
              <div>
                <div className="flex rounded-xl bg-slate-100 p-1 mb-5">
                  <button onClick={() => resetStudent('login')} className={`flex-1 py-2.5 rounded-lg text-sm font-semibold ${studentMode === 'login' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}>Login with OTP</button>
                  <button onClick={() => resetStudent('register')} className={`flex-1 py-2.5 rounded-lg text-sm font-semibold ${studentMode === 'register' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}><UserPlus className="inline h-4 w-4 mr-1" />Register</button>
                </div>

                {studentMode === 'register' && !otpSent && <div className="space-y-4 mb-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Student Name</Label><Input placeholder="Full name" value={studentName} onChange={e => setStudentName(e.target.value)} /></div>
                    <div className="space-y-2"><Label>Father's Name</Label><Input placeholder="Father's name" value={fatherName} onChange={e => setFatherName(e.target.value)} /></div>
                  </div>
                  <div className="space-y-2"><Label>Mobile Number</Label><div className="relative"><Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" /><Input inputMode="numeric" placeholder="10-digit mobile number" value={mobile} onChange={e => setMobile(e.target.value)} className="pl-10" /></div></div>
                  <div className="space-y-2"><Label>Course</Label><Select value={courseId} onValueChange={setCourseId}><SelectTrigger><SelectValue placeholder="Select your course (optional)" /></SelectTrigger><SelectContent>{courses.map(c => <SelectItem key={c.id} value={c.id}>{c.courseName} — {c.duration}</SelectItem>)}</SelectContent></Select></div>
                </div>}

                <form onSubmit={otpSent ? verifyStudentOtp : (e) => { e.preventDefault(); void sendStudentOtp(); }} className="space-y-4">
                  <div className="space-y-2"><Label>Email Address</Label><div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" /><Input type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} disabled={otpSent} className="pl-10" /></div></div>
                  {otpSent && <div className="rounded-xl bg-amber-50 border border-amber-200 p-4"><div className="flex items-center gap-2 text-amber-900 font-semibold text-sm mb-3"><ShieldCheck className="h-4 w-4" /> Enter the 6-digit OTP</div><InputOTP maxLength={6} value={otp} onChange={setOtp}><InputOTPGroup className="w-full justify-center"><InputOTPSlot index={0} /><InputOTPSlot index={1} /><InputOTPSlot index={2} /><InputOTPSlot index={3} /><InputOTPSlot index={4} /><InputOTPSlot index={5} /></InputOTPGroup></InputOTP></div>}
                  <Button disabled={loading} className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold">{loading ? 'Please wait...' : otpSent ? 'Verify OTP & Continue' : studentMode === 'register' ? 'Send Registration OTP' : 'Send Login OTP'}</Button>
                </form>
                {otpSent && <div className="flex justify-between mt-4 text-xs"><button disabled={cooldown > 0 || loading} onClick={() => void sendStudentOtp()} className="text-amber-600 font-semibold disabled:text-slate-400">{cooldown > 0 ? `Resend OTP in ${cooldown}s` : 'Resend OTP'}</button><button onClick={() => setOtpSent(false)} className="text-slate-500 hover:text-slate-900">Change email</button></div>}
                <p className="text-xs text-slate-400 text-center mt-5">Only a verified registered email can be used for student login.</p>
              </div>
            )}

            <div className="mt-6 text-center text-xs text-slate-400">Having trouble? <a href="https://wa.me/918707599763" target="_blank" rel="noopener noreferrer" className="text-amber-500 underline">Contact Support</a></div>
          </CardContent>
        </Card>
        <p className="text-center text-slate-500 text-xs mt-6">© {new Date().getFullYear()} Nelson Computer Institute. All rights reserved.</p>
      </motion.div>
    </div>
  );
}
