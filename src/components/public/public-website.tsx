'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore, type PublicTab } from '@/store/app-store';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
  Phone,
  MessageCircle,
  GraduationCap,
  Monitor,
  BookOpen,
  Calculator,
  Award,
  Code,
  Brain,
  Globe,
  Users,
  Briefcase,
  CheckCircle,
  Star,
  MapPin,
  Mail,
  Menu,
  X,
  ChevronRight,
  Laptop,
  Shield,
  Clock,
  Facebook,
  Instagram,
} from 'lucide-react';

/* ─── Course icon map ────────────────────────────────────── */
const courseIconMap: Record<string, React.ReactNode> = {
  ADCA: <Laptop className="h-8 w-8" />,
  DCA: <Monitor className="h-8 w-8" />,
  CCC: <BookOpen className="h-8 w-8" />,
  'Tally Prime': <Calculator className="h-8 w-8" />,
  'O Level': <GraduationCap className="h-8 w-8" />,
  Python: <Code className="h-8 w-8" />,
  'AI Course': <Brain className="h-8 w-8" />,
  'Web Development': <Globe className="h-8 w-8" />,
};

/* ─── Default courses (fallback) ──────────────────────────── */
const defaultCourses = [
  { id: '1', courseName: 'ADCA', duration: '12 Months', fees: 12000, description: 'Advanced Diploma in Computer Application', studentCount: 0 },
  { id: '2', courseName: 'DCA', duration: '6 Months', fees: 8000, description: 'Diploma in Computer Application', studentCount: 0 },
  { id: '3', courseName: 'CCC', duration: '3 Months', fees: 5000, description: 'Course on Computer Concepts', studentCount: 0 },
  { id: '4', courseName: 'Tally Prime', duration: '3 Months', fees: 6000, description: 'Tally Prime with GST', studentCount: 0 },
  { id: '5', courseName: 'O Level', duration: '12 Months', fees: 15000, description: 'DOEACC O Level Course', studentCount: 0 },
  { id: '6', courseName: 'Python', duration: '6 Months', fees: 10000, description: 'Python Programming Language', studentCount: 0 },
  { id: '7', courseName: 'AI Course', duration: '6 Months', fees: 15000, description: 'Artificial Intelligence Course', studentCount: 0 },
  { id: '8', courseName: 'Web Development', duration: '6 Months', fees: 12000, description: 'Full Stack Web Development', studentCount: 0 },
];

/* ─── Testimonials ────────────────────────────────────────── */
const testimonials = [
  {
    name: 'Rahul Kumar',
    course: 'ADCA',
    text: 'Nelson Computer Institute changed my career. The practical training and placement support helped me get a job within 2 months of completing my course.',
    rating: 5,
  },
  {
    name: 'Priya Sharma',
    course: 'Tally Prime',
    text: 'Excellent faculty and hands-on training. I got my government certificate and now working as an accountant. Highly recommended!',
    rating: 5,
  },
  {
    name: 'Amit Verma',
    course: 'Web Development',
    text: 'The web development course was comprehensive and up-to-date. The instructors were very supportive and the placement cell helped me land my first job.',
    rating: 4,
  },
];

/* ─── Nav links ───────────────────────────────────────────── */
const navLinks: { label: string; tab: PublicTab; section: string }[] = [
  { label: 'Home', tab: 'home', section: 'hero' },
  { label: 'About', tab: 'about', section: 'features' },
  { label: 'Courses', tab: 'courses', section: 'courses' },
  { label: 'Admission', tab: 'admission', section: 'admission' },
  { label: 'Gallery', tab: 'gallery', section: 'gallery' },
  { label: 'Verify Certificate', tab: 'verify', section: 'verify' },
  { label: 'Results', tab: 'results', section: 'results' },
  { label: 'Contact', tab: 'contact', section: 'contact' },
];

/* ─── Counter animation hook ──────────────────────────────── */
function useCountUp(target: number, duration = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const startTime = performance.now();
          const step = (now: number) => {
            const progress = Math.min((now - startTime) / duration, 1);
            setCount(Math.floor(progress * target));
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return { count, ref };
}

/* ─── Section wrapper with fade-in ────────────────────────── */
function Section({
  id,
  children,
  className = '',
  dark = false,
}: {
  id: string;
  children: React.ReactNode;
  className?: string;
  dark?: boolean;
}) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5 }}
      className={`${dark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'} ${className}`}
    >
      {children}
    </motion.section>
  );
}

