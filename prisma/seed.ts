import { db } from '../src/lib/db';
import { hash } from 'crypto';

async function main() {
  // Create default admin
  const existingAdmin = await db.admin.findFirst();
  if (!existingAdmin) {
    await db.admin.create({
      data: {
        name: 'Nelson Admin',
        email: 'admin@nelson.com',
        password: 'admin123',
      },
    });
    console.log('✅ Default admin created: admin@nelson.com / admin123');
  }

  // Create default branch
  const existingBranch = await db.branch.findFirst();
  if (!existingBranch) {
    await db.branch.create({
      data: {
        branchName: 'Nelson Main Branch',
        ownerName: 'Nelson Director',
        email: 'branch@nelson.com',
        password: 'branch123',
        address: 'Nelson Computer Institute, Main Road, City',
        mobile: '8707599763',
        status: 'active',
      },
    });
    console.log('✅ Default branch created: branch@nelson.com / branch123');
  }

  // Create courses
  const existingCourses = await db.course.findFirst();
  if (!existingCourses) {
    await db.course.createMany({
      data: [
        { courseName: 'ADCA', duration: '12 Months', fees: 12000, description: 'Advanced Diploma in Computer Application', icon: 'GraduationCap', category: 'Diploma' },
        { courseName: 'DCA', duration: '6 Months', fees: 8000, description: 'Diploma in Computer Application', icon: 'Monitor', category: 'Diploma' },
        { courseName: 'CCC', duration: '3 Months', fees: 5000, description: 'Course on Computer Concepts', icon: 'BookOpen', category: 'Certificate' },
        { courseName: 'Tally Prime', duration: '3 Months', fees: 6000, description: 'Tally Prime with GST Accounting', icon: 'Calculator', category: 'Accounting' },
        { courseName: 'O Level', duration: '12 Months', fees: 15000, description: 'DOEACC O Level Course', icon: 'Award', category: 'Government' },
        { courseName: 'Python', duration: '6 Months', fees: 10000, description: 'Python Programming with Projects', icon: 'Code', category: 'Programming' },
        { courseName: 'AI Course', duration: '6 Months', fees: 15000, description: 'Artificial Intelligence & Machine Learning', icon: 'Brain', category: 'Advanced' },
        { courseName: 'Web Development', duration: '6 Months', fees: 12000, description: 'Full Stack Web Development', icon: 'Globe', category: 'Programming' },
      ],
    });
    console.log('✅ 8 courses created');
  }

  // Create sample student
  const existingStudent = await db.student.findFirst();
  if (!existingStudent) {
    const branch = await db.branch.findFirst();
    const course = await db.course.findFirst();
    if (branch && course) {
      await db.student.create({
        data: {
          studentName: 'Rahul Kumar',
          fatherName: 'Suresh Kumar',
          mobile: '9876543210',
          email: 'rahul@example.com',
          branchId: branch.id,
          courseId: course.id,
          password: 'student123',
          status: 'active',
        },
      });
      console.log('✅ Sample student created: 9876543210 / student123');
    }
  }

  // Create notices
  const existingNotice = await db.notice.findFirst();
  if (!existingNotice) {
    await db.notice.createMany({
      data: [
        { title: 'Admission Open 2025', content: 'New batch starting from January 2025. Enroll now and get early bird discount!', isActive: true },
        { title: 'CCC Exam Registration', content: 'Last date for CCC exam registration is 15th March 2025. Contact your branch.', isActive: true },
      ],
    });
    console.log('✅ Notices created');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
