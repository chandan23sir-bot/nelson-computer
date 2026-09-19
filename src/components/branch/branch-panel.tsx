'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAppStore, type BranchTab } from '@/store/app-store';
import { toast } from 'sonner';
import {
  LayoutDashboard,
  Users,
  IndianRupee,
  Calendar,
  FileText,
  Award,
  Menu,
  LogOut,
  Plus,
  Download,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// ── Types ──────────────────────────────────────────────
interface StudentData {
  id: string;
  studentName: string;
  fatherName: string;
  mobile: string;
  email?: string | null;
  courseId?: string | null;
  course?: { id: string; courseName: string } | null;
  branch?: { id: string; branchName: string } | null;
  branchId?: string | null;
  status: string;
  admissionDate: string;
}

interface FeeData {
  id: string;
  studentId: string;
  amount: number;
  paymentDate: string;
  status: string;
  receiptNo?: string | null;
  month?: string | null;
  student: { id: string; studentName: string; fatherName: string; mobile: string };
}

interface AttendanceData {
  id: string;
  studentId: string;
  date: string;
  status: string;
  student: { id: string; studentName: string; fatherName: string; mobile: string };
}

interface ResultData {
  id: string;
  studentId: string;
  marks: string;
  grade: string;
  exam?: { id: string; examName: string; examDate: string; totalMarks: number | null } | null;
  student: { id: string; studentName: string; fatherName: string; mobile: string };
}

interface CertificateData {
  id: string;
  studentId: string;
  certificateNo: string;
  issuedDate: string;
  student: { id: string; studentName: string; fatherName: string; mobile: string };
}

interface CourseData {
  id: string;
  courseName: string;
  duration: string;
  fees: number;
}

// ── Sidebar items ──────────────────────────────────────
const branchNavItems: { key: BranchTab; label: string; icon: typeof LayoutDashboard }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'students', label: 'Students', icon: Users },
  { key: 'fees', label: 'Fees', icon: IndianRupee },
  { key: 'attendance', label: 'Attendance', icon: Calendar },
  { key: 'results', label: 'Results', icon: FileText },
  { key: 'certificates', label: 'Certificates', icon: Award },
];