/* ═══════════════════════════════════════════════════════════ */
/*  MAIN COMPONENT                                            */
/* ═══════════════════════════════════════════════════════════ */
export default function PublicWebsite() {
  const { publicTab, setPublicTab, setView } = useAppStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [courses, setCourses] = useState(defaultCourses);
  const [dashboardData, setDashboardData] = useState<{
    totalStudents: number;
    totalBranches: number;
    totalCourses: number;
  } | null>(null);

  // ─── Fetch courses & dashboard ──────────────────────────
  useEffect(() => {
    fetch('/api/courses')
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data?.length) {
          setCourses(
            res.data.map((c: Record<string, unknown>) => ({
              id: c.id as string,
              courseName: c.courseName as string,
              duration: c.duration as string,
              fees: c.fees as number,
              description: (c.description as string) || '',
              studentCount: (c.studentCount as number) || 0,
            }))
          );
        }
      })
      .catch(() => {});

    fetch('/api/dashboard')
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data) {
          setDashboardData({
            totalStudents: res.data.totalStudents,
            totalBranches: res.data.totalBranches,
            totalCourses: res.data.totalCourses,
          });
        }
      })
      .catch(() => {});
  }, []);

  // ─── Scroll to section on tab change ───────────────────
  useEffect(() => {
    const sectionMap: Record<string, string> = {
      home: 'hero',
      about: 'features',
      courses: 'courses',
      admission: 'admission',
      gallery: 'gallery',
      verify: 'verify',
      results: 'results',
      contact: 'footer',
    };
    const sectionId = sectionMap[publicTab] || 'hero';
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }, [publicTab]);

  // ─── Login handler ─────────────────────────────────────
  const handleLoginClick = useCallback(
    (loginType: 'admin' | 'branch' | 'student') => {
      setView('login');
    },
    [setView]
  );

  /* ─────────────────────────────────────────────────────── */
  /*  RENDER                                                */
  /* ─────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* ═══ HEADER / NAVBAR ═════════════════════════════ */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-18">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center gap-2">
              <GraduationCap className="h-7 w-7 text-amber-500" />
              <span className="text-lg md:text-xl font-bold text-white">
                NELSON<span className="text-amber-500"> COMPUTER</span> INSTITUTE
              </span>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <button
                  key={link.tab}
                  onClick={() => setPublicTab(link.tab)}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    publicTab === link.tab
                      ? 'text-amber-500 bg-slate-800'
                      : 'text-slate-300 hover:text-amber-400 hover:bg-slate-800'
                  }`}
                >
                  {link.label}
                </button>
              ))}
            </nav>

            {/* Right buttons - desktop */}
            <div className="hidden lg:flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                className="text-slate-300 hover:text-amber-400 text-xs"
                onClick={() => handleLoginClick('admin')}
              >
                Admin
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-slate-300 hover:text-amber-400 text-xs"
                onClick={() => handleLoginClick('branch')}
              >
                Branch
              </Button>
              <Button
                size="sm"
                className="bg-amber-500 hover:bg-amber-600 text-slate-900 text-xs font-semibold"
                onClick={() => handleLoginClick('student')}
              >
                Student Login
              </Button>
              <Separator orientation="vertical" className="h-6 bg-slate-700" />
              <a href="tel:8707599763" aria-label="Call us">
                <Phone className="h-5 w-5 text-amber-500 hover:text-amber-400 transition-colors" />
              </a>
              <a
                href="https://wa.me/918707599763"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
              >
                <MessageCircle className="h-5 w-5 text-emerald-500 hover:text-emerald-400 transition-colors" />
              </a>
            </div>

            {/* Mobile menu button */}
            <button
              className="lg:hidden text-white p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden bg-slate-800 overflow-hidden"
            >
              <div className="px-4 py-3 space-y-1">
                {navLinks.map((link) => (
                  <button
                    key={link.tab}
                    onClick={() => {
                      setPublicTab(link.tab);
                      setMobileMenuOpen(false);
                    }}
                    className={`block w-full text-left px-3 py-2 text-sm rounded-md ${
                      publicTab === link.tab
                        ? 'text-amber-500 bg-slate-700'
                        : 'text-slate-300 hover:text-amber-400 hover:bg-slate-700'
                    }`}
                  >
                    {link.label}
                  </button>
                ))}
                <Separator className="bg-slate-600 my-2" />
                <div className="flex flex-col gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-slate-600 text-slate-300 hover:text-amber-400"
                    onClick={() => {
                      handleLoginClick('admin');
                      setMobileMenuOpen(false);
                    }}
                  >
                    Admin Login
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-slate-600 text-slate-300 hover:text-amber-400"
                    onClick={() => {
                      handleLoginClick('branch');
                      setMobileMenuOpen(false);
                    }}
                  >
                    Branch Login
                  </Button>
                  <Button
                    size="sm"
                    className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold"
                    onClick={() => {
                      handleLoginClick('student');
                      setMobileMenuOpen(false);
                    }}
                  >
                    Student Login
                  </Button>
                </div>
                <div className="flex items-center gap-4 pt-2">
                  <a href="tel:8707599763" className="flex items-center gap-1 text-slate-300 text-sm">
                    <Phone className="h-4 w-4 text-amber-500" /> Call Us
                  </a>
                  <a
                    href="https://wa.me/918707599763"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-slate-300 text-sm"
                  >
                    <MessageCircle className="h-4 w-4 text-emerald-500" /> WhatsApp
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Spacer for fixed header */}
      <div className="h-16 md:h-18" />

      {/* ═══ HERO SECTION ═════════════════════════════════ */}
      <Section id="hero" className="relative overflow-hidden">
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 py-20 md:py-32 px-4">
          <div className="max-w-5xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge className="bg-amber-500 text-slate-900 text-sm font-bold px-4 py-1 mb-6 hover:bg-amber-500">
                ADMISSION OPEN 2025
              </Badge>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4 leading-tight"
            >
              Best Computer Coaching Institute
              <br />
              <span className="text-amber-500">with Govt Certificate</span>
              <br />
              &amp; 100% Placement Support
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-slate-300 text-base md:text-lg mb-8 max-w-2xl mx-auto"
            >
              Join Nelson Computer Institute and kickstart your career in IT with industry-relevant
              courses, expert faculty, and guaranteed placement assistance.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="flex flex-wrap justify-center gap-4"
            >
              <a href="https://wa.me/918707599763" target="_blank" rel="noopener noreferrer">
                <Button
                  size="lg"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-2"
                >
                  <MessageCircle className="h-5 w-5" /> WhatsApp
                </Button>
              </a>
              <a href="tel:8707599763">
                <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold gap-2">
                  <Phone className="h-5 w-5" /> Call Now
                </Button>
              </a>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-slate-900 font-semibold gap-2"
                onClick={() => setPublicTab('admission')}
              >
                <ChevronRight className="h-5 w-5" /> Apply Now
              </Button>
            </motion.div>
          </div>
        </div>
      </Section>

      {/* ═══ COURSES SECTION ══════════════════════════════ */}
      <Section id="courses" className="py-16 md:py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
              Our Popular <span className="text-amber-500">Courses</span>
            </h2>
            <p className="text-slate-600 max-w-xl mx-auto">
              Choose from a wide range of industry-recognized computer courses designed to boost your
              career prospects.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {courses.slice(0, 8).map((course, idx) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
              >
                <Card className="group hover:shadow-xl hover:scale-[1.03] transition-all duration-300 border-slate-200 bg-white h-full">
                  <CardHeader className="pb-3">
                    <div className="w-14 h-14 rounded-lg bg-slate-900 text-amber-500 flex items-center justify-center mb-3 group-hover:bg-amber-500 group-hover:text-slate-900 transition-colors">
                      {courseIconMap[course.courseName] || <GraduationCap className="h-8 w-8" />}
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">{course.courseName}</h3>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-slate-600 text-sm mb-3 line-clamp-2">
                      {course.description || 'Professional certification course with hands-on training'}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-slate-500 text-sm">
                        <Clock className="h-4 w-4" />
                        {course.duration}
                      </div>
                      <Badge className="bg-amber-500 text-slate-900 font-semibold hover:bg-amber-500">
                        ₹{course.fees.toLocaleString()}
                      </Badge>
                    </div>
                    <Button
                      className="w-full mt-4 bg-slate-900 hover:bg-slate-800 text-white"
                      size="sm"
                      onClick={() => setPublicTab('admission')}
                    >
                      Enroll Now <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ═══ FEATURES SECTION ═════════════════════════════ */}
      <Section id="features" className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
              Why Choose <span className="text-amber-500">Nelson?</span>
            </h2>
            <p className="text-slate-600 max-w-xl mx-auto">
              We provide the best learning experience with industry-standard facilities and expert
              guidance.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <Users className="h-8 w-8" />,
                title: 'Expert Faculty',
                desc: 'Learn from experienced professionals with years of industry expertise.',
              },
              {
                icon: <Monitor className="h-8 w-8" />,
                title: 'Practical Training',
                desc: 'Hands-on practice on latest software and tools in our modern labs.',
              },
              {
                icon: <Award className="h-8 w-8" />,
                title: 'Govt Certificate',
                desc: 'Get recognized government certification upon course completion.',
              },
              {
                icon: <Briefcase className="h-8 w-8" />,
                title: 'Placement Support',
                desc: '100% placement assistance with top companies across India.',
              },
            ].map((feature, idx) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
              >
                <Card className="text-center p-6 hover:shadow-lg transition-shadow border-slate-200 h-full">
                  <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{feature.title}</h3>
                  <p className="text-slate-600 text-sm">{feature.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ═══ COUNTER SECTION ══════════════════════════════ */}
      <Section id="counters" dark className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <CounterItem
              target={dashboardData?.totalStudents || 5000}
              suffix="+"
              label="Students Trained"
              icon={<Users className="h-8 w-8" />}
            />
            <CounterItem
              target={dashboardData?.totalCourses || 15}
              suffix="+"
              label="Courses Offered"
              icon={<BookOpen className="h-8 w-8" />}
            />
            <CounterItem
              target={dashboardData?.totalBranches || 10}
              suffix="+"
              label="Branches"
              icon={<MapPin className="h-8 w-8" />}
            />
            <CounterItem target={450} suffix="+" label="Placements" icon={<Briefcase className="h-8 w-8" />} />
          </div>
        </div>
      </Section>

      {/* ═══ TESTIMONIAL SECTION ══════════════════════════ */}
      <Section id="testimonials" className="py-16 md:py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
              What Our <span className="text-amber-500">Students Say</span>
            </h2>
            <p className="text-slate-600 max-w-xl mx-auto">
              Hear from our alumni who have successfully built their careers with Nelson Computer
              Institute.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, idx) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
              >
                <Card className="p-6 hover:shadow-lg transition-shadow border-slate-200 h-full">
                  <div className="flex gap-1 mb-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < t.rating ? 'text-amber-500 fill-amber-500' : 'text-slate-300'}`}
                      />
                    ))}
                  </div>
                  <p className="text-slate-600 text-sm mb-4 italic">&ldquo;{t.text}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-900 text-amber-500 flex items-center justify-center font-bold text-sm">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">{t.name}</p>
                      <p className="text-slate-500 text-xs">{t.course} Student</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ═══ ADMISSION FORM SECTION ═══════════════════════ */}
      <Section id="admission" className="py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
              Online <span className="text-amber-500">Admission Form</span>
            </h2>
            <p className="text-slate-600">
              Fill in the form below to apply for admission. We will contact you shortly.
            </p>
          </div>
          <AdmissionForm courses={courses} />
        </div>
      </Section>

      {/* ═══ CERTIFICATE VERIFICATION SECTION ═════════════ */}
      <Section id="verify" className="py-16 md:py-24 bg-slate-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <Shield className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
              Verify <span className="text-amber-500">Certificate</span>
            </h2>
            <p className="text-slate-600">Enter your certificate number to verify its authenticity.</p>
          </div>
          <CertificateVerify />
        </div>
      </Section>

      {/* ═══ GALLERY PLACEHOLDER ══════════════════════════ */}
      <Section id="gallery" className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
            Our <span className="text-amber-500">Gallery</span>
          </h2>
          <p className="text-slate-600 mb-8">Moments from our institute and events.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square bg-slate-200 rounded-lg flex items-center justify-center text-slate-400"
              >
                <Laptop className="h-8 w-8" />
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ═══ RESULTS PLACEHOLDER ══════════════════════════ */}
      <Section id="results" className="py-16 md:py-24 bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Award className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
            Exam <span className="text-amber-500">Results</span>
          </h2>
          <p className="text-slate-600 mb-8">
            Students can check their exam results by logging into their student portal.
          </p>
          <Button
            className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold"
            size="lg"
            onClick={() => setView('login')}
          >
            <Laptop className="h-5 w-5 mr-2" /> Student Login to Check Results
          </Button>
        </div>
      </Section>

      {/* ═══ CONTACT SECTION (in footer) ══════════════════ */}

      {/* ═══ FOOTER ══════════════════════════════════════ */}
      <footer id="footer" className="bg-slate-900 text-slate-300 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Institute Info */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <GraduationCap className="h-6 w-6 text-amber-500" />
                <span className="text-lg font-bold text-white">
                  NELSON<span className="text-amber-500"> COMPUTER</span>
                </span>
              </div>
              <p className="text-sm text-slate-400 mb-4">
                Nelson Computer Institute is a leading computer coaching center providing quality
                education with government certifications and placement support since 2010.
              </p>
              <div className="flex gap-3">
                <a
                  href="https://wa.me/918707599763"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-slate-800 hover:bg-emerald-600 flex items-center justify-center transition-colors"
                  aria-label="WhatsApp"
                >
                  <MessageCircle className="h-4 w-4" />
                </a>
                <a
                  href="#"
                  className="w-9 h-9 rounded-full bg-slate-800 hover:bg-blue-600 flex items-center justify-center transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook className="h-4 w-4" />
                </a>
                <a
                  href="#"
                  className="w-9 h-9 rounded-full bg-slate-800 hover:bg-pink-600 flex items-center justify-center transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="h-4 w-4" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                {navLinks.map((link) => (
                  <li key={link.tab}>
                    <button
                      onClick={() => setPublicTab(link.tab)}
                      className="text-sm text-slate-400 hover:text-amber-500 transition-colors"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Courses */}
            <div>
              <h4 className="text-white font-semibold mb-4">Popular Courses</h4>
              <ul className="space-y-2">
                {courses.slice(0, 6).map((c) => (
                  <li key={c.id}>
                    <button
                      onClick={() => setPublicTab('courses')}
                      className="text-sm text-slate-400 hover:text-amber-500 transition-colors"
                    >
                      {c.courseName}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-white font-semibold mb-4">Contact Us</h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <span className="text-slate-400">Nelson Computer Institute, Main Road, India</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-amber-500 shrink-0" />
                  <a href="tel:8707599763" className="text-slate-400 hover:text-amber-500">
                    8707599763
                  </a>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-amber-500 shrink-0" />
                  <a href="tel:9792121300" className="text-slate-400 hover:text-amber-500">
                    9792121300
                  </a>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-amber-500 shrink-0" />
                  <a href="mailto:info@nelsoninstitute.com" className="text-slate-400 hover:text-amber-500">
                    info@nelsoninstitute.com
                  </a>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <MessageCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                  <a
                    href="https://wa.me/918707599763"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-emerald-500"
                  >
                    WhatsApp Us
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <Separator className="bg-slate-700 my-8" />

          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500">
              &copy; {new Date().getFullYear()} Nelson Computer Institute. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-sm text-slate-500">
              <button onClick={() => setPublicTab('home')} className="hover:text-amber-500 transition-colors">
                Home
              </button>
              <button onClick={() => setPublicTab('admission')} className="hover:text-amber-500 transition-colors">
                Admission
              </button>
              <button onClick={() => setPublicTab('contact')} className="hover:text-amber-500 transition-colors">
                Contact
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* ═══ FLOATING WHATSAPP BUTTON ═════════════════════ */}
      <a
        href="https://wa.me/918707599763"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-110"
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle className="h-7 w-7" />
      </a>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════ */
/*  COUNTER ITEM                                              */
/* ═══════════════════════════════════════════════════════════ */
function CounterItem({
  target,
  suffix,
  label,
  icon,
}: {
  target: number;
  suffix: string;
  label: string;
  icon: React.ReactNode;
}) {
  const { count, ref } = useCountUp(target);
  return (
    <div ref={ref} className="text-center">
      <div className="text-amber-500 flex justify-center mb-3">{icon}</div>
      <p className="text-3xl md:text-4xl font-extrabold text-white">
        {count.toLocaleString()}
        {suffix}
      </p>
      <p className="text-slate-400 text-sm mt-1">{label}</p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════ */
/*  ADMISSION FORM                                            */
/* ═══════════════════════════════════════════════════════════ */
function AdmissionForm({
  courses,
}: {
  courses: { id: string; courseName: string; duration: string; fees: number }[];
}) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    studentName: '',
    fatherName: '',
    mobile: '',
    email: '',
    course: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.studentName || !form.fatherName || !form.mobile || !form.course) {
      toast.error('Please fill all required fields');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/admission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Admission form submitted successfully! We will contact you soon.');
        setForm({ studentName: '', fatherName: '', mobile: '', email: '', course: '', message: '' });
      } else {
        toast.error(data.message || 'Submission failed');
      }
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 md:p-8 border-slate-200 shadow-lg">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label htmlFor="studentName">
              Full Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="studentName"
              placeholder="Enter your full name"
              value={form.studentName}
              onChange={(e) => setForm({ ...form, studentName: e.target.value })}
              className="border-slate-300"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fatherName">
              Father Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="fatherName"
              placeholder="Enter father's name"
              value={form.fatherName}
              onChange={(e) => setForm({ ...form, fatherName: e.target.value })}
              className="border-slate-300"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mobile">
              Mobile Number <span className="text-red-500">*</span>
            </Label>
            <Input
              id="mobile"
              type="tel"
              placeholder="Enter mobile number"
              value={form.mobile}
              onChange={(e) => setForm({ ...form, mobile: e.target.value })}
              className="border-slate-300"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter email address"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="border-slate-300"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>
            Select Course <span className="text-red-500">*</span>
          </Label>
          <Select value={form.course} onValueChange={(val) => setForm({ ...form, course: val })}>
            <SelectTrigger className="border-slate-300">
              <SelectValue placeholder="Choose a course" />
            </SelectTrigger>
            <SelectContent>
              {courses.map((c) => (
                <SelectItem key={c.id} value={c.courseName}>
                  {c.courseName} ({c.duration}) - ₹{c.fees.toLocaleString()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="message">Message</Label>
          <textarea
            id="message"
            rows={3}
            placeholder="Any message or query..."
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            className="flex w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
        </div>
        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold text-base py-3"
        >
          {loading ? 'Submitting...' : 'Submit Application'}
          {!loading && <CheckCircle className="h-5 w-5 ml-2" />}
        </Button>
      </form>
    </Card>
  );
}

/* ═══════════════════════════════════════════════════════════ */
/*  CERTIFICATE VERIFY                                        */
/* ═══════════════════════════════════════════════════════════ */
function CertificateVerify() {
  const [certNo, setCertNo] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [notFound, setNotFound] = useState(false);

  const handleVerify = async () => {
    if (!certNo.trim()) {
      toast.error('Please enter a certificate number');
      return;
    }
    setLoading(true);
    setResult(null);
    setNotFound(false);
    try {
      const res = await fetch(`/api/verify-certificate?certNo=${encodeURIComponent(certNo.trim())}`);
      const data = await res.json();
      if (data.success && data.data) {
        setResult(data.data as Record<string, unknown>);
      } else {
        setNotFound(true);
      }
    } catch {
      toast.error('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 md:p-8 border-slate-200 shadow-lg">
      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          placeholder="Enter Certificate Number (e.g. NCI-2025-00001)"
          value={certNo}
          onChange={(e) => setCertNo(e.target.value)}
          className="border-slate-300 flex-1"
          onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
        />
        <Button
          onClick={handleVerify}
          disabled={loading}
          className="bg-slate-900 hover:bg-slate-800 text-white font-semibold"
        >
          {loading ? 'Verifying...' : 'Verify'}
        </Button>
      </div>

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg"
        >
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="h-5 w-5 text-emerald-600" />
            <span className="font-semibold text-emerald-800">Certificate Verified Successfully!</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            <p>
              <span className="text-slate-500">Certificate No:</span>{' '}
              <span className="font-medium text-slate-900">{String(result.certificateNo)}</span>
            </p>
            <p>
              <span className="text-slate-500">Issued Date:</span>{' '}
              <span className="font-medium text-slate-900">
                {result.issuedDate ? new Date(String(result.issuedDate)).toLocaleDateString() : 'N/A'}
              </span>
            </p>
            {(result.student as Record<string, string>) && (
              <>
                <p>
                  <span className="text-slate-500">Student Name:</span>{' '}
                  <span className="font-medium text-slate-900">
                    {(result.student as Record<string, string>).name}
                  </span>
                </p>
                <p>
                  <span className="text-slate-500">Course:</span>{' '}
                  <span className="font-medium text-slate-900">
                    {(result.student as Record<string, string>).courseName}
                  </span>
                </p>
              </>
            )}
          </div>
        </motion.div>
      )}

      {notFound && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg"
        >
          <p className="text-red-700 font-medium">Certificate not found. Please check the number and try again.</p>
        </motion.div>
      )}
    </Card>
  );
}
