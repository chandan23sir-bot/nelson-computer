'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAppStore, type AdminTab } from '@/store/app-store';
import { toast } from 'sonner';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';

// Icons
import {
  LayoutDashboard,
  Users,
  Building,
  BookOpen,
  IndianRupee,
  Calendar,
  FileText,
  Award,
  Bell,
  ClipboardList,
  Menu,
  Search,
  LogOut,
  Plus,
  Pencil,
  Trash2,
  UserPlus,
  UserCheck,
  AlertCircle,
} from 'lucide-react';

// Charts
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

// ─── Types ───────────────────────────────────────────────────────────────────

interface DashboardData {
  totalStudents: number;
  totalBranches: number;
  totalCourses: number;
  totalFeesCollected: number;
  pendingFees: number;
  monthlyAdmissions: { month: string; count: number }[];
  coursePopularity: { courseName: string; studentCount: number }[];
  recentAdmissions: {
    id: string;
    studentName: string;
    fatherName: string;
    mobile: string;
    courseName: string;
    admissionDate: string;
    status: string;
  }[];
}

interface StudentData {
  id: string;
  studentName: string;
  fatherName: string;
  mobile: string;
  email: string | null;
  courseId: string | null;
  branchId: string | null;
  course: { id: string; courseName: string } | null;
  branch: { id: string; branchName: string } | null;
  status: string;
  admissionDate: string;
  createdAt: string;
}

interface BranchData {
  id: string;
  branchName: string;
  ownerName: string;
  email: string;
  address: string | null;
  mobile: string | null;
  status: string;
  studentCount: number;
  createdAt: string;
}

interface CourseData {
  id: string;
  courseName: string;
  duration: string;
  fees: number;
  description: string | null;
  category: string | null;
  studentCount: number;
  createdAt: string;
}

interface FeeData {
  id: string;
  studentId: string;
  student: { id: string; studentName: string; fatherName: string; mobile: string };
  amount: number;
  paymentDate: string;
  status: string;
  receiptNo: string | null;
  month: string | null;
  createdAt: string;
}

interface AttendanceData {
  id: string;
  studentId: string;
  student: { id: string; studentName: string; fatherName: string; mobile: string };
  date: string;
  status: string;
  createdAt: string;
}

interface ResultData {
  id: string;
  studentId: string;
  student: { id: string; studentName: string; fatherName: string; mobile: string };
  exam: { id: string; examName: string; examDate: string; totalMarks: number | null } | null;
  marks: string;
  grade: string;
  createdAt: string;
}

interface CertificateData {
  id: string;
  studentId: string;
  student: { id: string; studentName: string; fatherName: string; mobile: string };
  certificateNo: string;
  issuedDate: string;
  createdAt: string;
}

interface NoticeData {
  id: string;
  title: string;
  content: string;
  isActive: boolean;
  createdAt: string;
}

interface AdmissionData {
  id: string;
  studentName: string;
  fatherName: string;
  mobile: string;
  email: string | null;
  course: string;
  message: string | null;
  status: string;
  createdAt: string;
}

// ─── Chart Colors ────────────────────────────────────────────────────────────

const PIE_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899', '#14b8a6'];

// ─── Sidebar Navigation Config ───────────────────────────────────────────────