// ── Component ──────────────────────────────────────────
export default function BranchPanel() {
  const { branchTab, setBranchTab, user, sidebarOpen, setSidebarOpen, logout } = useAppStore();

  // Data states
  const [students, setStudents] = useState<StudentData[]>([]);
  const [fees, setFees] = useState<FeeData[]>([]);
  const [attendance, setAttendance] = useState<AttendanceData[]>([]);
  const [results, setResults] = useState<ResultData[]>([]);
  const [certificates, setCertificates] = useState<CertificateData[]>([]);
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog states
  const [addStudentOpen, setAddStudentOpen] = useState(false);
  const [collectFeeOpen, setCollectFeeOpen] = useState(false);
  const [markAttendanceOpen, setMarkAttendanceOpen] = useState(false);
  const [addResultOpen, setAddResultOpen] = useState(false);

  // Form states
  const [studentForm, setStudentForm] = useState({
    studentName: '',
    fatherName: '',
    mobile: '',
    email: '',
    courseId: '',
    password: '',
  });
  const [feeForm, setFeeForm] = useState({
    studentId: '',
    amount: '',
    paymentDate: '',
    status: 'paid',
    receiptNo: '',
    month: '',
  });
  const [attendanceForm, setAttendanceForm] = useState({
    studentId: '',
    date: new Date().toISOString().split('T')[0],
    status: 'present',
  });
  const [resultForm, setResultForm] = useState({
    studentId: '',
    marks: '',
    grade: '',
  });

  // ── Combined data fetching ────────────────────────
  const loadAllData = useCallback(async () => {
    if (!user?.id) return;
    try {
      const [studentsRes, coursesRes, feesRes, attendanceRes, resultsRes, certsRes] = await Promise.all([
        fetch('/api/students'),
        fetch('/api/courses'),
        fetch('/api/fees'),
        fetch('/api/attendance'),
        fetch('/api/results'),
        fetch('/api/certificates'),
      ]);

      const [studentsJson, coursesJson, feesJson, attendanceJson, resultsJson, certsJson] = await Promise.all([
        studentsRes.json(),
        coursesRes.json(),
        feesRes.json(),
        attendanceRes.json(),
        resultsRes.json(),
        certsRes.json(),
      ]);

      if (studentsJson.success) {
        const branchStudents = studentsJson.data.filter(
          (s: StudentData) => s.branchId === user.id
        );
        setStudents(branchStudents);

        const branchStudentIds = branchStudents.map((s: StudentData) => s.id);

        if (feesJson.success) {
          setFees(feesJson.data.filter((f: FeeData) => branchStudentIds.includes(f.studentId)));
        }
        if (attendanceJson.success) {
          setAttendance(attendanceJson.data.filter((a: AttendanceData) => branchStudentIds.includes(a.studentId)));
        }
        if (resultsJson.success) {
          setResults(resultsJson.data.filter((r: ResultData) => branchStudentIds.includes(r.studentId)));
        }
        if (certsJson.success) {
          setCertificates(certsJson.data.filter((c: CertificateData) => branchStudentIds.includes(c.studentId)));
        }
      }

      if (coursesJson.success) setCourses(coursesJson.data);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // ── Refresh helpers ───────────────────────────────
  const refreshStudents = async () => {
    try {
      const res = await fetch('/api/students');
      const json = await res.json();
      if (json.success) {
        setStudents(json.data.filter((s: StudentData) => s.branchId === user?.id));
      }
    } catch {
      toast.error('Failed to refresh students');
    }
  };

  const refreshFees = async () => {
    try {
      const res = await fetch('/api/fees');
      const json = await res.json();
      if (json.success) {
        const ids = students.map((s) => s.id);
        setFees(json.data.filter((f: FeeData) => ids.includes(f.studentId)));
      }
    } catch {
      toast.error('Failed to refresh fees');
    }
  };

  const refreshAttendance = async () => {
    try {
      const res = await fetch('/api/attendance');
      const json = await res.json();
      if (json.success) {
        const ids = students.map((s) => s.id);
        setAttendance(json.data.filter((a: AttendanceData) => ids.includes(a.studentId)));
      }
    } catch {
      toast.error('Failed to refresh attendance');
    }
  };

  const refreshResults = async () => {
    try {
      const res = await fetch('/api/results');
      const json = await res.json();
      if (json.success) {
        const ids = students.map((s) => s.id);
        setResults(json.data.filter((r: ResultData) => ids.includes(r.studentId)));
      }
    } catch {
      toast.error('Failed to refresh results');
    }
  };

  // ── Computed values ────────────────────────────────
  const totalFeesCollected = fees
    .filter((f) => f.status === 'paid')
    .reduce((sum, f) => sum + f.amount, 0);
  const pendingFees = fees.filter((f) => f.status === 'pending');
  const todayStr = new Date().toISOString().split('T')[0];
  const todayAttendance = attendance.filter(
    (a) => new Date(a.date).toISOString().split('T')[0] === todayStr
  );
  const todayPresent = todayAttendance.filter((a) => a.status === 'present').length;

  // Monthly fee chart data
  const monthlyFeeData = (() => {
    const now = new Date();
    const months: { month: string; amount: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = d.toLocaleString('default', { month: 'short', year: 'numeric' });
      const total = fees
        .filter((f) => {
          const pd = new Date(f.paymentDate);
          return (
            pd.getFullYear() === d.getFullYear() &&
            pd.getMonth() === d.getMonth() &&
            f.status === 'paid'
          );
        })
        .reduce((sum, f) => sum + f.amount, 0);
      months.push({ month: monthName, amount: total });
    }
    return months;
  })();

  // ── Form handlers ──────────────────────────────────
  const handleAddStudent = async () => {
    if (!studentForm.studentName || !studentForm.fatherName || !studentForm.mobile) {
      toast.error('Name, Father Name, and Mobile are required');
      return;
    }
    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...studentForm,
          branchId: user?.id,
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success('Student added successfully');
        if (json.generatedPassword) {
          toast.info(`Generated password: ${json.generatedPassword}`);
        }
        setAddStudentOpen(false);
        setStudentForm({ studentName: '', fatherName: '', mobile: '', email: '', courseId: '', password: '' });
        refreshStudents();
      } else {
        toast.error(json.message || 'Failed to add student');
      }
    } catch {
      toast.error('Failed to add student');
    }
  };

  const handleCollectFee = async () => {
    if (!feeForm.studentId || !feeForm.amount) {
      toast.error('Student and Amount are required');
      return;
    }
    try {
      const res = await fetch('/api/fees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feeForm),
      });
      const json = await res.json();
      if (json.success) {
        toast.success('Fee collected successfully');
        setCollectFeeOpen(false);
        setFeeForm({ studentId: '', amount: '', paymentDate: '', status: 'paid', receiptNo: '', month: '' });
        refreshFees();
      } else {
        toast.error(json.message || 'Failed to collect fee');
      }
    } catch {
      toast.error('Failed to collect fee');
    }
  };

  const handleMarkAttendance = async () => {
    if (!attendanceForm.studentId || !attendanceForm.date) {
      toast.error('Student and Date are required');
      return;
    }
    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(attendanceForm),
      });
      const json = await res.json();
      if (json.success) {
        toast.success('Attendance marked successfully');
        setMarkAttendanceOpen(false);
        setAttendanceForm({ studentId: '', date: new Date().toISOString().split('T')[0], status: 'present' });
        refreshAttendance();
      } else {
        toast.error(json.message || 'Failed to mark attendance');
      }
    } catch {
      toast.error('Failed to mark attendance');
    }
  };

  const handleAddResult = async () => {
    if (!resultForm.studentId || !resultForm.marks || !resultForm.grade) {
      toast.error('Student, Marks, and Grade are required');
      return;
    }
    try {
      const res = await fetch('/api/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resultForm),
      });
      const json = await res.json();
      if (json.success) {
        toast.success('Result added successfully');
        setAddResultOpen(false);
        setResultForm({ studentId: '', marks: '', grade: '' });
        refreshResults();
      } else {
        toast.error(json.message || 'Failed to add result');
      }
    } catch {
      toast.error('Failed to add result');
    }
  };

  // ── Sidebar JSX ───────────────────────────────────
  const renderSidebar = () => (
    <div className="flex flex-col h-full bg-slate-900 text-white">
      <div className="p-6 border-b border-slate-700">
        <h2 className="text-lg font-bold text-emerald-400">NELSON</h2>
        <p className="text-xs text-slate-400">Computer Institute</p>
        <p className="text-xs text-slate-500 mt-1">Branch Panel</p>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {branchNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = branchTab === item.key;
          return (
            <button
              key={item.key}
              onClick={() => {
                setBranchTab(item.key);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </button>
          );
        })}
      </nav>
      <div className="p-4 border-t border-slate-700">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-300 hover:bg-red-500/20 hover:text-red-400 transition-all duration-200 cursor-pointer"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  );

  // ── Topbar JSX ────────────────────────────────────
  const renderTopbar = () => (
    <header className="h-16 border-b bg-white flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-4">
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            {renderSidebar()}
          </SheetContent>
        </Sheet>
        <div>
          <h1 className="text-base font-semibold text-slate-900">NELSON COMPUTER INSTITUTE</h1>
          <p className="text-xs text-slate-500">8707599763, 9792121300</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-slate-600">
          Welcome, <span className="font-medium text-slate-900">{user?.name || 'Branch'}</span>
        </span>
        <Button variant="ghost" size="sm" onClick={logout} className="text-slate-500 hover:text-red-500">
          <LogOut className="h-4 w-4 mr-1" />
          Logout
        </Button>
      </div>
    </header>
  );

  // ── Dashboard ─────────────────────────────────────
  const renderDashboard = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">Dashboard</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">My Students</CardTitle>
            <Users className="h-5 w-5 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{students.length}</div>
            <p className="text-xs text-slate-500 mt-1">Active students in your branch</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Fees Collected</CardTitle>
            <IndianRupee className="h-5 w-5 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">₹{totalFeesCollected.toLocaleString()}</div>
            <p className="text-xs text-slate-500 mt-1">Total collected amount</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Pending Fees</CardTitle>
            <Clock className="h-5 w-5 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{pendingFees.length}</div>
            <p className="text-xs text-slate-500 mt-1">Students with pending fees</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Today&apos;s Attendance</CardTitle>
            <Calendar className="h-5 w-5 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">
              {todayPresent}/{todayAttendance.length}
            </div>
            <p className="text-xs text-slate-500 mt-1">Present today</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Monthly Fee Collection</CardTitle>
          <CardDescription>Fee collection over the last 6 months</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyFeeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Amount']} />
                <Bar dataKey="amount" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // ── Students Tab ──────────────────────────────────
  const renderStudents = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Students</h2>
        <Dialog open={addStudentOpen} onOpenChange={setAddStudentOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add Student
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Student</DialogTitle>
              <DialogDescription>Enter student details. Password will be auto-generated if left empty.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="sName">Student Name *</Label>
                <Input id="sName" value={studentForm.studentName} onChange={(e) => setStudentForm({ ...studentForm, studentName: e.target.value })} placeholder="Enter student name" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="fName">Father Name *</Label>
                <Input id="fName" value={studentForm.fatherName} onChange={(e) => setStudentForm({ ...studentForm, fatherName: e.target.value })} placeholder="Enter father name" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="sMobile">Mobile *</Label>
                <Input id="sMobile" value={studentForm.mobile} onChange={(e) => setStudentForm({ ...studentForm, mobile: e.target.value })} placeholder="Enter mobile number" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="sEmail">Email</Label>
                <Input id="sEmail" type="email" value={studentForm.email} onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })} placeholder="Enter email" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="sCourse">Course</Label>
                <Select value={studentForm.courseId} onValueChange={(val) => setStudentForm({ ...studentForm, courseId: val })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.courseName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="sPass">Password</Label>
                <Input id="sPass" value={studentForm.password} onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })} placeholder="Leave empty for auto-generate" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddStudentOpen(false)}>Cancel</Button>
              <Button className="bg-emerald-500 hover:bg-emerald-600 text-white" onClick={handleAddStudent}>Add Student</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <Card className="shadow-sm">
        <CardContent className="p-0">
          <ScrollArea className="max-h-96 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Mobile</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-slate-500">No students found</TableCell>
                  </TableRow>
                ) : (
                  students.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.studentName}</TableCell>
                      <TableCell>{s.mobile}</TableCell>
                      <TableCell>{s.course?.courseName || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge variant={s.status === 'active' ? 'default' : 'secondary'} className={s.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}>
                          {s.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700">
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );

  // ── Fees Tab ──────────────────────────────────────
  const renderFees = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Fees</h2>
        <Dialog open={collectFeeOpen} onOpenChange={setCollectFeeOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Collect Fee
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Collect Fee</DialogTitle>
              <DialogDescription>Record a fee payment for a student.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Student *</Label>
                <Select value={feeForm.studentId} onValueChange={(val) => setFeeForm({ ...feeForm, studentId: val })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.studentName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="fAmount">Amount *</Label>
                <Input id="fAmount" type="number" value={feeForm.amount} onChange={(e) => setFeeForm({ ...feeForm, amount: e.target.value })} placeholder="Enter amount" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="fDate">Payment Date</Label>
                <Input id="fDate" type="date" value={feeForm.paymentDate} onChange={(e) => setFeeForm({ ...feeForm, paymentDate: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>Status</Label>
                <Select value={feeForm.status} onValueChange={(val) => setFeeForm({ ...feeForm, status: val })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="fReceipt">Receipt No</Label>
                <Input id="fReceipt" value={feeForm.receiptNo} onChange={(e) => setFeeForm({ ...feeForm, receiptNo: e.target.value })} placeholder="Receipt number" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="fMonth">Month</Label>
                <Input id="fMonth" value={feeForm.month} onChange={(e) => setFeeForm({ ...feeForm, month: e.target.value })} placeholder="e.g. January 2025" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCollectFeeOpen(false)}>Cancel</Button>
              <Button className="bg-emerald-500 hover:bg-emerald-600 text-white" onClick={handleCollectFee}>Collect Fee</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <Card className="shadow-sm">
        <CardContent className="p-0">
          <ScrollArea className="max-h-96 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Receipt</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-slate-500">No fee records found</TableCell>
                  </TableRow>
                ) : (
                  fees.map((f) => (
                    <TableRow key={f.id}>
                      <TableCell className="font-medium">{f.student.studentName}</TableCell>
                      <TableCell>₹{f.amount.toLocaleString()}</TableCell>
                      <TableCell>{new Date(f.paymentDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant={f.status === 'paid' ? 'default' : 'secondary'} className={f.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}>
                          {f.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{f.receiptNo || '-'}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );

  // ── Attendance Tab ────────────────────────────────
  const renderAttendance = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Attendance</h2>
        <Dialog open={markAttendanceOpen} onOpenChange={setMarkAttendanceOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Mark Attendance
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Mark Attendance</DialogTitle>
              <DialogDescription>Record attendance for a student.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Student *</Label>
                <Select value={attendanceForm.studentId} onValueChange={(val) => setAttendanceForm({ ...attendanceForm, studentId: val })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.studentName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="aDate">Date *</Label>
                <Input id="aDate" type="date" value={attendanceForm.date} onChange={(e) => setAttendanceForm({ ...attendanceForm, date: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>Status</Label>
                <Select value={attendanceForm.status} onValueChange={(val) => setAttendanceForm({ ...attendanceForm, status: val })}>
                  <SelectTrigger>
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
              <Button variant="outline" onClick={() => setMarkAttendanceOpen(false)}>Cancel</Button>
              <Button className="bg-emerald-500 hover:bg-emerald-600 text-white" onClick={handleMarkAttendance}>Mark Attendance</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <Card className="shadow-sm">
        <CardContent className="p-0">
          <ScrollArea className="max-h-96 overflow-y-auto">
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
                    <TableCell colSpan={3} className="text-center py-8 text-slate-500">No attendance records found</TableCell>
                  </TableRow>
                ) : (
                  attendance.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium">{a.student.studentName}</TableCell>
                      <TableCell>{new Date(a.date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            a.status === 'present'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : a.status === 'absent'
                                ? 'bg-red-50 text-red-700 border-red-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                          }
                        >
                          {a.status === 'present' && <CheckCircle className="h-3 w-3 mr-1" />}
                          {a.status === 'absent' && <XCircle className="h-3 w-3 mr-1" />}
                          {a.status === 'late' && <Clock className="h-3 w-3 mr-1" />}
                          {a.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );

  // ── Results Tab ───────────────────────────────────
  const renderResults = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Results</h2>
        <Dialog open={addResultOpen} onOpenChange={setAddResultOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add Result
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Result</DialogTitle>
              <DialogDescription>Enter exam result for a student.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Student *</Label>
                <Select value={resultForm.studentId} onValueChange={(val) => setResultForm({ ...resultForm, studentId: val })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.studentName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="rMarks">Marks *</Label>
                <Input id="rMarks" value={resultForm.marks} onChange={(e) => setResultForm({ ...resultForm, marks: e.target.value })} placeholder="Enter marks" />
              </div>
              <div className="grid gap-2">
                <Label>Grade *</Label>
                <Select value={resultForm.grade} onValueChange={(val) => setResultForm({ ...resultForm, grade: val })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select grade" />
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
              <Button variant="outline" onClick={() => setAddResultOpen(false)}>Cancel</Button>
              <Button className="bg-emerald-500 hover:bg-emerald-600 text-white" onClick={handleAddResult}>Add Result</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <Card className="shadow-sm">
        <CardContent className="p-0">
          <ScrollArea className="max-h-96 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Marks</TableHead>
                  <TableHead>Grade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8 text-slate-500">No results found</TableCell>
                  </TableRow>
                ) : (
                  results.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.student.studentName}</TableCell>
                      <TableCell>{r.marks}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            r.grade === 'A+' || r.grade === 'A'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : r.grade === 'B+' || r.grade === 'B'
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : r.grade === 'F'
                                  ? 'bg-red-50 text-red-700 border-red-200'
                                  : 'bg-amber-50 text-amber-700 border-amber-200'
                          }
                        >
                          {r.grade}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );

  // ── Certificates Tab ──────────────────────────────
  const renderCertificates = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">Certificates</h2>
      <Card className="shadow-sm">
        <CardContent className="p-0">
          <ScrollArea className="max-h-96 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Certificate No</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {certificates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-slate-500">No certificates found</TableCell>
                  </TableRow>
                ) : (
                  certificates.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.student.studentName}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-mono">
                          {c.certificateNo}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(c.issuedDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700">
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );

  // ── Tab content renderer ──────────────────────────
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
        </div>
      );
    }
    switch (branchTab) {
      case 'dashboard':
        return renderDashboard();
      case 'students':
        return renderStudents();
      case 'fees':
        return renderFees();
      case 'attendance':
        return renderAttendance();
      case 'results':
        return renderResults();
      case 'certificates':
        return renderCertificates();
      default:
        return renderDashboard();
    }
  };

  // ── Main layout ───────────────────────────────────
  return (
    <div className="flex h-screen bg-slate-50">
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-64 shrink-0">
        {renderSidebar()}
      </aside>
      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {renderTopbar()}
        <main className="flex-1 overflow-y-auto p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
