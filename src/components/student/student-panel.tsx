'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAppStore, type StudentTab } from '@/store/app-store';
import { toast } from 'sonner';
import {
  LayoutDashboard,
  IndianRupee,
  Calendar,
  FileText,
  Award,
  User,
  Menu,
  LogOut,
  Download,
  Edit,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

// ── Types ──────────────────────────────────────────────
interface StudentDetail {
  id: string;
  studentName: string;
  fatherName: string;
  mobile: string;
  email?: string | null;
  photo?: string | null;
  admissionDate: string;
  status: string;
  course?: { id: string; courseName: string; duration: string; fees: number } | null;
  branch?: { id: string; branchName: string } | null;
  fees: {
    id: string;
    amount: number;
    paymentDate: string;
    status: string;
    receiptNo?: string | null;
    month?: string | null;
  }[];
  attendances: {
    id: string;
    date: string;
    status: string;
  }[];
  results: {
    id: string;
    marks: string;
    grade: string;
    exam?: { id: string; examName: string; examDate: string; totalMarks: number | null } | null;
  }[];
  certificates: {
    id: string;
    certificateNo: string;
    issuedDate: string;
  }[];
}

// ── Sidebar items ──────────────────────────────────────
const studentNavItems: { key: StudentTab; label: string; icon: typeof LayoutDashboard }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'profile', label: 'Profile', icon: User },
  { key: 'fees', label: 'Fees', icon: IndianRupee },
  { key: 'attendance', label: 'Attendance', icon: Calendar },
  { key: 'results', label: 'Results', icon: FileText },
  { key: 'certificates', label: 'Certificates', icon: Award },
];

