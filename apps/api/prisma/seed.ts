import { PrismaClient, AccountStatus, CompanySize, JobStatus, EmploymentType, RemoteType, ExperienceLevel, Currency, SkillLevel, ApplicationStatus, InterviewType, InterviewStatus, InterviewRecommendation, OfferStatus, NotificationType, SubscriptionPlan, SubscriptionStatus, PaymentStatus } from '@prisma/client';
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
  await prisma.skill.deleteMany();
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

  // ─── Role → Permission grants ─────────────────────────────
  const grant = async (roleId: string, permissionNames: string[]): Promise<void> => {
    await prisma.rolePermission.createMany({
      data: permissionNames.map((name) => ({ roleId, permissionId: permissions[name] })),
    });
  };

  await grant(candidateRole.id, [
    'profile:manage',
    'jobs:view',
    'jobs:search',
    'applications:create',
    'applications:view_own',
    'interviews:view_own',
    'interviews:participate',
    'messages:send',
  ]);
  await grant(hiringManagerRole.id, [
    'profile:manage',
    'jobs:view',
    'candidates:view',
    'candidates:feedback',
    'interviews:view_own',
    'interviews:participate',
    'analytics:view',
    'messages:send',
  ]);
  await grant(recruiterRole.id, [
    'profile:manage',
    'jobs:view',
    'jobs:search',
    'jobs:create',
    'jobs:manage',
    'applications:view_own',
    'applications:review',
    'candidates:view',
    'candidates:feedback',
    'interviews:view_own',
    'interviews:schedule',
    'interviews:participate',
    'offers:create',
    'messages:send',
    'analytics:view',
  ]);
  await grant(companyAdminRole.id, [
    'profile:manage',
    'jobs:view',
    'jobs:search',
    'jobs:create',
    'jobs:manage',
    'applications:view_own',
    'applications:review',
    'candidates:view',
    'candidates:feedback',
    'interviews:view_own',
    'interviews:schedule',
    'interviews:participate',
    'offers:create',
    'messages:send',
    'analytics:view',
    'company:manage',
    'users:manage',
    'subscription:manage',
  ]);
  await grant(platformAdminRole.id, ['admin:full', 'jobs:manage_all', 'users:manage']);

  console.log('  ✅ Role permissions granted');

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
      certifications: {
        create: {
          name: 'AWS Certified Solutions Architect – Associate',
          issuingOrganization: 'Amazon Web Services',
          issueDate: new Date('2022-04-10'),
          expiryDate: new Date('2025-04-10'),
          credentialId: 'AWS-CSA-2022-88213',
          credentialUrl: 'https://www.credly.com/badges/example-alex',
        },
      },
      languages: {
        createMany: {
          data: [
            { language: 'English', proficiency: 'Native' },
            { language: 'Spanish', proficiency: 'Intermediate' },
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
      education: {
        create: {
          institution: 'Parsons School of Design',
          degree: 'Bachelor of Fine Arts',
          fieldOfStudy: 'Design & Technology',
          startDate: new Date('2015-09-01'),
          endDate: new Date('2019-05-20'),
        },
      },
      workExperience: {
        create: {
          company: 'Creative Pixel Agency',
          title: 'UI/UX Designer',
          location: 'New York, NY',
          startDate: new Date('2019-07-01'),
          isCurrent: true,
          description: 'Designing end-to-end product experiences for SaaS and mobile clients.',
        },
      },
      languages: {
        create: { language: 'English', proficiency: 'Native' },
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

  // ─── Resumes ─────────────────────────────────────────────
  const resume1 = await prisma.resume.create({
    data: {
      userId: candidate1.id,
      fileName: 'Alex_Johnson_Resume.pdf',
      filePath: '/uploads/resumes/alex-johnson-resume-v2.pdf',
      fileSize: 184320,
      mimeType: 'application/pdf',
      version: 2,
      isDefault: true,
    },
  });
  await prisma.resume.create({
    data: {
      userId: candidate1.id,
      fileName: 'Alex_Johnson_Resume_v1.pdf',
      filePath: '/uploads/resumes/alex-johnson-resume-v1.pdf',
      fileSize: 172032,
      mimeType: 'application/pdf',
      version: 1,
      isDefault: false,
    },
  });
  const resume2 = await prisma.resume.create({
    data: {
      userId: candidate2.id,
      fileName: 'Maria_Garcia_Resume.pdf',
      filePath: '/uploads/resumes/maria-garcia-resume.pdf',
      fileSize: 156672,
      mimeType: 'application/pdf',
      version: 1,
      isDefault: true,
    },
  });
  console.log('  ✅ Resumes created');

  // ─── Applications ────────────────────────────────────────
  const now = Date.now();
  const daysAgo = (n: number): Date => new Date(now - n * 24 * 60 * 60 * 1000);

  // App1: Alex -> Senior Backend Engineer (TechCorp) — full journey to HIRED
  const app1 = await prisma.application.create({
    data: {
      jobId: job1.id,
      candidateId: candidate1.id,
      resumeId: resume1.id,
      status: ApplicationStatus.HIRED,
      coverLetter: "I've spent the last five years building high-throughput backend services and would love to bring that experience to TechCorp's platform team.",
      appliedAt: daysAgo(21),
    },
  });
  await prisma.applicationStatusHistory.createMany({
    data: [
      { applicationId: app1.id, previousStatus: null, newStatus: ApplicationStatus.APPLIED, changedById: candidate1.id, createdAt: daysAgo(21) },
      { applicationId: app1.id, previousStatus: ApplicationStatus.APPLIED, newStatus: ApplicationStatus.UNDER_REVIEW, changedById: recruiter1.id, notes: 'Strong resume, moving to review.', createdAt: daysAgo(18) },
      { applicationId: app1.id, previousStatus: ApplicationStatus.UNDER_REVIEW, newStatus: ApplicationStatus.SHORTLISTED, changedById: recruiter1.id, notes: 'Great match on required skills.', createdAt: daysAgo(15) },
      { applicationId: app1.id, previousStatus: ApplicationStatus.SHORTLISTED, newStatus: ApplicationStatus.INTERVIEW, changedById: recruiter1.id, notes: 'Interview scheduled', createdAt: daysAgo(12) },
      { applicationId: app1.id, previousStatus: ApplicationStatus.INTERVIEW, newStatus: ApplicationStatus.OFFERED, changedById: recruiter1.id, notes: 'Offer sent', createdAt: daysAgo(6) },
      { applicationId: app1.id, previousStatus: ApplicationStatus.OFFERED, newStatus: ApplicationStatus.HIRED, changedById: candidate1.id, notes: 'Candidate accepted the offer', createdAt: daysAgo(3) },
    ],
  });

  const job1Questions = await prisma.screeningQuestion.findMany({
    where: { jobId: job1.id },
    orderBy: { orderIndex: 'asc' },
  });
  if (job1Questions.length === 3) {
    await prisma.screeningAnswer.createMany({
      data: [
        { applicationId: app1.id, questionId: job1Questions[0].id, answer: 'Yes' },
        { applicationId: app1.id, questionId: job1Questions[1].id, answer: '6' },
        { applicationId: app1.id, questionId: job1Questions[2].id, answer: 'I designed and operated an event-driven order pipeline processing 2M+ events/day across a dozen microservices, with a focus on idempotency and observability.' },
      ],
    });
  }

  // App2: Alex -> Frontend Developer (TechCorp) — still under review
  const app2 = await prisma.application.create({
    data: {
      jobId: job2.id,
      candidateId: candidate1.id,
      resumeId: resume1.id,
      status: ApplicationStatus.UNDER_REVIEW,
      coverLetter: 'While backend is my primary focus, I have deep React experience from full-stack projects and would enjoy contributing to the frontend team.',
      appliedAt: daysAgo(9),
    },
  });
  await prisma.applicationStatusHistory.createMany({
    data: [
      { applicationId: app2.id, previousStatus: null, newStatus: ApplicationStatus.APPLIED, changedById: candidate1.id, createdAt: daysAgo(9) },
      { applicationId: app2.id, previousStatus: ApplicationStatus.APPLIED, newStatus: ApplicationStatus.UNDER_REVIEW, changedById: recruiter1.id, createdAt: daysAgo(7) },
    ],
  });

  // App3: Maria -> Senior UI/UX Designer (DesignStudio) — upcoming interview
  const app3 = await prisma.application.create({
    data: {
      jobId: job3.id,
      candidateId: candidate2.id,
      resumeId: resume2.id,
      status: ApplicationStatus.INTERVIEW,
      coverLetter: "I'd love to bring my product design background to DesignStudio's Fortune 500 client work.",
      appliedAt: daysAgo(10),
    },
  });
  await prisma.applicationStatusHistory.createMany({
    data: [
      { applicationId: app3.id, previousStatus: null, newStatus: ApplicationStatus.APPLIED, changedById: candidate2.id, createdAt: daysAgo(10) },
      { applicationId: app3.id, previousStatus: ApplicationStatus.APPLIED, newStatus: ApplicationStatus.SHORTLISTED, changedById: recruiter2.id, notes: 'Portfolio is excellent.', createdAt: daysAgo(8) },
      { applicationId: app3.id, previousStatus: ApplicationStatus.SHORTLISTED, newStatus: ApplicationStatus.INTERVIEW, changedById: recruiter2.id, notes: 'Interview scheduled', createdAt: daysAgo(2) },
    ],
  });

  // App4: Maria -> Senior Backend Engineer (TechCorp) — rejected, wrong specialization
  const app4 = await prisma.application.create({
    data: {
      jobId: job1.id,
      candidateId: candidate2.id,
      resumeId: resume2.id,
      status: ApplicationStatus.REJECTED,
      appliedAt: daysAgo(14),
    },
  });
  await prisma.applicationStatusHistory.createMany({
    data: [
      { applicationId: app4.id, previousStatus: null, newStatus: ApplicationStatus.APPLIED, changedById: candidate2.id, createdAt: daysAgo(14) },
      { applicationId: app4.id, previousStatus: ApplicationStatus.APPLIED, newStatus: ApplicationStatus.UNDER_REVIEW, changedById: recruiter1.id, createdAt: daysAgo(12) },
      { applicationId: app4.id, previousStatus: ApplicationStatus.UNDER_REVIEW, newStatus: ApplicationStatus.REJECTED, changedById: recruiter1.id, notes: 'Background is design-focused, not a fit for this backend role.', createdAt: daysAgo(11) },
    ],
  });

  console.log('  ✅ Applications created');

  // ─── Interviews ──────────────────────────────────────────
  // Interview1: App1 (Alex/Backend) — completed, with feedback
  const interview1 = await prisma.interview.create({
    data: {
      applicationId: app1.id,
      type: InterviewType.TECHNICAL,
      title: 'Backend Technical Interview',
      scheduledAt: daysAgo(11),
      duration: 60,
      location: null,
      meetingUrl: 'https://meet.example.com/techcorp-alex-technical',
      status: InterviewStatus.COMPLETED,
      notes: 'Focus on system design and API architecture.',
    },
  });
  await prisma.interviewParticipant.createMany({
    data: [
      { interviewId: interview1.id, userId: recruiter1.id, role: 'INTERVIEWER' },
      { interviewId: interview1.id, userId: candidate1.id, role: 'CANDIDATE' },
    ],
  });
  await prisma.interviewFeedback.create({
    data: {
      interviewId: interview1.id,
      reviewerId: recruiter1.id,
      overallRating: 5,
      technicalRating: 5,
      communicationRating: 4,
      cultureFitRating: 5,
      strengths: 'Excellent grasp of distributed systems, clear communicator, asked great clarifying questions.',
      weaknesses: 'Limited exposure to Kubernetes, but a fast learner.',
      recommendation: InterviewRecommendation.STRONG_HIRE,
      privateNotes: 'Top candidate this quarter — fast-track the offer.',
    },
  });

  // Interview2: App3 (Maria/Design) — upcoming, no feedback yet
  const interview2 = await prisma.interview.create({
    data: {
      applicationId: app3.id,
      type: InterviewType.VIDEO,
      title: 'Portfolio Review & Design Chat',
      scheduledAt: new Date(now + 3 * 24 * 60 * 60 * 1000),
      duration: 45,
      meetingUrl: 'https://meet.example.com/designstudio-maria-portfolio',
      status: InterviewStatus.SCHEDULED,
      notes: 'Candidate will walk through 2-3 case studies from their portfolio.',
    },
  });
  await prisma.interviewParticipant.createMany({
    data: [
      { interviewId: interview2.id, userId: recruiter2.id, role: 'INTERVIEWER' },
      { interviewId: interview2.id, userId: candidate2.id, role: 'CANDIDATE' },
    ],
  });

  console.log('  ✅ Interviews created');

  // ─── Offers ──────────────────────────────────────────────
  await prisma.offer.create({
    data: {
      applicationId: app1.id,
      candidateId: candidate1.id,
      salary: 195000,
      currency: Currency.USD,
      benefits: 'Health, dental, and vision insurance; 401k match up to 4%; unlimited PTO; annual $2,000 learning stipend.',
      startDate: new Date(now + 21 * 24 * 60 * 60 * 1000),
      employmentType: EmploymentType.FULL_TIME,
      expirationDate: new Date(now + 4 * 24 * 60 * 60 * 1000),
      additionalTerms: 'Includes a one-time $10,000 signing bonus and equity grant of 5,000 RSUs vesting over 4 years.',
      status: OfferStatus.ACCEPTED,
      respondedAt: daysAgo(3),
      createdById: recruiter1.id,
    },
  });

  console.log('  ✅ Offers created');

  // ─── Saved Jobs & Job Alerts ─────────────────────────────
  await prisma.savedJob.createMany({
    data: [
      { userId: candidate2.id, jobId: job1.id },
      { userId: candidate2.id, jobId: job2.id },
      { userId: candidate1.id, jobId: job3.id },
    ],
  });

  await prisma.jobAlert.createMany({
    data: [
      {
        userId: candidate1.id,
        title: 'Senior Backend Roles',
        keywords: ['backend', 'node.js', 'distributed systems'],
        skills: ['TypeScript', 'Node.js', 'PostgreSQL'],
        remoteType: RemoteType.HYBRID,
        employmentType: EmploymentType.FULL_TIME,
        minSalary: 160000,
        currency: Currency.USD,
      },
      {
        userId: candidate2.id,
        title: 'Remote Design Roles',
        keywords: ['ui', 'ux', 'product design'],
        skills: ['Figma', 'UI/UX Design'],
        remoteType: RemoteType.REMOTE,
        minSalary: 120000,
        currency: Currency.USD,
      },
    ],
  });

  console.log('  ✅ Saved jobs & job alerts created');

  // ─── Notifications ───────────────────────────────────────
  await prisma.notification.createMany({
    data: [
      {
        userId: candidate1.id,
        type: NotificationType.INTERVIEW_SCHEDULED,
        title: 'Interview scheduled',
        message: 'An interview "Backend Technical Interview" has been scheduled.',
        isRead: true,
        readAt: daysAgo(11),
        createdAt: daysAgo(12),
      },
      {
        userId: candidate1.id,
        type: NotificationType.OFFER_RECEIVED,
        title: 'New job offer',
        message: 'You have received an offer for "Senior Backend Engineer"',
        isRead: true,
        readAt: daysAgo(5),
        createdAt: daysAgo(6),
      },
      {
        userId: candidate1.id,
        type: NotificationType.MESSAGE_RECEIVED,
        title: 'New message',
        message: 'Sarah Chen sent you a message',
        isRead: false,
        createdAt: daysAgo(1),
      },
      {
        userId: candidate2.id,
        type: NotificationType.APPLICATION_STATUS_CHANGED,
        title: 'Application status updated',
        message: 'Your application status changed to rejected',
        isRead: true,
        readAt: daysAgo(10),
        createdAt: daysAgo(11),
      },
      {
        userId: candidate2.id,
        type: NotificationType.CANDIDATE_SHORTLISTED,
        title: 'You have been shortlisted',
        message: 'Your application for "Senior UI/UX Designer" was shortlisted.',
        isRead: true,
        readAt: daysAgo(7),
        createdAt: daysAgo(8),
      },
      {
        userId: candidate2.id,
        type: NotificationType.INTERVIEW_SCHEDULED,
        title: 'Interview scheduled',
        message: 'An interview "Portfolio Review & Design Chat" has been scheduled.',
        isRead: false,
        createdAt: daysAgo(2),
      },
      {
        userId: recruiter1.id,
        type: NotificationType.APPLICATION_SUBMITTED,
        title: 'New application received',
        message: 'A candidate applied to "Senior Backend Engineer"',
        isRead: true,
        readAt: daysAgo(20),
        createdAt: daysAgo(21),
      },
      {
        userId: recruiter1.id,
        type: NotificationType.OFFER_ACCEPTED,
        title: 'Offer accepted',
        message: 'The candidate has accepted the offer for "Senior Backend Engineer"',
        isRead: false,
        createdAt: daysAgo(3),
      },
      {
        userId: recruiter2.id,
        type: NotificationType.APPLICATION_SUBMITTED,
        title: 'New application received',
        message: 'A candidate applied to "Senior UI/UX Designer"',
        isRead: false,
        createdAt: daysAgo(10),
      },
    ],
  });

  console.log('  ✅ Notifications created');

  // ─── Messaging ───────────────────────────────────────────
  const conversation1 = await prisma.conversation.create({
    data: {
      participants: {
        createMany: { data: [{ userId: recruiter1.id }, { userId: candidate1.id }] },
      },
    },
  });
  await prisma.message.createMany({
    data: [
      { conversationId: conversation1.id, senderId: recruiter1.id, content: 'Hi Alex, thanks for applying! Are you available for a technical interview next week?', createdAt: daysAgo(13) },
      { conversationId: conversation1.id, senderId: candidate1.id, content: "Hi Sarah, yes I'm available Tuesday or Wednesday afternoon.", createdAt: daysAgo(13) },
      { conversationId: conversation1.id, senderId: recruiter1.id, content: "Great, I've scheduled you for Wednesday. Looking forward to it!", createdAt: daysAgo(12) },
      { conversationId: conversation1.id, senderId: recruiter1.id, content: 'Congrats again on the offer, Alex — excited to have you on the team!', createdAt: daysAgo(1) },
    ],
  });

  const conversation2 = await prisma.conversation.create({
    data: {
      participants: {
        createMany: { data: [{ userId: recruiter2.id }, { userId: candidate2.id }] },
      },
    },
  });
  await prisma.message.createMany({
    data: [
      { conversationId: conversation2.id, senderId: recruiter2.id, content: 'Hi Maria, loved your portfolio! Do you have time for a chat this week?', createdAt: daysAgo(3) },
      { conversationId: conversation2.id, senderId: candidate2.id, content: "Thank you! I'm free Thursday or Friday.", createdAt: daysAgo(2) },
    ],
  });

  console.log('  ✅ Conversations & messages created');

  // ─── Subscriptions ───────────────────────────────────────
  const subscriptionA = await prisma.subscription.create({
    data: {
      tenantId: tenantA.id,
      plan: SubscriptionPlan.PROFESSIONAL,
      status: SubscriptionStatus.ACTIVE,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  const subscriptionB = await prisma.subscription.create({
    data: {
      tenantId: tenantB.id,
      plan: SubscriptionPlan.STARTER,
      status: SubscriptionStatus.ACTIVE,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  console.log('  ✅ Subscriptions created');

  // ─── Payments ────────────────────────────────────────────
  await prisma.payment.createMany({
    data: [
      {
        subscriptionId: subscriptionA.id,
        amount: 14900,
        currency: Currency.USD,
        status: PaymentStatus.COMPLETED,
        paidAt: daysAgo(2),
      },
      {
        subscriptionId: subscriptionB.id,
        amount: 4900,
        currency: Currency.USD,
        status: PaymentStatus.COMPLETED,
        paidAt: daysAgo(5),
      },
    ],
  });

  console.log('  ✅ Payments created');

  // ─── Audit Logs ──────────────────────────────────────────
  await prisma.auditLog.createMany({
    data: [
      { userId: recruiter1.id, tenantId: tenantA.id, action: 'JOB_CREATED', entityType: 'Job', entityId: job1.id, newValue: { title: job1.title, status: job1.status }, createdAt: daysAgo(25) },
      { userId: recruiter1.id, tenantId: tenantA.id, action: 'JOB_CREATED', entityType: 'Job', entityId: job2.id, newValue: { title: job2.title, status: job2.status }, createdAt: daysAgo(24) },
      { userId: recruiter2.id, tenantId: tenantB.id, action: 'JOB_CREATED', entityType: 'Job', entityId: job3.id, newValue: { title: job3.title, status: job3.status }, createdAt: daysAgo(23) },
      { userId: recruiter1.id, tenantId: tenantA.id, action: 'INTERVIEW_SCHEDULED', entityType: 'Interview', entityId: interview1.id, newValue: { title: interview1.title }, createdAt: daysAgo(12) },
      { userId: recruiter1.id, tenantId: tenantA.id, action: 'OFFER_SENT', entityType: 'Offer', entityId: app1.id, newValue: { status: 'SENT' }, createdAt: daysAgo(6) },
      { userId: candidate1.id, tenantId: tenantA.id, action: 'OFFER_ACCEPTED', entityType: 'Offer', entityId: app1.id, newValue: { status: 'ACCEPTED' }, createdAt: daysAgo(3) },
      { userId: recruiter1.id, tenantId: tenantA.id, action: 'APPLICATION_STATUS_CHANGED', entityType: 'Application', entityId: app4.id, previousValue: { status: 'UNDER_REVIEW' }, newValue: { status: 'REJECTED' }, createdAt: daysAgo(11) },
      { userId: null, tenantId: tenantA.id, action: 'SUBSCRIPTION_CREATED', entityType: 'Subscription', entityId: subscriptionA.id, newValue: { plan: 'PROFESSIONAL' }, createdAt: daysAgo(30) },
      { userId: null, tenantId: tenantB.id, action: 'SUBSCRIPTION_CREATED', entityType: 'Subscription', entityId: subscriptionB.id, newValue: { plan: 'STARTER' }, createdAt: daysAgo(30) },
    ],
  });

  console.log('  ✅ Audit logs created');

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