const navItems: { tab: AdminTab; label: string; icon: React.ElementType }[] = [
  { tab: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { tab: 'students', label: 'Students', icon: Users },
  { tab: 'branches', label: 'Branches', icon: Building },
  { tab: 'courses', label: 'Courses', icon: BookOpen },
  { tab: 'fees', label: 'Fees', icon: IndianRupee },
  { tab: 'attendance', label: 'Attendance', icon: Calendar },
  { tab: 'results', label: 'Results', icon: FileText },
  { tab: 'certificates', label: 'Certificates', icon: Award },
  { tab: 'notices', label: 'Notices', icon: Bell },
  { tab: 'admissions', label: 'Admissions', icon: ClipboardList },
];

// ─── Sidebar Content Component ───────────────────────────────────────────────

function SidebarContent({ activeTab, onNavClick, onLogout }: {
  activeTab: AdminTab;
  onNavClick: (tab: AdminTab) => void;
  onLogout: () => void;
}) {
  return (
    <div className="flex h-full flex-col bg-slate-900 text-white">
      {/* Institute Name */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-700">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500 font-bold text-slate-900 text-lg">
          N
        </div>
        <div>
          <h1 className="text-lg font-bold">Nelson</h1>
          <p className="text-xs text-slate-400">Computer Coaching</p>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.tab;
            return (
              <button
                key={item.tab}
                onClick={() => onNavClick(item.tab)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-amber-500 text-slate-900 font-bold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Logout */}
      <div className="border-t border-slate-700 px-3 py-4">
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function AdminPanel() {
  const { adminTab, setAdminTab, user, logout } = useAppStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleNavClick = (tab: AdminTab) => {
    setAdminTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:shrink-0 lg:flex-col border-r border-slate-700">
        <SidebarContent activeTab={adminTab} onNavClick={handleNavClick} onLogout={logout} />
      </aside>

      {/* Mobile Sidebar Sheet */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-64 p-0 bg-slate-900 border-slate-700">
          <SidebarContent activeTab={adminTab} onNavClick={handleNavClick} onLogout={logout} />
        </SheetContent>
      </Sheet>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        <header className="flex h-16 shrink-0 items-center gap-4 border-b bg-white px-4 lg:px-6">
          {/* Mobile Hamburger */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
          </Sheet>

          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex items-center gap-3 ml-auto">
            {/* Notification */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                3
              </span>
            </Button>

            <Separator orientation="vertical" className="h-8" />

            {/* User Info */}
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 font-bold text-slate-900 text-sm">
                {user?.name?.charAt(0)?.toUpperCase() || 'A'}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium">{user?.name || 'Admin'}</p>
                <p className="text-xs text-muted-foreground">{user?.email || 'admin@nelson.com'}</p>
              </div>
            </div>

            <Button variant="ghost" size="icon" onClick={logout} title="Logout">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-slate-50 p-4 lg:p-6">
          {adminTab === 'dashboard' && <DashboardTab />}
          {adminTab === 'students' && <StudentsTab searchQuery={searchQuery} />}
          {adminTab === 'branches' && <BranchesTab />}
          {adminTab === 'courses' && <CoursesTab />}
          {adminTab === 'fees' && <FeesTab />}
          {adminTab === 'attendance' && <AttendanceTab />}
          {adminTab === 'results' && <ResultsTab />}
          {adminTab === 'certificates' && <CertificatesTab />}
          {adminTab === 'notices' && <NoticesTab />}
          {adminTab === 'admissions' && <AdmissionsTab />}
        </main>
      </div>
    </div>
  );
}

// ─── Dashboard Tab ───────────────────────────────────────────────────────────

function DashboardTab() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard')
      .then((res) => res.json())
      .then((res) => {
        if (res.success) setData(res.data);
      })
      .catch(() => toast.error('Failed to load dashboard data'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
      </div>
    );
  }

  if (!data) return <p className="text-center text-muted-foreground py-12">Failed to load dashboard data</p>;

  const stats = [
    { title: 'Total Students', value: data.totalStudents, icon: Users, color: 'bg-emerald-500' },
    { title: 'Active Students', value: data.totalStudents, icon: UserCheck, color: 'bg-blue-500' },
    { title: 'Total Branches', value: data.totalBranches, icon: Building, color: 'bg-purple-500' },
    { title: 'Monthly Income', value: `₹${data.totalFeesCollected.toLocaleString()}`, icon: IndianRupee, color: 'bg-amber-500' },
    { title: 'Pending Fees', value: data.pendingFees, icon: AlertCircle, color: 'bg-red-500' },
    { title: 'New Admissions', value: data.recentAdmissions.length, icon: UserPlus, color: 'bg-teal-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${stat.color} text-white`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Admissions Bar Chart */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Monthly Admissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.monthlyAdmissions}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" fontSize={12} />
                  <YAxis allowDecimals={false} fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Course Popularity Pie Chart */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Course Popularity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.coursePopularity}
                    dataKey="studentCount"
                    nameKey="courseName"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={({ courseName, studentCount }) => `${courseName}: ${studentCount}`}
                  >
                    {data.coursePopularity.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Admissions */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Recent Admissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-h-96 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Father Name</TableHead>
                  <TableHead>Mobile</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.recentAdmissions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No recent admissions
                    </TableCell>
                  </TableRow>
                ) : (
                  data.recentAdmissions.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.studentName}</TableCell>
                      <TableCell>{s.fatherName}</TableCell>
                      <TableCell>{s.mobile}</TableCell>
                      <TableCell>{s.courseName}</TableCell>
                      <TableCell>{new Date(s.admissionDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant={s.status === 'active' ? 'default' : 'secondary'}>
                          {s.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Students Tab ────────────────────────────────────────────────────────────

function StudentsTab({ searchQuery }: { searchQuery: string }) {
  const [students, setStudents] = useState<StudentData[]>([]);
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [branches, setBranches] = useState<BranchData[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentData | null>(null);
  const [form, setForm] = useState({
    studentName: '',
    fatherName: '',
    mobile: '',
    email: '',
    courseId: '',
    branchId: '',
    password: '',
  });

  const fetchData = useCallback(async () => {
    try {
      const [studentsRes, coursesRes, branchesRes] = await Promise.all([
        fetch('/api/students'),
        fetch('/api/courses'),
        fetch('/api/branches'),
      ]);
      const studentsJson = await studentsRes.json();
      const coursesJson = await coursesRes.json();
      const branchesJson = await branchesRes.json();

      if (studentsJson.success) setStudents(studentsJson.data);
      if (coursesJson.success) setCourses(coursesJson.data);
      if (branchesJson.success) setBranches(branchesJson.data);
    } catch {
      toast.error('Failed to load students data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const resetForm = () => {
    setForm({ studentName: '', fatherName: '', mobile: '', email: '', courseId: '', branchId: '', password: '' });
    setEditingStudent(null);
  };

  const openEditDialog = (student: StudentData) => {
    setEditingStudent(student);
    setForm({
      studentName: student.studentName,
      fatherName: student.fatherName,
      mobile: student.mobile,
      email: student.email || '',
      courseId: student.courseId || '',
      branchId: student.branchId || '',
      password: '',
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.studentName || !form.fatherName || !form.mobile) {
      toast.error('Student name, father name, and mobile are required');
      return;
    }

    try {
      if (editingStudent) {
        const res = await fetch(`/api/students/${editingStudent.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentName: form.studentName,
            fatherName: form.fatherName,
            mobile: form.mobile,
            email: form.email || null,
            courseId: form.courseId || null,
            branchId: form.branchId || null,
            ...(form.password ? { password: form.password } : {}),
          }),
        });
        const json = await res.json();
        if (json.success) {
          toast.success('Student updated successfully');
          setDialogOpen(false);
          resetForm();
          fetchData();
        } else {
          toast.error(json.message || 'Failed to update student');
        }
      } else {
        const res = await fetch('/api/students', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentName: form.studentName,
            fatherName: form.fatherName,
            mobile: form.mobile,
            email: form.email || undefined,
            courseId: form.courseId || undefined,
            branchId: form.branchId || undefined,
            password: form.password || undefined,
          }),
        });
        const json = await res.json();
        if (json.success) {
          toast.success('Student added successfully' + (json.generatedPassword ? ` | Password: ${json.generatedPassword}` : ''));
          setDialogOpen(false);
          resetForm();
          fetchData();
        } else {
          toast.error(json.message || 'Failed to add student');
        }
      }
    } catch {
      toast.error('Something went wrong');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this student?')) return;
    try {
      const res = await fetch(`/api/students/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        toast.success('Student deleted successfully');
        fetchData();
      } else {
        toast.error(json.message || 'Failed to delete student');
      }
    } catch {
      toast.error('Something went wrong');
    }
  };

  const filteredStudents = students.filter((s) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.studentName.toLowerCase().includes(q) ||
      s.mobile.toLowerCase().includes(q) ||
      (s.email && s.email.toLowerCase().includes(q)) ||
      (s.course?.courseName?.toLowerCase().includes(q))
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Students</h2>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="bg-amber-500 hover:bg-amber-600 text-slate-900">
              <Plus className="h-4 w-4 mr-2" />
              Add Student
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingStudent ? 'Edit Student' : 'Add Student'}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="studentName">Student Name *</Label>
                <Input id="studentName" value={form.studentName} onChange={(e) => setForm({ ...form, studentName: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="fatherName">Father Name *</Label>
                <Input id="fatherName" value={form.fatherName} onChange={(e) => setForm({ ...form, fatherName: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="mobile">Mobile *</Label>
                <Input id="mobile" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="courseId">Course</Label>
                <Select value={form.courseId} onValueChange={(value) => setForm({ ...form, courseId: value })}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.courseName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="branchId">Branch</Label>
                <Select value={form.branchId} onValueChange={(value) => setForm({ ...form, branchId: value })}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((b) => (
                      <SelectItem key={b.id} value={b.id}>{b.branchName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password {editingStudent ? '(leave blank to keep current)' : ''}</Label>
                <Input id="password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }}>Cancel</Button>
              <Button className="bg-amber-500 hover:bg-amber-600 text-slate-900" onClick={handleSubmit}>
                {editingStudent ? 'Update' : 'Add'} Student
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-0">
          <div className="max-h-96 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Mobile</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No students found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStudents.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.studentName}</TableCell>
                      <TableCell>{s.mobile}</TableCell>
                      <TableCell>{s.course?.courseName || 'N/A'}</TableCell>
                      <TableCell>{s.branch?.branchName || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge variant={s.status === 'active' ? 'default' : 'secondary'}>
                          {s.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(s)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(s.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Branches Tab ────────────────────────────────────────────────────────────

function BranchesTab() {
  const [branches, setBranches] = useState<BranchData[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    branchName: '',
    ownerName: '',
    email: '',
    password: '',
    address: '',
    mobile: '',
  });

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/branches');
      const json = await res.json();
      if (json.success) setBranches(json.data);
    } catch {
      toast.error('Failed to load branches');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const resetForm = () => {
    setForm({ branchName: '', ownerName: '', email: '', password: '', address: '', mobile: '' });
  };

  const handleSubmit = async () => {
    if (!form.branchName || !form.ownerName || !form.email || !form.password) {
      toast.error('Branch name, owner name, email, and password are required');
      return;
    }
    try {
      const res = await fetch('/api/branches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (json.success) {
        toast.success('Branch added successfully');
        setDialogOpen(false);
        resetForm();
        fetchData();
      } else {
        toast.error(json.message || 'Failed to add branch');
      }
    } catch {
      toast.error('Something went wrong');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Branches</h2>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="bg-amber-500 hover:bg-amber-600 text-slate-900">
              <Plus className="h-4 w-4 mr-2" />
              Add Branch
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Branch</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="branchName">Branch Name *</Label>
                <Input id="branchName" value={form.branchName} onChange={(e) => setForm({ ...form, branchName: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="ownerName">Owner Name *</Label>
                <Input id="ownerName" value={form.ownerName} onChange={(e) => setForm({ ...form, ownerName: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email *</Label>
                <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password *</Label>
                <Input id="password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="mobile">Mobile</Label>
                <Input id="mobile" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }}>Cancel</Button>
              <Button className="bg-amber-500 hover:bg-amber-600 text-slate-900" onClick={handleSubmit}>Add Branch</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-0">
          <div className="max-h-96 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Branch Name</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Mobile</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {branches.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No branches found
                    </TableCell>
                  </TableRow>
                ) : (
                  branches.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell className="font-medium">{b.branchName}</TableCell>
                      <TableCell>{b.ownerName}</TableCell>
                      <TableCell>{b.email}</TableCell>
                      <TableCell>{b.mobile || 'N/A'}</TableCell>
                      <TableCell>{b.studentCount}</TableCell>
                      <TableCell>
                        <Badge variant={b.status === 'active' ? 'default' : 'secondary'}>
                          {b.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Courses Tab ─────────────────────────────────────────────────────────────

function CoursesTab() {
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    courseName: '',
    duration: '',
    fees: '',
    description: '',
    category: '',
  });

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/courses');
      const json = await res.json();
      if (json.success) setCourses(json.data);
    } catch {
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const resetForm = () => {
    setForm({ courseName: '', duration: '', fees: '', description: '', category: '' });
  };

  const handleSubmit = async () => {
    if (!form.courseName || !form.duration || !form.fees) {
      toast.error('Course name, duration, and fees are required');
      return;
    }
    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseName: form.courseName,
          duration: form.duration,
          fees: parseFloat(form.fees),
          description: form.description || undefined,
          category: form.category || undefined,
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success('Course added successfully');
        setDialogOpen(false);
        resetForm();
        fetchData();
      } else {
        toast.error(json.message || 'Failed to add course');
      }
    } catch {
      toast.error('Something went wrong');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Courses</h2>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="bg-amber-500 hover:bg-amber-600 text-slate-900">
              <Plus className="h-4 w-4 mr-2" />
              Add Course
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Course</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="courseName">Course Name *</Label>
                <Input id="courseName" value={form.courseName} onChange={(e) => setForm({ ...form, courseName: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="duration">Duration *</Label>
                <Input id="duration" placeholder="e.g., 6 Months" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="fees">Fees (₹) *</Label>
                <Input id="fees" type="number" value={form.fees} onChange={(e) => setForm({ ...form, fees: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Input id="category" placeholder="e.g., Programming, Design" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }}>Cancel</Button>
              <Button className="bg-amber-500 hover:bg-amber-600 text-slate-900" onClick={handleSubmit}>Add Course</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-0">
          <div className="max-h-96 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course Name</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Fees</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Students</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No courses found
                    </TableCell>
                  </TableRow>
                ) : (
                  courses.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.courseName}</TableCell>
                      <TableCell>{c.duration}</TableCell>
                      <TableCell>₹{c.fees.toLocaleString()}</TableCell>
                      <TableCell>{c.category || 'N/A'}</TableCell>
                      <TableCell>{c.studentCount}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Fees Tab ────────────────────────────────────────────────────────────────

function FeesTab() {
  const [fees, setFees] = useState<FeeData[]>([]);
  const [students, setStudents] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    studentId: '',
    amount: '',
    status: 'paid',
    month: '',
  });

  const fetchData = useCallback(async () => {
    try {
      const [feesRes, studentsRes] = await Promise.all([
        fetch('/api/fees'),
        fetch('/api/students'),
      ]);
      const feesJson = await feesRes.json();
      const studentsJson = await studentsRes.json();
      if (feesJson.success) setFees(feesJson.data);
      if (studentsJson.success) setStudents(studentsJson.data);
    } catch {
      toast.error('Failed to load fees data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const resetForm = () => {
    setForm({ studentId: '', amount: '', status: 'paid', month: '' });
  };

  const handleSubmit = async () => {
    if (!form.studentId || !form.amount) {
      toast.error('Student and amount are required');
      return;
    }
    try {
      const res = await fetch('/api/fees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: form.studentId,
          amount: parseFloat(form.amount),
          status: form.status,
          month: form.month || undefined,
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success('Fee collected successfully');
        setDialogOpen(false);
        resetForm();
        fetchData();
      } else {
        toast.error(json.message || 'Failed to collect fee');
      }
    } catch {
      toast.error('Something went wrong');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Fees</h2>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="bg-amber-500 hover:bg-amber-600 text-slate-900">
              <Plus className="h-4 w-4 mr-2" />
              Collect Fee
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Collect Fee</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="studentId">Student *</Label>
                <Select value={form.studentId} onValueChange={(value) => setForm({ ...form, studentId: value })}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.studentName} ({s.mobile})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="amount">Amount (₹) *</Label>
                <Input id="amount" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select value={form.status} onValueChange={(value) => setForm({ ...form, status: value })}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="month">Month</Label>
                <Input id="month" placeholder="e.g., January 2025" value={form.month} onChange={(e) => setForm({ ...form, month: e.target.value })} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }}>Cancel</Button>
              <Button className="bg-amber-500 hover:bg-amber-600 text-slate-900" onClick={handleSubmit}>Collect Fee</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-0">
          <div className="max-h-96 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Receipt No</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No fees records found
                    </TableCell>
                  </TableRow>
                ) : (
                  fees.map((f) => (
                    <TableRow key={f.id}>
                      <TableCell className="font-medium">{f.student.studentName}</TableCell>
                      <TableCell>₹{f.amount.toLocaleString()}</TableCell>
                      <TableCell>{new Date(f.paymentDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant={f.status === 'paid' ? 'default' : 'destructive'}>
                          {f.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{f.receiptNo || 'N/A'}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Attendance Tab ──────────────────────────────────────────────────────────

function AttendanceTab() {
  const [attendance, setAttendance] = useState<AttendanceData[]>([]);
  const [students, setStudents] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    studentId: '',
    date: new Date().toISOString().split('T')[0],
    status: 'present',
  });

  const fetchData = useCallback(async () => {
    try {
      const [attendanceRes, studentsRes] = await Promise.all([
        fetch('/api/attendance'),
        fetch('/api/students'),
      ]);
      const attendanceJson = await attendanceRes.json();
      const studentsJson = await studentsRes.json();
      if (attendanceJson.success) setAttendance(attendanceJson.data);
      if (studentsJson.success) setStudents(studentsJson.data);
    } catch {
      toast.error('Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const resetForm = () => {
    setForm({ studentId: '', date: new Date().toISOString().split('T')[0], status: 'present' });
  };

  const handleSubmit = async () => {
    if (!form.studentId || !form.date) {
      toast.error('Student and date are required');
      return;
    }
    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (json.success) {
        toast.success('Attendance marked successfully');
        setDialogOpen(false);
        resetForm();
        fetchData();
      } else {
        toast.error(json.message || 'Failed to mark attendance');
      }
    } catch {
      toast.error('Something went wrong');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Attendance</h2>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="bg-amber-500 hover:bg-amber-600 text-slate-900">
              <Plus className="h-4 w-4 mr-2" />
              Mark Attendance
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Mark Attendance</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="studentId">Student *</Label>
                <Select value={form.studentId} onValueChange={(value) => setForm({ ...form, studentId: value })}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.studentName} ({s.mobile})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="date">Date *</Label>
                <Input id="date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="attStatus">Status</Label>
                <Select value={form.status} onValueChange={(value) => setForm({ ...form, status: value })}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="present">Present</SelectItem>
                    <SelectItem value="absent">Absent</SelectItem>
                    <SelectItem value="late">Late</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }}>Cancel</Button>
              <Button className="bg-amber-500 hover:bg-amber-600 text-slate-900" onClick={handleSubmit}>Mark Attendance</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-0">
          <div className="max-h-96 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendance.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                      No attendance records found
                    </TableCell>
                  </TableRow>
                ) : (
                  attendance.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium">{a.student.studentName}</TableCell>
                      <TableCell>{new Date(a.date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            a.status === 'present' ? 'default' :
                            a.status === 'absent' ? 'destructive' :
                            'secondary'
                          }
                        >
                          {a.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Results Tab ─────────────────────────────────────────────────────────────

function ResultsTab() {
  const [results, setResults] = useState<ResultData[]>([]);
  const [students, setStudents] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    studentId: '',
    marks: '',
    grade: '',
  });

  const fetchData = useCallback(async () => {
    try {
      const [resultsRes, studentsRes] = await Promise.all([
        fetch('/api/results'),
        fetch('/api/students'),
      ]);
      const resultsJson = await resultsRes.json();
      const studentsJson = await studentsRes.json();
      if (resultsJson.success) setResults(resultsJson.data);
      if (studentsJson.success) setStudents(studentsJson.data);
    } catch {
      toast.error('Failed to load results');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const resetForm = () => {
    setForm({ studentId: '', marks: '', grade: '' });
  };

  const handleSubmit = async () => {
    if (!form.studentId || !form.marks || !form.grade) {
      toast.error('Student, marks, and grade are required');
      return;
    }
    try {
      const res = await fetch('/api/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (json.success) {
        toast.success('Result added successfully');
        setDialogOpen(false);
        resetForm();
        fetchData();
      } else {
        toast.error(json.message || 'Failed to add result');
      }
    } catch {
      toast.error('Something went wrong');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Results</h2>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="bg-amber-500 hover:bg-amber-600 text-slate-900">
              <Plus className="h-4 w-4 mr-2" />
              Add Result
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Result</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="studentId">Student *</Label>
                <Select value={form.studentId} onValueChange={(value) => setForm({ ...form, studentId: value })}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.studentName} ({s.mobile})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="marks">Marks *</Label>
                <Input id="marks" placeholder="e.g., 85/100" value={form.marks} onChange={(e) => setForm({ ...form, marks: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="grade">Grade *</Label>
                <Select value={form.grade} onValueChange={(value) => setForm({ ...form, grade: value })}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Grade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A+">A+</SelectItem>
                    <SelectItem value="A">A</SelectItem>
                    <SelectItem value="B+">B+</SelectItem>
                    <SelectItem value="B">B</SelectItem>
                    <SelectItem value="C+">C+</SelectItem>
                    <SelectItem value="C">C</SelectItem>
                    <SelectItem value="D">D</SelectItem>
                    <SelectItem value="F">F</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }}>Cancel</Button>
              <Button className="bg-amber-500 hover:bg-amber-600 text-slate-900" onClick={handleSubmit}>Add Result</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-0">
          <div className="max-h-96 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Marks</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Exam</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      No results found
                    </TableCell>
                  </TableRow>
                ) : (
                  results.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.student.studentName}</TableCell>
                      <TableCell>{r.marks}</TableCell>
                      <TableCell>
                        <Badge variant={
                          r.grade === 'A+' || r.grade === 'A' ? 'default' :
                          r.grade === 'F' ? 'destructive' : 'secondary'
                        }>
                          {r.grade}
                        </Badge>
                      </TableCell>
                      <TableCell>{r.exam?.examName || 'N/A'}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Certificates Tab ────────────────────────────────────────────────────────

function CertificatesTab() {
  const [certificates, setCertificates] = useState<CertificateData[]>([]);
  const [students, setStudents] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    studentId: '',
  });

  const fetchData = useCallback(async () => {
    try {
      const [certsRes, studentsRes] = await Promise.all([
        fetch('/api/certificates'),
        fetch('/api/students'),
      ]);
      const certsJson = await certsRes.json();
      const studentsJson = await studentsRes.json();
      if (certsJson.success) setCertificates(certsJson.data);
      if (studentsJson.success) setStudents(studentsJson.data);
    } catch {
      toast.error('Failed to load certificates');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const resetForm = () => {
    setForm({ studentId: '' });
  };

  const handleSubmit = async () => {
    if (!form.studentId) {
      toast.error('Student is required');
      return;
    }
    try {
      const res = await fetch('/api/certificates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: form.studentId }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(`Certificate generated: ${json.data.certificateNo}`);
        setDialogOpen(false);
        resetForm();
        fetchData();
      } else {
        toast.error(json.message || 'Failed to generate certificate');
      }
    } catch {
      toast.error('Something went wrong');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Certificates</h2>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="bg-amber-500 hover:bg-amber-600 text-slate-900">
              <Plus className="h-4 w-4 mr-2" />
              Generate Certificate
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Generate Certificate</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="certStudentId">Student *</Label>
                <Select value={form.studentId} onValueChange={(value) => setForm({ ...form, studentId: value })}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.studentName} ({s.mobile})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <p className="text-sm text-muted-foreground">
                Certificate number will be auto-generated (NCI-YYYY-XXXXX format)
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }}>Cancel</Button>
              <Button className="bg-amber-500 hover:bg-amber-600 text-slate-900" onClick={handleSubmit}>Generate</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-0">
          <div className="max-h-96 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Certificate No</TableHead>
                  <TableHead>Issued Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {certificates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                      No certificates found
                    </TableCell>
                  </TableRow>
                ) : (
                  certificates.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.student.studentName}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono">{c.certificateNo}</Badge>
                      </TableCell>
                      <TableCell>{new Date(c.issuedDate).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Notices Tab ─────────────────────────────────────────────────────────────

function NoticesTab() {
  const [notices, setNotices] = useState<NoticeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    title: '',
    content: '',
    isActive: true,
  });

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/notices?all=true');
      const json = await res.json();
      if (json.success) setNotices(json.data);
    } catch {
      toast.error('Failed to load notices');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const resetForm = () => {
    setForm({ title: '', content: '', isActive: true });
  };

  const handleSubmit = async () => {
    if (!form.title || !form.content) {
      toast.error('Title and content are required');
      return;
    }
    try {
      const res = await fetch('/api/notices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (json.success) {
        toast.success('Notice added successfully');
        setDialogOpen(false);
        resetForm();
        fetchData();
      } else {
        toast.error(json.message || 'Failed to add notice');
      }
    } catch {
      toast.error('Something went wrong');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Notices</h2>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="bg-amber-500 hover:bg-amber-600 text-slate-900">
              <Plus className="h-4 w-4 mr-2" />
              Add Notice
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Notice</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="noticeTitle">Title *</Label>
                <Input id="noticeTitle" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="noticeContent">Content *</Label>
                <Textarea id="noticeContent" rows={4} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="noticeActive"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="noticeActive">Active</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }}>Cancel</Button>
              <Button className="bg-amber-500 hover:bg-amber-600 text-slate-900" onClick={handleSubmit}>Add Notice</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-0">
          <div className="max-h-96 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Content</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      No notices found
                    </TableCell>
                  </TableRow>
                ) : (
                  notices.map((n) => (
                    <TableRow key={n.id}>
                      <TableCell className="font-medium">{n.title}</TableCell>
                      <TableCell className="max-w-xs truncate">{n.content}</TableCell>
                      <TableCell>
                        <Badge variant={n.isActive ? 'default' : 'secondary'}>
                          {n.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(n.createdAt).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Admissions Tab ──────────────────────────────────────────────────────────

function AdmissionsTab() {
  const [admissions, setAdmissions] = useState<AdmissionData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admission')
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setAdmissions(json.data);
      })
      .catch(() => toast.error('Failed to load admissions'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Admission Inquiries</h2>

      <Card className="shadow-sm">
        <CardContent className="p-0">
          <div className="max-h-96 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Mobile</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {admissions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No admission inquiries found
                    </TableCell>
                  </TableRow>
                ) : (
                  admissions.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium">{a.studentName}</TableCell>
                      <TableCell>{a.mobile}</TableCell>
                      <TableCell>{a.course}</TableCell>
                      <TableCell>
                        <Badge variant={a.status === 'pending' ? 'secondary' : a.status === 'approved' ? 'default' : 'destructive'}>
                          {a.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(a.createdAt).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