// ── Component ──────────────────────────────────────────
export default function StudentPanel() {
  const { studentTab, setStudentTab, user, sidebarOpen, setSidebarOpen, logout } = useAppStore();

  // Data states
  const [student, setStudent] = useState<StudentDetail | null>(null);
  const [loading, setLoading] = useState(true);

  // ── Data fetching ──────────────────────────────────
  const fetchStudent = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await fetch(`/api/students/${user.id}`);
      const json = await res.json();
      if (json.success) {
        setStudent(json.data);
      } else {
        toast.error('Failed to fetch student data');
      }
    } catch {
      toast.error('Failed to fetch student data');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchStudent();
  }, [fetchStudent]);

  // ── Computed values ────────────────────────────────
  const totalFeesPaid = student?.fees.filter((f) => f.status === 'paid').reduce((sum, f) => sum + f.amount, 0) ?? 0;
  const totalFeesPending = student?.fees.filter((f) => f.status === 'pending').reduce((sum, f) => sum + f.amount, 0) ?? 0;
  const totalPresent = student?.attendances.filter((a) => a.status === 'present').length ?? 0;
  const totalAbsent = student?.attendances.filter((a) => a.status === 'absent').length ?? 0;
  const totalAttendance = student?.attendances.length ?? 0;
  const attendancePercentage = totalAttendance > 0 ? Math.round((totalPresent / totalAttendance) * 100) : 0;
  const latestGrade = student?.results.length ? student.results[0].grade : 'N/A';
  const courseFees = student?.course?.fees ?? 0;
  const feeProgress = courseFees > 0 ? Math.min(Math.round((totalFeesPaid / courseFees) * 100), 100) : 0;

  // ── Sidebar JSX ───────────────────────────────────
  const renderSidebar = () => (
    <div className="flex flex-col h-full bg-slate-900 text-white">
      <div className="p-6 border-b border-slate-700">
        <h2 className="text-lg font-bold text-blue-400">NELSON</h2>
        <p className="text-xs text-slate-400">Computer Institute</p>
        <p className="text-xs text-slate-500 mt-1">Student Panel</p>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {studentNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = studentTab === item.key;
          return (
            <button
              key={item.key}
              onClick={() => {
                setStudentTab(item.key);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
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
          Welcome, <span className="font-medium text-slate-900">{user?.name || 'Student'}</span>
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
      {/* Welcome Card */}
      <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Welcome, {student?.studentName || user?.name || 'Student'}!</CardTitle>
          <CardDescription className="text-blue-100">
            {student?.course?.courseName ? `Course: ${student.course.courseName}` : 'No course assigned'}
            {student?.branch?.branchName ? ` | Branch: ${student.branch.branchName}` : ''}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Quick stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Fees Paid</CardTitle>
            <IndianRupee className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">₹{totalFeesPaid.toLocaleString()}</div>
            {courseFees > 0 && (
              <div className="mt-2">
                <Progress value={feeProgress} className="h-2" />
                <p className="text-xs text-slate-500 mt-1">{feeProgress}% of ₹{courseFees.toLocaleString()}</p>
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Attendance %</CardTitle>
            <Calendar className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{attendancePercentage}%</div>
            <div className="mt-2">
              <Progress value={attendancePercentage} className="h-2" />
              <p className="text-xs text-slate-500 mt-1">{totalPresent} present / {totalAttendance} total</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Latest Grade</CardTitle>
            <FileText className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{latestGrade}</div>
            <p className="text-xs text-slate-500 mt-1">{student?.results.length ?? 0} total results</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // ── Profile Tab ───────────────────────────────────
  const renderProfile = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">My Profile</h2>
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex items-start gap-6">
            {/* Photo placeholder */}
            <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
              {student?.photo ? (
                <img src={student.photo} alt={student.studentName} className="w-24 h-24 rounded-full object-cover" />
              ) : (
                <User className="h-12 w-12 text-blue-400" />
              )}
            </div>
            <div className="flex-1">
              <CardTitle className="text-xl">{student?.studentName || 'N/A'}</CardTitle>
              <CardDescription>
                {student?.course?.courseName || 'No course'} | {student?.branch?.branchName || 'No branch'}
              </CardDescription>
              <Badge className={`mt-2 ${student?.status === 'active' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                {student?.status || 'N/A'}
              </Badge>
            </div>
            <Button variant="outline" size="sm" className="shrink-0">
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-500">Student Name</p>
              <p className="text-sm text-slate-900">{student?.studentName || 'N/A'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-500">Father Name</p>
              <p className="text-sm text-slate-900">{student?.fatherName || 'N/A'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-500">Mobile</p>
              <p className="text-sm text-slate-900">{student?.mobile || 'N/A'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-500">Email</p>
              <p className="text-sm text-slate-900">{student?.email || 'N/A'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-500">Course</p>
              <p className="text-sm text-slate-900">{student?.course?.courseName || 'N/A'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-500">Branch</p>
              <p className="text-sm text-slate-900">{student?.branch?.branchName || 'N/A'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-500">Admission Date</p>
              <p className="text-sm text-slate-900">
                {student?.admissionDate ? new Date(student.admissionDate).toLocaleDateString() : 'N/A'}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-500">Status</p>
              <Badge className={student?.status === 'active' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}>
                {student?.status || 'N/A'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // ── Fees Tab ──────────────────────────────────────
  const renderFees = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">My Fees</h2>

      {/* Fee summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Paid</CardTitle>
            <CheckCircle className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">₹{totalFeesPaid.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Pending</CardTitle>
            <Clock className="h-5 w-5 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">₹{totalFeesPending.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Course Fee</CardTitle>
            <IndianRupee className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">₹{courseFees.toLocaleString()}</div>
            {courseFees > 0 && (
              <Progress value={feeProgress} className="h-2 mt-2" />
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="max-h-96 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Receipt No</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!student?.fees.length ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-slate-500">No fee records found</TableCell>
                  </TableRow>
                ) : (
                  student.fees.map((f) => (
                    <TableRow key={f.id}>
                      <TableCell className="font-medium">₹{f.amount.toLocaleString()}</TableCell>
                      <TableCell>{new Date(f.paymentDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant={f.status === 'paid' ? 'default' : 'secondary'} className={f.status === 'paid' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}>
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
      <h2 className="text-2xl font-bold text-slate-900">My Attendance</h2>

      {/* Attendance summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Present</CardTitle>
            <CheckCircle className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{totalPresent}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Absent</CardTitle>
            <XCircle className="h-5 w-5 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{totalAbsent}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Percentage</CardTitle>
            <Calendar className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{attendancePercentage}%</div>
            <Progress value={attendancePercentage} className="h-2 mt-2" />
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Attendance Records</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="max-h-96 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!student?.attendances.length ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center py-8 text-slate-500">No attendance records found</TableCell>
                  </TableRow>
                ) : (
                  student.attendances.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium">{new Date(a.date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            a.status === 'present'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
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
      <h2 className="text-2xl font-bold text-slate-900">My Results</h2>

      {/* Result cards */}
      {student?.results.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {student.results.map((r) => (
            <Card key={r.id} className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">{r.exam?.examName || 'Exam'}</CardTitle>
                {r.exam?.examDate && (
                  <CardDescription>{new Date(r.exam.examDate).toLocaleDateString()}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{r.marks}</p>
                    <p className="text-xs text-slate-500">
                      {r.exam?.totalMarks ? `out of ${r.exam.totalMarks}` : 'marks'}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-lg px-3 py-1 ${
                      r.grade === 'A+' || r.grade === 'A'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : r.grade === 'B+' || r.grade === 'B'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : r.grade === 'F'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    {r.grade}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="shadow-sm">
          <CardContent className="py-8 text-center text-slate-500">No results found</CardContent>
        </Card>
      )}

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>All Results</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="max-h-96 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Exam</TableHead>
                  <TableHead>Marks</TableHead>
                  <TableHead>Grade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!student?.results.length ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8 text-slate-500">No results found</TableCell>
                  </TableRow>
                ) : (
                  student.results.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.exam?.examName || 'N/A'}</TableCell>
                      <TableCell>{r.marks}{r.exam?.totalMarks ? ` / ${r.exam.totalMarks}` : ''}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            r.grade === 'A+' || r.grade === 'A'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : r.grade === 'B+' || r.grade === 'B'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
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
      <h2 className="text-2xl font-bold text-slate-900">My Certificates</h2>

      {student?.certificates.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {student.certificates.map((c) => (
            <Card key={c.id} className="shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                    <Award className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-mono">{c.certificateNo}</CardTitle>
                    <CardDescription>{new Date(c.issuedDate).toLocaleDateString()}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button variant="outline" size="sm" className="w-full text-blue-600 hover:text-blue-700 border-blue-200 hover:border-blue-300">
                  <Download className="h-4 w-4 mr-2" />
                  Download Certificate
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="shadow-sm">
          <CardContent className="py-8 text-center text-slate-500">No certificates found</CardContent>
        </Card>
      )}
    </div>
  );

  // ── Tab content renderer ──────────────────────────
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        </div>
      );
    }
    switch (studentTab) {
      case 'dashboard':
        return renderDashboard();
      case 'profile':
        return renderProfile();
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
