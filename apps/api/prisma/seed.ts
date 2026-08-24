import { PrismaClient, AccountStatus, CompanySize, JobStatus, EmploymentType, RemoteType, ExperienceLevel, Currency, SkillLevel, ApplicationStatus, InterviewType, InterviewStatus, InterviewRecommendation, OfferStatus, NotificationType, SubscriptionPlan, SubscriptionStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log('🌱 Seeding database...\n');

  // ─── Clean existing data ─────────────────────────────────
  await prisma.auditLog.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversationParticipant.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.jobAlert.deleteMany();
  await prisma.savedJob.deleteMany();
  await prisma.offer.deleteMany();
  await prisma.interviewFeedback.deleteMany();
  await prisma.interviewParticipant.deleteMany();
  await prisma.interview.deleteMany();
  await prisma.screeningAnswer.deleteMany();
  await prisma.screeningQuestion.deleteMany();
  await prisma.applicationStatusHistory.deleteMany();
  await prisma.application.deleteMany();
  await prisma.jobSkill.deleteMany();
  await prisma.job.deleteMany();
  await prisma.candidateSkill.deleteMany();
  await prisma.candidateLanguage.deleteMany();
  await prisma.certification.deleteMany();
  await prisma.workExperience.deleteMany();
  await prisma.education.deleteMany();
  await prisma.candidateProfile.deleteMany();
  await prisma.recruiterProfile.deleteMany();
  await prisma.companyUser.deleteMany();
  await prisma.company.deleteMany();
  await prisma.resume.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.rolePermission.deleteMany();
  await prisma.userRole.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.role.deleteMany();
  await prisma.user.deleteMany();
  await prisma.tenant.deleteMany();

  const passwordHash = await bcrypt.hash('Password123!', 12);

  // ─── Roles ───────────────────────────────────────────────
  const candidateRole = await prisma.role.create({
    data: { name: 'CANDIDATE', description: 'Job seeker', isSystem: true },
  });
  const recruiterRole = await prisma.role.create({
    data: { name: 'RECRUITER', description: 'Company recruiter', isSystem: true },
  });
  const hiringManagerRole = await prisma.role.create({
    data: { name: 'HIRING_MANAGER', description: 'Company hiring manager', isSystem: true },
  });
  const companyAdminRole = await prisma.role.create({
    data: { name: 'COMPANY_ADMIN', description: 'Company administrator', isSystem: true },
  });
  const platformAdminRole = await prisma.role.create({
    data: { name: 'PLATFORM_ADMIN', description: 'Platform administrator', isSystem: true },
  });

  console.log('  ✅ Roles created');

  // ─── Permissions ─────────────────────────────────────────
  const permissionData = [
    { name: 'profile:manage', category: 'profile', description: 'Manage own profile' },
    { name: 'jobs:view', category: 'jobs', description: 'View published jobs' },
    { name: 'jobs:search', category: 'jobs', description: 'Search jobs' },
    { name: 'jobs:create', category: 'jobs', description: 'Create job postings' },
    { name: 'jobs:manage', category: 'jobs', description: 'Manage own job postings' },
    { name: 'jobs:manage_all', category: 'jobs', description: 'Manage all job postings' },
    { name: 'applications:create', category: 'applications', description: 'Apply to jobs' },
    { name: 'applications:view_own', category: 'applications', description: 'View own applications' },
    { name: 'applications:review', category: 'applications', description: 'Review applications' },
    { name: 'candidates:view', category: 'candidates', description: 'View candidate profiles' },
    { name: 'candidates:feedback', category: 'candidates', description: 'Submit feedback' },
    { name: 'interviews:view_own', category: 'interviews', description: 'View own interviews' },
    { name: 'interviews:schedule', category: 'interviews', description: 'Schedule interviews' },
    { name: 'interviews:participate', category: 'interviews', description: 'Participate in interviews' },
    { name: 'offers:create', category: 'offers', description: 'Create offers' },
    { name: 'messages:send', category: 'messages', description: 'Send messages' },
    { name: 'analytics:view', category: 'analytics', description: 'View analytics' },
    { name: 'company:manage', category: 'company', description: 'Manage company settings' },
    { name: 'users:manage', category: 'users', description: 'Manage users' },
    { name: 'subscription:manage', category: 'subscription', description: 'Manage subscription' },
    { name: 'admin:full', category: 'admin', description: 'Full admin access' },
  ];

  const permissions: Record<string, string> = {};
  for (const p of permissionData) {
    const perm = await prisma.permission.create({ data: p });
    permissions[p.name] = perm.id;
  }
  console.log('  ✅ Permissions created');

  // ─── Tenants ─────────────────────────────────────────────
  const tenantA = await prisma.tenant.create({
    data: { name: 'TechCorp Global', slug: 'techcorp-global' },
  });
  const tenantB = await prisma.tenant.create({
    data: { name: 'DesignStudio Co', slug: 'designstudio-co' },
  });
  console.log('  ✅ Tenants created');

  // ─── Companies ───────────────────────────────────────────
  const companyA = await prisma.company.create({
    data: {
      tenantId: tenantA.id,
      name: 'TechCorp Global',
      slug: 'techcorp-global',
      description: 'A leading technology company specializing in cloud infrastructure and enterprise solutions.',
      industry: 'Technology',
      companySize: CompanySize.LARGE,
      website: 'https://techcorp.example.com',
      location: 'San Francisco, CA',
      foundedYear: 2015,
      benefits: ['Health Insurance', 'Remote Work', 'Stock Options', '401k', 'Unlimited PTO'],
      culture: 'We believe in innovation, collaboration, and continuous learning.',
      isVerified: true,
    },
  });
  const companyB = await prisma.company.create({
    data: {
      tenantId: tenantB.id,
      name: 'DesignStudio Co',
      slug: 'designstudio-co',
      description: 'Creative design agency building beautiful digital experiences for global brands.',
      industry: 'Design',
      companySize: CompanySize.MEDIUM,
      website: 'https://designstudio.example.com',
      location: 'New York, NY',
      foundedYear: 2018,
      benefits: ['Health Insurance', 'Flexible Hours', 'Creative Budget', 'Team Retreats'],
      isVerified: true,
    },
  });
  console.log('  ✅ Companies created');

  // ─── Skills ──────────────────────────────────────────────
  const skillNames = [
    { name: 'TypeScript', category: 'Programming' },
    { name: 'JavaScript', category: 'Programming' },
    { name: 'Python', category: 'Programming' },
    { name: 'React', category: 'Frontend' },
    { name: 'Angular', category: 'Frontend' },
    { name: 'Vue.js', category: 'Frontend' },
    { name: 'Node.js', category: 'Backend' },
    { name: 'NestJS', category: 'Backend' },
    { name: 'PostgreSQL', category: 'Database' },
    { name: 'MongoDB', category: 'Database' },
    { name: 'Redis', category: 'Database' },
    { name: 'Docker', category: 'DevOps' },
    { name: 'Kubernetes', category: 'DevOps' },
    { name: 'AWS', category: 'Cloud' },
    { name: 'GraphQL', category: 'API' },
    { name: 'REST API', category: 'API' },
    { name: 'Figma', category: 'Design' },
    { name: 'UI/UX Design', category: 'Design' },
    { name: 'Git', category: 'Tools' },
    { name: 'Agile/Scrum', category: 'Methodology' },
  ];

  const skills: Record<string, string> = {};
  for (const s of skillNames) {
    const skill = await prisma.skill.create({ data: { ...s, isVerified: true } });
    skills[s.name] = skill.id;
  }
  console.log('  ✅ Skills created');

  // ─── Platform Admin ──────────────────────────────────────
  const admin = await prisma.user.create({
    data: {
      email: 'admin@recruitpro.com',
      passwordHash,
      firstName: 'Platform',
      lastName: 'Admin',
      status: AccountStatus.ACTIVE,
      emailVerified: true,
      userRoles: { create: { roleId: platformAdminRole.id } },
    },
  });
  console.log('  ✅ Platform admin created (admin@recruitpro.com)');

  // ─── Recruiter Users ────────────────────────────────────
  const recruiter1 = await prisma.user.create({
    data: {
      email: 'sarah@techcorp.example.com',
      passwordHash,
      firstName: 'Sarah',
      lastName: 'Chen',
      status: AccountStatus.ACTIVE,
      emailVerified: true,
      tenantId: tenantA.id,
      userRoles: { create: { roleId: recruiterRole.id } },
    },
  });

  await prisma.recruiterProfile.create({
    data: {
      userId: recruiter1.id,
      companyId: companyA.id,
      title: 'Senior Technical Recruiter',
      phone: '+1-555-0101',
      bio: 'Passionate about connecting talented engineers with exciting opportunities.',
    },
  });

  await prisma.companyUser.create({
    data: { companyId: companyA.id, userId: recruiter1.id, role: 'RECRUITER' },
  });

  const recruiter2 = await prisma.user.create({
    data: {
      email: 'james@designstudio.example.com',
      passwordHash,
      firstName: 'James',
      lastName: 'Wilson',
      status: AccountStatus.ACTIVE,
      emailVerified: true,
      tenantId: tenantB.id,
      userRoles: { create: { roleId: recruiterRole.id } },
    },
  });

  await prisma.recruiterProfile.create({
    data: {
      userId: recruiter2.id,
      companyId: companyB.id,
      title: 'Talent Acquisition Lead',
    },
  });

  await prisma.companyUser.create({
    data: { companyId: companyB.id, userId: recruiter2.id, role: 'RECRUITER' },
  });

  console.log('  ✅ Recruiters created');

  // ─── Candidate Users ────────────────────────────────────
  const candidate1 = await prisma.user.create({
    data: {
      email: 'alex@example.com',
      passwordHash,
      firstName: 'Alex',
      lastName: 'Johnson',
      status: AccountStatus.ACTIVE,
      emailVerified: true,
      userRoles: { create: { roleId: candidateRole.id } },
    },
  });

  await prisma.candidateProfile.create({
    data: {
      userId: candidate1.id,
      headline: 'Senior Full-Stack Developer',
      bio: 'Experienced full-stack developer with 7+ years building scalable web applications.',
      location: 'San Francisco, CA',
      phone: '+1-555-0201',
      linkedinUrl: 'https://linkedin.com/in/alexjohnson',
      githubUrl: 'https://github.com/alexjohnson',
      salaryExpectationMin: 150000,
      salaryExpectationMax: 200000,
      salaryCurrency: Currency.USD,
      employmentTypePreference: [EmploymentType.FULL_TIME],
      remotePreference: RemoteType.HYBRID,
      noticePeriodDays: 30,
      profileCompleteness: 85,
      skills: {
        createMany: {
          data: [
            { skillId: skills['TypeScript'], level: SkillLevel.EXPERT, yearsOfExperience: 5 },
            { skillId: skills['React'], level: SkillLevel.EXPERT, yearsOfExperience: 6 },
            { skillId: skills['Node.js'], level: SkillLevel.ADVANCED, yearsOfExperience: 5 },
            { skillId: skills['PostgreSQL'], level: SkillLevel.ADVANCED, yearsOfExperience: 4 },
            { skillId: skills['Docker'], level: SkillLevel.INTERMEDIATE, yearsOfExperience: 3 },
            { skillId: skills['AWS'], level: SkillLevel.INTERMEDIATE, yearsOfExperience: 3 },
          ],
        },
      },
      education: {
        create: {
          institution: 'Stanford University',
          degree: 'Bachelor of Science',
          fieldOfStudy: 'Computer Science',
          startDate: new Date('2013-09-01'),
          endDate: new Date('2017-06-15'),
          grade: '3.8 GPA',
        },
      },
      workExperience: {
        createMany: {
          data: [
            {
              company: 'TechStartup Inc.',
              title: 'Senior Full-Stack Developer',
              location: 'San Francisco, CA',
              startDate: new Date('2021-03-01'),
              isCurrent: true,
              description: 'Leading a team of 5 engineers building a SaaS platform.',
            },
            {
              company: 'BigTech Corp',
              title: 'Software Engineer',
              location: 'Mountain View, CA',
              startDate: new Date('2017-07-01'),
              endDate: new Date('2021-02-28'),
              description: 'Built microservices handling 10M+ requests per day.',
            },
          ],
        },
      },
    },
  });

  const candidate2 = await prisma.user.create({
    data: {
      email: 'maria@example.com',
      passwordHash,
      firstName: 'Maria',
      lastName: 'Garcia',
      status: AccountStatus.ACTIVE,
      emailVerified: true,
      userRoles: { create: { roleId: candidateRole.id } },
    },
  });

  await prisma.candidateProfile.create({
    data: {
      userId: candidate2.id,
      headline: 'UI/UX Designer & Frontend Developer',
      bio: 'Creative designer with strong coding skills and 5 years of experience.',
      location: 'New York, NY',
      salaryExpectationMin: 120000,
      salaryExpectationMax: 160000,
      salaryCurrency: Currency.USD,
      remotePreference: RemoteType.REMOTE,
      profileCompleteness: 70,
      skills: {
        createMany: {
          data: [
            { skillId: skills['Figma'], level: SkillLevel.EXPERT, yearsOfExperience: 5 },
            { skillId: skills['UI/UX Design'], level: SkillLevel.EXPERT, yearsOfExperience: 5 },
            { skillId: skills['React'], level: SkillLevel.ADVANCED, yearsOfExperience: 3 },
            { skillId: skills['TypeScript'], level: SkillLevel.INTERMEDIATE, yearsOfExperience: 2 },
          ],
        },
      },
    },
  });

  console.log('  ✅ Candidates created');

  // ─── Jobs ────────────────────────────────────────────────
  const job1 = await prisma.job.create({
    data: {
      tenantId: tenantA.id,
      companyId: companyA.id,
      createdById: recruiter1.id,
      title: 'Senior Backend Engineer',
      slug: 'senior-backend-engineer-techcorp',
      description: 'We are looking for a Senior Backend Engineer to design and build scalable APIs and microservices. You will work closely with our platform team to deliver high-performance solutions serving millions of users.',
      responsibilities: '- Design and implement RESTful APIs\n- Build microservices using Node.js and TypeScript\n- Optimize database queries and data models\n- Mentor junior developers\n- Participate in architecture decisions',
      requirements: '- 5+ years of backend development experience\n- Strong TypeScript/Node.js skills\n- Experience with PostgreSQL and Redis\n- Understanding of distributed systems\n- Excellent problem-solving skills',
      experienceLevel: ExperienceLevel.SENIOR,
      salaryMin: 160000,
      salaryMax: 220000,
      currency: Currency.USD,
      employmentType: EmploymentType.FULL_TIME,
      remoteType: RemoteType.HYBRID,
      location: 'San Francisco, CA',
      department: 'Engineering',
      benefits: ['Health Insurance', 'Stock Options', 'Remote Work', '401k Match'],
      numberOfOpenings: 2,
      status: JobStatus.PUBLISHED,
      publishedAt: new Date(),
      viewsCount: 342,
      skills: {
        createMany: {
          data: [
            { skillId: skills['TypeScript'], isRequired: true },
            { skillId: skills['Node.js'], isRequired: true },
            { skillId: skills['PostgreSQL'], isRequired: true },
            { skillId: skills['Redis'], isRequired: false },
            { skillId: skills['Docker'], isRequired: false },
            { skillId: skills['AWS'], isRequired: false },
          ],
        },
      },
      screeningQuestions: {
        createMany: {
          data: [
            { question: 'Are you authorized to work in the United States?', type: 'YES_NO', isRequired: true, orderIndex: 0 },
            { question: 'How many years of Node.js experience do you have?', type: 'NUMERIC', isRequired: true, orderIndex: 1 },
            { question: 'Describe your experience with distributed systems.', type: 'TEXT', isRequired: false, orderIndex: 2 },
          ],
        },
      },
    },
  });

  const job2 = await prisma.job.create({
    data: {
      tenantId: tenantA.id,
      companyId: companyA.id,
      createdById: recruiter1.id,
      title: 'Frontend Developer (React)',
      slug: 'frontend-developer-react-techcorp',
      description: 'Join our frontend team to build beautiful, performant user interfaces for our cloud platform.',
      experienceLevel: ExperienceLevel.MID,
      salaryMin: 120000,
      salaryMax: 170000,
      currency: Currency.USD,
      employmentType: EmploymentType.FULL_TIME,
      remoteType: RemoteType.REMOTE,
      location: 'Remote, US',
      department: 'Engineering',
      numberOfOpenings: 3,
      status: JobStatus.PUBLISHED,
      publishedAt: new Date(),
      viewsCount: 567,
      skills: {
        createMany: {
          data: [
            { skillId: skills['React'], isRequired: true },
            { skillId: skills['TypeScript'], isRequired: true },
            { skillId: skills['GraphQL'], isRequired: false },
          ],
        },
      },
    },
  });

  const job3 = await prisma.job.create({
    data: {
      tenantId: tenantB.id,
      companyId: companyB.id,
      createdById: recruiter2.id,
      title: 'Senior UI/UX Designer',
      slug: 'senior-uiux-designer-designstudio',
      description: 'Lead the design of innovative digital products for our Fortune 500 clients.',
      experienceLevel: ExperienceLevel.SENIOR,
      salaryMin: 130000,
      salaryMax: 180000,
      currency: Currency.USD,
      employmentType: EmploymentType.FULL_TIME,
      remoteType: RemoteType.HYBRID,
      location: 'New York, NY',
      department: 'Design',
      numberOfOpenings: 1,
      status: JobStatus.PUBLISHED,
      publishedAt: new Date(),
      viewsCount: 234,
      skills: {
        createMany: {
          data: [
            { skillId: skills['Figma'], isRequired: true },
            { skillId: skills['UI/UX Design'], isRequired: true },
          ],
        },
      },
    },
  });

  console.log('  ✅ Jobs created');

  // ─── Subscriptions ───────────────────────────────────────
  await prisma.subscription.create({
    data: {
      tenantId: tenantA.id,
      plan: SubscriptionPlan.PROFESSIONAL,
      status: SubscriptionStatus.ACTIVE,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.subscription.create({
    data: {
      tenantId: tenantB.id,
      plan: SubscriptionPlan.STARTER,
      status: SubscriptionStatus.ACTIVE,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  console.log('  ✅ Subscriptions created');

  console.log('\n🎉 Seed completed successfully!');
  console.log('\n  Test Accounts (password: Password123!):');
  console.log('  ─────────────────────────────────────────');
  console.log('  Admin:     admin@recruitpro.com');
  console.log('  Recruiter: sarah@techcorp.example.com');
  console.log('  Recruiter: james@designstudio.example.com');
  console.log('  Candidate: alex@example.com');
  console.log('  Candidate: maria@example.com');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
