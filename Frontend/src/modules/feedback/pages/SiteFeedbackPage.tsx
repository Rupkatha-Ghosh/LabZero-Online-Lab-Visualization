import {
  AlertCircle,
  ArrowLeft,
  BarChart3,
  BookOpenCheck,
  CheckCircle2,
  CheckSquare,
  FileText,
  ListChecks,
  Loader2,
  Radio,
  Send,
  Star,
  Users,
  Video,
} from 'lucide-react';
import { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { User, UserRole } from '../../../types/types';
import FeedbackPageShell from '../components/common/FeedbackPageShell';
import { getFeedbackApiError, submitSiteFeedback } from '../services/feedbackApi';

interface SiteFeedbackPageProps {
  user: User | null;
  theme: 'dark' | 'light';
  onBack: () => void;
  onLogin: () => void;
  onSubmitted?: () => void;
}

const platformFeatures = [
  { label: 'Classroom management', icon: Users },
  { label: 'Notes and PDF sharing', icon: FileText },
  { label: 'Assignment distribution', icon: CheckSquare },
  { label: 'Student-teacher interaction', icon: BookOpenCheck },
  { label: 'Online live class integration', icon: Video },
  { label: 'Feedback collection and analysis', icon: BarChart3 },
];

type RoleFeedbackConfig = {
  badge: string;
  title: string;
  description: string;
  fields: {
    course: { label: string; placeholder: string };
    classroom: { label: string; placeholder: string };
    teacher: { label: string; placeholder: string };
    session: { label: string; placeholder: string };
  };
  feedbackAreas: string[];
  usageSteps: string[];
};

const roleFeedbackConfig: Record<UserRole, RoleFeedbackConfig> = {
  student: {
    badge: 'Student Feedback',
    title: 'Student learning feedback',
    description:
      'Share feedback about your course, teacher, live class, resources, assignments, and overall learning experience.',
    fields: {
      course: { label: 'Course', placeholder: 'Example: Physics' },
      classroom: { label: 'Classroom', placeholder: 'Example: Class 11 A' },
      teacher: { label: 'Teacher', placeholder: 'Teacher name' },
      session: { label: 'Session', placeholder: 'Example: Live class / Lab session' },
    },
    feedbackAreas: [
      'Platform usability',
      'Teaching effectiveness',
      'Classroom experience',
      'System performance',
    ],
    usageSteps: [
      'Login/Register with a student account.',
      'Open the feedback page from the floating feedback button or Dashboard -> Feedback.',
      'Select Course, Classroom, Teacher, and Session.',
      'Answer learning experience, rating, checkbox, radio, and text feedback questions.',
      'Submit feedback for teacher and platform improvement.',
    ],
  },
  teacher: {
    badge: 'Teacher Feedback',
    title: 'Teacher workflow feedback',
    description:
      'Share feedback about classroom management, resource delivery, student interaction, assignments, and live teaching tools.',
    fields: {
      course: { label: 'Course / Subject', placeholder: 'Example: Chemistry' },
      classroom: { label: 'Classroom handled', placeholder: 'Example: Class 12 B' },
      teacher: { label: 'Student group', placeholder: 'Example: Batch A / Section 2' },
      session: { label: 'Teaching session', placeholder: 'Example: Weekly live lecture' },
    },
    feedbackAreas: [
      'Classroom management',
      'Resource sharing workflow',
      'Student interaction',
      'Live class performance',
    ],
    usageSteps: [
      'Login/Register with a teacher account.',
      'Open the feedback page from the floating feedback button or Dashboard -> Feedback.',
      'Select Course, Classroom, Student Group, and Teaching Session.',
      'Answer workflow, resource sharing, live class, and interaction feedback questions.',
      'Submit feedback for institute and platform improvement.',
    ],
  },
  institute: {
    badge: 'Institute Feedback',
    title: 'Institute management feedback',
    description:
      'Share feedback about department operations, classroom analytics, teacher coordination, system performance, and platform adoption.',
    fields: {
      course: { label: 'Department / Program', placeholder: 'Example: Science Department' },
      classroom: { label: 'Classroom / Cohort', placeholder: 'Example: Senior Secondary' },
      teacher: { label: 'Coordinator / Teacher', placeholder: 'Coordinator or teacher name' },
      session: { label: 'Review period', placeholder: 'Example: May 2026' },
    },
    feedbackAreas: [
      'Academic operations',
      'Teacher coordination',
      'Analytics dashboard',
      'System scalability',
    ],
    usageSteps: [
      'Login/Register with an institute account.',
      'Open the feedback page from the floating feedback button or Dashboard -> Feedback.',
      'Select Department, Classroom/Cohort, Coordinator, and Review Period.',
      'Answer operations, analytics, coordination, and system performance questions.',
      'Submit feedback for platform planning and institutional reporting.',
    ],
  },
};

const questionTypes = [
  { label: 'Text Feedback', icon: FileText },
  { label: 'Rating Scale', icon: Star },
  { label: 'Checkbox Questions', icon: CheckSquare },
  { label: 'Radio Questions', icon: Radio },
  { label: 'Dropdown Questions', icon: ListChecks },
];

const studentTextQuestions = [
  {
    id: 'mostHelpfulFeature',
    label: 'What feature of LabZero helped you most in learning?',
    placeholder: 'Example: live classes, lab visualizations, notes, chat, assignments...',
  },
  {
    id: 'difficulties',
    label: 'What difficulties did you face while using the platform?',
    placeholder: 'Share login, navigation, loading, classroom, resource, or device issues.',
  },
  {
    id: 'onlineClassExperience',
    label: 'Describe your experience during online classes.',
    placeholder: 'Tell us about interaction, clarity, audio/video quality, and participation.',
  },
  {
    id: 'improvements',
    label: 'What improvements would you suggest for better learning?',
    placeholder: 'Suggest changes that would make LabZero more useful for your studies.',
  },
  {
    id: 'additionalComments',
    label: 'Any additional comments regarding student experience?',
    placeholder: 'Add anything else you want your teacher or the LabZero team to know.',
  },
] as const;

const studentRatingQuestions = [
  { id: 'overallUsability', label: 'Rate the overall usability of LabZero.' },
  { id: 'classroomInteraction', label: 'Rate the quality of classroom interaction.' },
  { id: 'studyMaterialsAccess', label: 'Rate the ease of accessing study materials.' },
  { id: 'platformSpeed', label: 'Rate the responsiveness/speed of the platform.' },
  { id: 'overallLearning', label: 'Rate your overall learning experience.' },
] as const;

const studentCheckboxQuestions = [
  {
    id: 'regularFeatures',
    label: 'Which features do you use regularly?',
    options: [
      'Live Classes',
      'Notes/PDF Sharing',
      'Assignment Submission',
      'Classroom Chat',
      'Recorded Sessions',
      'Virtual Labs',
      'Quizzes / Practice Tasks',
    ],
  },
  {
    id: 'desiredImprovements',
    label: 'What improvements would you like?',
    options: [
      'Better UI Design',
      'Faster Loading',
      'More Interactive Features',
      'Mobile Optimization',
      'Better Notifications',
      'More Recorded Sessions',
      'Clearer Assignment Tracking',
    ],
  },
  {
    id: 'devicesUsed',
    label: 'Which devices do you use for LabZero?',
    options: ['Mobile', 'Laptop', 'Tablet', 'Desktop'],
  },
] as const;

const studentRadioQuestions = [
  {
    id: 'usageFrequency',
    label: 'How often do you use LabZero?',
    options: ['Daily', 'Weekly', 'Occasionally', 'Rarely'],
  },
  {
    id: 'overallSatisfaction',
    label: 'Overall satisfaction with the platform?',
    options: ['Excellent', 'Good', 'Average', 'Poor'],
  },
  {
    id: 'wouldRecommend',
    label: 'Would you recommend LabZero to others?',
    options: ['Yes', 'No'],
  },
] as const;

const studentDropdownQuestions = [
  {
    id: 'department',
    label: 'Select your department.',
    options: [
      'Science',
      'Mathematics',
      'Computer Science',
      'Engineering',
      'Biology',
      'Chemistry',
      'Physics',
      'Other',
    ],
  },
  {
    id: 'yearSemester',
    label: 'Select your year/semester.',
    options: [
      'Class 9',
      'Class 10',
      'Class 11',
      'Class 12',
      'Year 1 / Semester 1',
      'Year 1 / Semester 2',
      'Year 2 / Semester 3',
      'Year 2 / Semester 4',
      'Year 3 / Semester 5',
      'Year 3 / Semester 6',
      'Year 4 / Semester 7',
      'Year 4 / Semester 8',
    ],
  },
  {
    id: 'preferredLearningMode',
    label: 'Select your preferred learning mode.',
    options: ['Live online classes', 'Recorded lessons', 'Self-paced study', 'Blended learning', 'Virtual lab practice'],
  },
  {
    id: 'internetQuality',
    label: 'Select your internet connectivity quality.',
    options: ['Excellent', 'Good', 'Average', 'Poor', 'Unstable'],
  },
  {
    id: 'primaryUsageTime',
    label: 'Select your primary usage time.',
    options: ['Morning', 'Afternoon', 'Evening', 'Night', 'Flexible / varies'],
  },
] as const;

const defaultStudentTextAnswers = Object.fromEntries(
  studentTextQuestions.map((question) => [question.id, ''])
) as Record<(typeof studentTextQuestions)[number]['id'], string>;

const defaultStudentRatings = Object.fromEntries(
  studentRatingQuestions.map((question) => [question.id, 5])
) as Record<(typeof studentRatingQuestions)[number]['id'], number>;

const defaultStudentCheckboxAnswers = Object.fromEntries(
  studentCheckboxQuestions.map((question) => [question.id, []])
) as Record<(typeof studentCheckboxQuestions)[number]['id'], string[]>;

const defaultStudentRadioAnswers = Object.fromEntries(
  studentRadioQuestions.map((question) => [question.id, question.options[0]])
) as Record<(typeof studentRadioQuestions)[number]['id'], string>;

const defaultStudentDropdownAnswers = Object.fromEntries(
  studentDropdownQuestions.map((question) => [question.id, ''])
) as Record<(typeof studentDropdownQuestions)[number]['id'], string>;

const teacherTextQuestions = [
  {
    id: 'classEffectiveness',
    label: 'How effective is LabZero for conducting classes?',
    placeholder: 'Describe how LabZero supports lectures, lab sessions, discussion, and follow-up work.',
  },
  {
    id: 'studentManagementChallenges',
    label: 'What challenges did you face while managing students?',
    placeholder: 'Mention attendance, participation, tracking, communication, or classroom control issues.',
  },
  {
    id: 'mostUsefulTeachingFeature',
    label: 'Which teaching feature did you find most useful?',
    placeholder: 'Example: live classes, resource sharing, attendance, analytics, assignments...',
  },
  {
    id: 'additionalTeachingTools',
    label: 'What additional tools would improve teaching experience?',
    placeholder: 'Suggest tools for assessment, collaboration, monitoring, content delivery, or analytics.',
  },
  {
    id: 'classroomManagementSuggestions',
    label: 'Any suggestions for improving classroom management?',
    placeholder: 'Share practical changes that would help you manage classes more efficiently.',
  },
] as const;

const teacherRatingQuestions = [
  { id: 'classroomManagementEase', label: 'Rate the ease of classroom management.' },
  { id: 'resourceSharingEfficiency', label: 'Rate the efficiency of resource sharing.' },
  { id: 'studentEngagementLevel', label: 'Rate the student engagement level.' },
  { id: 'liveClassPerformance', label: 'Rate the performance of live class features.' },
  { id: 'overallTeachingExperience', label: 'Rate your overall teaching experience on LabZero.' },
] as const;

const teacherCheckboxQuestions = [
  {
    id: 'frequentFeatures',
    label: 'Which features do you use frequently?',
    options: [
      'Attendance Management',
      'Notes Sharing',
      'Assignment Upload',
      'Live Classes',
      'Student Analytics',
      'Classroom Chat',
      'Recorded Sessions',
      'Assessment / Quiz Tools',
    ],
  },
  {
    id: 'neededImprovements',
    label: 'Which improvements are needed?',
    options: [
      'Better Video Quality',
      'Easier Student Monitoring',
      'Faster Uploads',
      'Better Notifications',
      'Improved Analytics',
      'Bulk Assignment Actions',
      'Better Attendance Reports',
    ],
  },
  {
    id: 'uploadedMaterials',
    label: 'What teaching materials do you upload?',
    options: ['PDFs', 'PPTs', 'Videos', 'Assignments', 'External Links', 'Worksheets', 'Lab Manuals'],
  },
] as const;

const teacherRadioQuestions = [
  {
    id: 'comfortLevel',
    label: 'How comfortable are you using LabZero?',
    options: ['Very Comfortable', 'Comfortable', 'Neutral', 'Uncomfortable'],
  },
  {
    id: 'improvesProductivity',
    label: 'Does LabZero improve classroom productivity?',
    options: ['Yes', 'No'],
  },
  {
    id: 'continueUsing',
    label: 'Would you continue using LabZero?',
    options: ['Yes', 'No'],
  },
] as const;

const teacherDropdownQuestions = [
  {
    id: 'department',
    label: 'Select your department.',
    options: [
      'Science',
      'Mathematics',
      'Computer Science',
      'Engineering',
      'Biology',
      'Chemistry',
      'Physics',
      'Humanities',
      'Other',
    ],
  },
  {
    id: 'teachingExperienceRange',
    label: 'Select your teaching experience range.',
    options: ['0-1 years', '2-5 years', '6-10 years', '11-15 years', '16+ years'],
  },
  {
    id: 'averageClassSize',
    label: 'Select average class size.',
    options: ['Below 20 students', '20-40 students', '41-60 students', '61-100 students', 'More than 100 students'],
  },
  {
    id: 'preferredTeachingMode',
    label: 'Select preferred teaching mode.',
    options: ['Live online teaching', 'Recorded lesson support', 'Hybrid classroom', 'In-person with digital resources', 'Virtual lab-led teaching'],
  },
  {
    id: 'platformUsageFrequency',
    label: 'Select frequency of platform usage.',
    options: ['Daily', 'Several times a week', 'Weekly', 'Occasionally', 'Rarely'],
  },
] as const;

const defaultTeacherTextAnswers = Object.fromEntries(
  teacherTextQuestions.map((question) => [question.id, ''])
) as Record<(typeof teacherTextQuestions)[number]['id'], string>;

const defaultTeacherRatings = Object.fromEntries(
  teacherRatingQuestions.map((question) => [question.id, 5])
) as Record<(typeof teacherRatingQuestions)[number]['id'], number>;

const defaultTeacherCheckboxAnswers = Object.fromEntries(
  teacherCheckboxQuestions.map((question) => [question.id, []])
) as Record<(typeof teacherCheckboxQuestions)[number]['id'], string[]>;

const defaultTeacherRadioAnswers = Object.fromEntries(
  teacherRadioQuestions.map((question) => [question.id, question.options[0]])
) as Record<(typeof teacherRadioQuestions)[number]['id'], string>;

const defaultTeacherDropdownAnswers = Object.fromEntries(
  teacherDropdownQuestions.map((question) => [question.id, ''])
) as Record<(typeof teacherDropdownQuestions)[number]['id'], string>;

const instituteTextQuestions = [
  {
    id: 'managementBenefit',
    label: 'How beneficial is LabZero for institutional management?',
    placeholder: 'Describe the impact on administration, monitoring, communication, and academic operations.',
  },
  {
    id: 'institutionalChallengesSolved',
    label: 'What institutional challenges can LabZero solve?',
    placeholder: 'Mention challenges in coordination, reporting, digital learning, analytics, or resource flow.',
  },
  {
    id: 'administrationFeatures',
    label: 'What features should be added for better administration?',
    placeholder: 'Suggest tools for approvals, reports, roles, compliance, automation, or dashboards.',
  },
  {
    id: 'academicCoordinationEffectiveness',
    label: 'How effective is the platform for academic coordination?',
    placeholder: 'Share how well it supports departments, teachers, classrooms, and academic planning.',
  },
  {
    id: 'institutionalImprovementSuggestions',
    label: 'Any suggestions for institutional improvement?',
    placeholder: 'Add recommendations for long-term adoption, deployment, training, or governance.',
  },
] as const;

const instituteRatingQuestions = [
  { id: 'scalability', label: 'Rate the scalability of LabZero.' },
  { id: 'academicCoordination', label: 'Rate the effectiveness of academic coordination.' },
  { id: 'securityReliability', label: 'Rate the platform security and reliability.' },
  { id: 'communicationEfficiency', label: 'Rate the communication efficiency.' },
  { id: 'overallInstitutionalUsefulness', label: 'Rate the overall institutional usefulness.' },
] as const;

const instituteCheckboxQuestions = [
  {
    id: 'usefulInstitutionalFeatures',
    label: 'Which institutional features are most useful?',
    options: [
      'Student Monitoring',
      'Teacher Management',
      'Analytics Dashboard',
      'Classroom Management',
      'Digital Resource Sharing',
      'Attendance Oversight',
      'Department Performance Tracking',
    ],
  },
  {
    id: 'neededInstitutionalImprovements',
    label: 'What improvements are needed?',
    options: [
      'Better Reporting',
      'AI-Based Analytics',
      'Stronger Security',
      'More Automation',
      'Mobile App Support',
      'Role-Based Permissions',
      'Data Export Tools',
    ],
  },
  {
    id: 'activeDepartments',
    label: 'Which departments use LabZero most?',
    options: ['Science', 'Commerce', 'Arts', 'Engineering', 'Management', 'Mathematics', 'Computer Science'],
  },
] as const;

const instituteRadioQuestions = [
  {
    id: 'longTermAdoption',
    label: 'Would your institute adopt LabZero long-term?',
    options: ['Yes', 'No'],
  },
  {
    id: 'digitalTransformationRating',
    label: 'How would you rate digital transformation using LabZero?',
    options: ['Excellent', 'Good', 'Average', 'Poor'],
  },
  {
    id: 'largeScaleDeployment',
    label: 'Is LabZero suitable for large-scale deployment?',
    options: ['Yes', 'No'],
  },
] as const;

const instituteDropdownQuestions = [
  {
    id: 'institutionType',
    label: 'Select institution type.',
    options: ['School', 'College', 'University', 'Training Institute', 'Coaching Center', 'Research Institute', 'Other'],
  },
  {
    id: 'institutionSize',
    label: 'Select institution size.',
    options: ['Single campus', '2-5 campuses', '6-10 campuses', 'Multi-city institution', 'Large institution group'],
  },
  {
    id: 'averageStudentStrength',
    label: 'Select average student strength.',
    options: ['Below 500', '500-1,000', '1,001-5,000', '5,001-10,000', 'More than 10,000'],
  },
  {
    id: 'preferredDeploymentMode',
    label: 'Select preferred deployment mode.',
    options: ['Cloud hosted', 'On-premise', 'Hybrid deployment', 'Private cloud', 'Managed SaaS'],
  },
  {
    id: 'institutionalSatisfaction',
    label: 'Select overall institutional satisfaction level.',
    options: ['Excellent', 'Good', 'Average', 'Needs improvement', 'Poor'],
  },
] as const;

const defaultInstituteTextAnswers = Object.fromEntries(
  instituteTextQuestions.map((question) => [question.id, ''])
) as Record<(typeof instituteTextQuestions)[number]['id'], string>;

const defaultInstituteRatings = Object.fromEntries(
  instituteRatingQuestions.map((question) => [question.id, 5])
) as Record<(typeof instituteRatingQuestions)[number]['id'], number>;

const defaultInstituteCheckboxAnswers = Object.fromEntries(
  instituteCheckboxQuestions.map((question) => [question.id, []])
) as Record<(typeof instituteCheckboxQuestions)[number]['id'], string[]>;

const defaultInstituteRadioAnswers = Object.fromEntries(
  instituteRadioQuestions.map((question) => [question.id, question.options[0]])
) as Record<(typeof instituteRadioQuestions)[number]['id'], string>;

const defaultInstituteDropdownAnswers = Object.fromEntries(
  instituteDropdownQuestions.map((question) => [question.id, ''])
) as Record<(typeof instituteDropdownQuestions)[number]['id'], string>;

const SiteFeedbackPage = ({
  user,
  theme,
  onBack,
  onLogin,
  onSubmitted,
}: SiteFeedbackPageProps) => {
  const feedbackRole = user?.role ?? 'student';
  const roleConfig = roleFeedbackConfig[feedbackRole];
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [feedbackType, setFeedbackType] = useState(roleConfig.feedbackAreas[0]);
  const [selectedAreas, setSelectedAreas] = useState<string[]>(roleConfig.feedbackAreas);
  const [course, setCourse] = useState('');
  const [classroom, setClassroom] = useState('');
  const [teacher, setTeacher] = useState('');
  const [session, setSession] = useState('');
  const [studentTextAnswers, setStudentTextAnswers] = useState(defaultStudentTextAnswers);
  const [studentRatings, setStudentRatings] = useState(defaultStudentRatings);
  const [studentCheckboxAnswers, setStudentCheckboxAnswers] = useState(defaultStudentCheckboxAnswers);
  const [studentRadioAnswers, setStudentRadioAnswers] = useState(defaultStudentRadioAnswers);
  const [studentDropdownAnswers, setStudentDropdownAnswers] = useState(defaultStudentDropdownAnswers);
  const [teacherTextAnswers, setTeacherTextAnswers] = useState(defaultTeacherTextAnswers);
  const [teacherRatings, setTeacherRatings] = useState(defaultTeacherRatings);
  const [teacherCheckboxAnswers, setTeacherCheckboxAnswers] = useState(defaultTeacherCheckboxAnswers);
  const [teacherRadioAnswers, setTeacherRadioAnswers] = useState(defaultTeacherRadioAnswers);
  const [teacherDropdownAnswers, setTeacherDropdownAnswers] = useState(defaultTeacherDropdownAnswers);
  const [instituteTextAnswers, setInstituteTextAnswers] = useState(defaultInstituteTextAnswers);
  const [instituteRatings, setInstituteRatings] = useState(defaultInstituteRatings);
  const [instituteCheckboxAnswers, setInstituteCheckboxAnswers] = useState(defaultInstituteCheckboxAnswers);
  const [instituteRadioAnswers, setInstituteRadioAnswers] = useState(defaultInstituteRadioAnswers);
  const [instituteDropdownAnswers, setInstituteDropdownAnswers] = useState(defaultInstituteDropdownAnswers);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [error, setError] = useState('Could not submit feedback. Please try again.');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isLight = theme === 'light';
  const isStudentFeedback = feedbackRole === 'student';
  const isTeacherFeedback = feedbackRole === 'teacher';
  const isInstituteFeedback = feedbackRole === 'institute';

  const inputClass = `mt-2 w-full rounded-2xl border px-4 py-3 text-sm outline-none transition focus:ring-2 ${
    isLight
      ? 'border-slate-200 bg-white text-slate-950 placeholder:text-slate-400 focus:border-indigo-400 focus:ring-indigo-100'
      : 'border-white/10 bg-white/5 text-white placeholder:text-slate-500 focus:border-cyan-300/60 focus:ring-cyan-300/15'
  }`;

  useEffect(() => {
    setFeedbackType(roleConfig.feedbackAreas[0]);
    setSelectedAreas(roleConfig.feedbackAreas);
  }, [feedbackRole, roleConfig.feedbackAreas]);

  useEffect(() => {
    if (isStudentFeedback) {
      setStudentTextAnswers(defaultStudentTextAnswers);
      setStudentRatings(defaultStudentRatings);
      setStudentCheckboxAnswers(defaultStudentCheckboxAnswers);
      setStudentRadioAnswers(defaultStudentRadioAnswers);
      setStudentDropdownAnswers(defaultStudentDropdownAnswers);
    }
  }, [isStudentFeedback]);

  useEffect(() => {
    if (isTeacherFeedback) {
      setTeacherTextAnswers(defaultTeacherTextAnswers);
      setTeacherRatings(defaultTeacherRatings);
      setTeacherCheckboxAnswers(defaultTeacherCheckboxAnswers);
      setTeacherRadioAnswers(defaultTeacherRadioAnswers);
      setTeacherDropdownAnswers(defaultTeacherDropdownAnswers);
    }
  }, [isTeacherFeedback]);

  useEffect(() => {
    if (isInstituteFeedback) {
      setInstituteTextAnswers(defaultInstituteTextAnswers);
      setInstituteRatings(defaultInstituteRatings);
      setInstituteCheckboxAnswers(defaultInstituteCheckboxAnswers);
      setInstituteRadioAnswers(defaultInstituteRadioAnswers);
      setInstituteDropdownAnswers(defaultInstituteDropdownAnswers);
    }
  }, [isInstituteFeedback]);

  const toggleArea = (area: string) => {
    setSelectedAreas((current) =>
      current.includes(area)
        ? current.filter((item) => item !== area)
        : [...current, area]
    );
  };

  const toggleStudentCheckbox = (
    questionId: keyof typeof defaultStudentCheckboxAnswers,
    option: string
  ) => {
    setStudentCheckboxAnswers((current) => {
      const selected = current[questionId];
      return {
        ...current,
        [questionId]: selected.includes(option)
          ? selected.filter((item) => item !== option)
          : [...selected, option],
      };
    });
  };

  const toggleTeacherCheckbox = (
    questionId: keyof typeof defaultTeacherCheckboxAnswers,
    option: string
  ) => {
    setTeacherCheckboxAnswers((current) => {
      const selected = current[questionId];
      return {
        ...current,
        [questionId]: selected.includes(option)
          ? selected.filter((item) => item !== option)
          : [...selected, option],
      };
    });
  };

  const toggleInstituteCheckbox = (
    questionId: keyof typeof defaultInstituteCheckboxAnswers,
    option: string
  ) => {
    setInstituteCheckboxAnswers((current) => {
      const selected = current[questionId];
      return {
        ...current,
        [questionId]: selected.includes(option)
          ? selected.filter((item) => item !== option)
          : [...selected, option],
      };
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!user) {
      onLogin();
      return;
    }

    setIsSubmitting(true);
    setStatus('idle');

    try {
      const studentFeedbackDetails = isStudentFeedback
        ? [
            'Student Text Feedback:',
            ...studentTextQuestions.map(
              (question) =>
                `- ${question.label}: ${studentTextAnswers[question.id].trim() || 'Not provided'}`
            ),
            'Student Ratings:',
            ...studentRatingQuestions.map(
              (question) => `- ${question.label}: ${studentRatings[question.id]}/5`
            ),
            'Student Multiple Choice:',
            ...studentCheckboxQuestions.map((question) => {
              const selected = studentCheckboxAnswers[question.id];
              return `- ${question.label}: ${selected.length ? selected.join(', ') : 'Not selected'}`;
            }),
            'Student Single Choice:',
            ...studentRadioQuestions.map(
              (question) => `- ${question.label}: ${studentRadioAnswers[question.id]}`
            ),
            'Student Dropdown Details:',
            ...studentDropdownQuestions.map(
              (question) =>
                `- ${question.label}: ${studentDropdownAnswers[question.id] || 'Not selected'}`
            ),
          ]
        : [
            `Feedback Type: ${feedbackType}`,
            `Covered Areas: ${selectedAreas.length ? selectedAreas.join(', ') : 'Not specified'}`,
            `Comment: ${comment.trim() || 'No written comment provided.'}`,
          ];
      const teacherFeedbackDetails = isTeacherFeedback
        ? [
            'Teacher Text Feedback:',
            ...teacherTextQuestions.map(
              (question) =>
                `- ${question.label}: ${teacherTextAnswers[question.id].trim() || 'Not provided'}`
            ),
            'Teacher Ratings:',
            ...teacherRatingQuestions.map(
              (question) => `- ${question.label}: ${teacherRatings[question.id]}/5`
            ),
            'Teacher Multiple Choice:',
            ...teacherCheckboxQuestions.map((question) => {
              const selected = teacherCheckboxAnswers[question.id];
              return `- ${question.label}: ${selected.length ? selected.join(', ') : 'Not selected'}`;
            }),
            'Teacher Single Choice:',
            ...teacherRadioQuestions.map(
              (question) => `- ${question.label}: ${teacherRadioAnswers[question.id]}`
            ),
            'Teacher Dropdown Details:',
            ...teacherDropdownQuestions.map(
              (question) =>
                `- ${question.label}: ${teacherDropdownAnswers[question.id] || 'Not selected'}`
            ),
          ]
        : studentFeedbackDetails;
      const instituteFeedbackDetails = isInstituteFeedback
        ? [
            'Institute Text Feedback:',
            ...instituteTextQuestions.map(
              (question) =>
                `- ${question.label}: ${instituteTextAnswers[question.id].trim() || 'Not provided'}`
            ),
            'Institute Ratings:',
            ...instituteRatingQuestions.map(
              (question) => `- ${question.label}: ${instituteRatings[question.id]}/5`
            ),
            'Institute Multiple Choice:',
            ...instituteCheckboxQuestions.map((question) => {
              const selected = instituteCheckboxAnswers[question.id];
              return `- ${question.label}: ${selected.length ? selected.join(', ') : 'Not selected'}`;
            }),
            'Institute Single Choice:',
            ...instituteRadioQuestions.map(
              (question) => `- ${question.label}: ${instituteRadioAnswers[question.id]}`
            ),
            'Institute Dropdown Details:',
            ...instituteDropdownQuestions.map(
              (question) =>
                `- ${question.label}: ${instituteDropdownAnswers[question.id] || 'Not selected'}`
            ),
          ]
        : teacherFeedbackDetails;

      const structuredComment = [
        `Feedback Category: ${roleConfig.badge}`,
        `User Role: ${feedbackRole}`,
        `${roleConfig.fields.course.label}: ${course || 'Not specified'}`,
        `${roleConfig.fields.classroom.label}: ${classroom || 'Not specified'}`,
        `${roleConfig.fields.teacher.label}: ${teacher || 'Not specified'}`,
        `${roleConfig.fields.session.label}: ${session || 'Not specified'}`,
        ...instituteFeedbackDetails,
      ].join('\n');

      await submitSiteFeedback({
        rating: isStudentFeedback
          ? studentRatings.overallLearning
          : isTeacherFeedback
            ? teacherRatings.overallTeachingExperience
            : isInstituteFeedback
              ? instituteRatings.overallInstitutionalUsefulness
              : rating,
        comment: structuredComment,
      });
      onSubmitted?.();
      setStatus('success');
      setComment('');
      if (isStudentFeedback) {
        setStudentTextAnswers(defaultStudentTextAnswers);
        setStudentRatings(defaultStudentRatings);
        setStudentCheckboxAnswers(defaultStudentCheckboxAnswers);
        setStudentRadioAnswers(defaultStudentRadioAnswers);
        setStudentDropdownAnswers(defaultStudentDropdownAnswers);
      }
      if (isTeacherFeedback) {
        setTeacherTextAnswers(defaultTeacherTextAnswers);
        setTeacherRatings(defaultTeacherRatings);
        setTeacherCheckboxAnswers(defaultTeacherCheckboxAnswers);
        setTeacherRadioAnswers(defaultTeacherRadioAnswers);
        setTeacherDropdownAnswers(defaultTeacherDropdownAnswers);
      }
      if (isInstituteFeedback) {
        setInstituteTextAnswers(defaultInstituteTextAnswers);
        setInstituteRatings(defaultInstituteRatings);
        setInstituteCheckboxAnswers(defaultInstituteCheckboxAnswers);
        setInstituteRadioAnswers(defaultInstituteRadioAnswers);
        setInstituteDropdownAnswers(defaultInstituteDropdownAnswers);
      }
    } catch (submitError) {
      setError(getFeedbackApiError(submitError));
      setStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FeedbackPageShell tone="cyan">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white/85 px-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-white"
          >
            <ArrowLeft size={16} />
            Back
          </button>
        </div>

        <section className="flex flex-col gap-5">
          <article className="rounded-3xl border border-slate-200/80 bg-white/85 p-6 shadow-sm backdrop-blur sm:p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-indigo-600">
              Name of the Project
            </p>
            <h1 className="mt-3 text-4xl font-black text-slate-950 sm:text-5xl">
              LABZERO
            </h1>
            <p className="mt-3 text-lg font-bold text-slate-800">
              Intelligent Collaborative Learning & Virtual Classroom Platform
            </p>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              LabZero is a modern educational collaboration platform designed
              to bridge the gap between traditional classroom learning and
              digital education systems. It creates a centralized ecosystem
              for digital learning, communication, live classrooms, academic
              tools, and feedback analytics.
            </p>

            {!user && (
              <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                Please sign in before submitting feedback.
              </div>
            )}
          </article>

          <article className="rounded-3xl border border-slate-200/80 bg-white/85 p-5 shadow-sm backdrop-blur">
            <h2 className="text-lg font-black text-slate-950">
              Platform Framework
            </h2>
            <div className="mt-4 flex flex-col gap-3">
              {platformFeatures.map((feature) => (
                <div
                  key={feature.label}
                  className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 px-3 py-3"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
                    <feature.icon size={18} />
                  </span>
                  <span className="text-sm font-semibold text-slate-700">
                    {feature.label}
                  </span>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-3xl border border-slate-200/80 bg-white/85 p-5 shadow-sm backdrop-blur">
            <h2 className="text-lg font-black text-slate-950">
              Unique Selling Proposition
            </h2>
            <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
              <p>
                LabZero combines collaborative learning, virtual classroom
                interaction, analytics, and intelligent feedback management
                within a single educational platform.
              </p>
              <p>
                The feedback module collects multiple forms of feedback,
                stores them dynamically, and generates graphical analytical
                reports for better understanding.
              </p>
              <p>
                The architecture is designed around React, TypeScript, API
                services, and WebSocket/WebRTC-ready live interaction flows.
              </p>
            </div>
          </article>

          <article className="rounded-3xl border border-slate-200/80 bg-white/85 p-5 shadow-sm backdrop-blur">
            <h2 className="text-lg font-black text-slate-950">
              Instruction / Manual / Demo
            </h2>
            <div className="mt-4 space-y-3">
              {roleConfig.usageSteps.map((step, index) => (
                <div key={step} className="flex gap-3 rounded-2xl bg-slate-50/80 px-3 py-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-xs font-black text-white">
                    {index + 1}
                  </span>
                  <p className="text-sm font-medium text-slate-700">{step}</p>
                </div>
              ))}
            </div>
          </article>

          <form
            onSubmit={handleSubmit}
            className={`rounded-3xl border p-5 shadow-sm backdrop-blur sm:p-6 ${
              isLight
                ? 'border-slate-200/80 bg-white/90 text-slate-950'
                : 'border-slate-700/70 bg-slate-950/90 text-slate-50'
            }`}
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">
                {roleConfig.badge}
              </p>
              <h2 className="mt-2 text-2xl font-black">{roleConfig.title}</h2>
              <p className={`mt-2 text-sm leading-6 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                {roleConfig.description}
              </p>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="feedback-course" className={`text-sm font-semibold ${isLight ? 'text-slate-700' : 'text-slate-200'}`}>
                  {roleConfig.fields.course.label}
                </label>
                <input
                  id="feedback-course"
                  value={course}
                  onChange={(event) => setCourse(event.target.value)}
                  placeholder={roleConfig.fields.course.placeholder}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="feedback-classroom" className={`text-sm font-semibold ${isLight ? 'text-slate-700' : 'text-slate-200'}`}>
                  {roleConfig.fields.classroom.label}
                </label>
                <input
                  id="feedback-classroom"
                  value={classroom}
                  onChange={(event) => setClassroom(event.target.value)}
                  placeholder={roleConfig.fields.classroom.placeholder}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="feedback-teacher" className={`text-sm font-semibold ${isLight ? 'text-slate-700' : 'text-slate-200'}`}>
                  {roleConfig.fields.teacher.label}
                </label>
                <input
                  id="feedback-teacher"
                  value={teacher}
                  onChange={(event) => setTeacher(event.target.value)}
                  placeholder={roleConfig.fields.teacher.placeholder}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="feedback-session" className={`text-sm font-semibold ${isLight ? 'text-slate-700' : 'text-slate-200'}`}>
                  {roleConfig.fields.session.label}
                </label>
                <input
                  id="feedback-session"
                  value={session}
                  onChange={(event) => setSession(event.target.value)}
                  placeholder={roleConfig.fields.session.placeholder}
                  className={inputClass}
                />
              </div>
            </div>

            {isStudentFeedback ? (
              <StudentFeedbackQuestions
                isLight={isLight}
                inputClass={inputClass}
                textAnswers={studentTextAnswers}
                ratings={studentRatings}
                checkboxAnswers={studentCheckboxAnswers}
                radioAnswers={studentRadioAnswers}
                dropdownAnswers={studentDropdownAnswers}
                onTextChange={(questionId, value) =>
                  setStudentTextAnswers((current) => ({ ...current, [questionId]: value }))
                }
                onRatingChange={(questionId, value) =>
                  setStudentRatings((current) => ({ ...current, [questionId]: value }))
                }
                onCheckboxToggle={toggleStudentCheckbox}
                onRadioChange={(questionId, value) =>
                  setStudentRadioAnswers((current) => ({ ...current, [questionId]: value }))
                }
                onDropdownChange={(questionId, value) =>
                  setStudentDropdownAnswers((current) => ({ ...current, [questionId]: value }))
                }
              />
            ) : isTeacherFeedback ? (
              <TeacherFeedbackQuestions
                isLight={isLight}
                inputClass={inputClass}
                textAnswers={teacherTextAnswers}
                ratings={teacherRatings}
                checkboxAnswers={teacherCheckboxAnswers}
                radioAnswers={teacherRadioAnswers}
                dropdownAnswers={teacherDropdownAnswers}
                onTextChange={(questionId, value) =>
                  setTeacherTextAnswers((current) => ({ ...current, [questionId]: value }))
                }
                onRatingChange={(questionId, value) =>
                  setTeacherRatings((current) => ({ ...current, [questionId]: value }))
                }
                onCheckboxToggle={toggleTeacherCheckbox}
                onRadioChange={(questionId, value) =>
                  setTeacherRadioAnswers((current) => ({ ...current, [questionId]: value }))
                }
                onDropdownChange={(questionId, value) =>
                  setTeacherDropdownAnswers((current) => ({ ...current, [questionId]: value }))
                }
              />
            ) : isInstituteFeedback ? (
              <InstituteFeedbackQuestions
                isLight={isLight}
                inputClass={inputClass}
                textAnswers={instituteTextAnswers}
                ratings={instituteRatings}
                checkboxAnswers={instituteCheckboxAnswers}
                radioAnswers={instituteRadioAnswers}
                dropdownAnswers={instituteDropdownAnswers}
                onTextChange={(questionId, value) =>
                  setInstituteTextAnswers((current) => ({ ...current, [questionId]: value }))
                }
                onRatingChange={(questionId, value) =>
                  setInstituteRatings((current) => ({ ...current, [questionId]: value }))
                }
                onCheckboxToggle={toggleInstituteCheckbox}
                onRadioChange={(questionId, value) =>
                  setInstituteRadioAnswers((current) => ({ ...current, [questionId]: value }))
                }
                onDropdownChange={(questionId, value) =>
                  setInstituteDropdownAnswers((current) => ({ ...current, [questionId]: value }))
                }
              />
            ) : (
              <>
                <div className="mt-5">
                  <label className={`text-sm font-semibold ${isLight ? 'text-slate-700' : 'text-slate-200'}`}>
                    Feedback focus
                  </label>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    {roleConfig.feedbackAreas.map((area) => (
                      <button
                        key={area}
                        type="button"
                        onClick={() => setFeedbackType(area)}
                        className={`rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition ${
                          feedbackType === area
                            ? 'border-indigo-500 bg-indigo-600 text-white'
                            : isLight
                              ? 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-white'
                              : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        {area}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-5">
                  <label className={`text-sm font-semibold ${isLight ? 'text-slate-700' : 'text-slate-200'}`}>
                    Areas covered
                  </label>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    {roleConfig.feedbackAreas.map((area) => (
                      <label
                        key={area}
                        className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                          selectedAreas.includes(area)
                            ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                            : isLight
                              ? 'border-slate-200 bg-white text-slate-600'
                              : 'border-white/10 bg-white/5 text-slate-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedAreas.includes(area)}
                          onChange={() => toggleArea(area)}
                          className="h-4 w-4 rounded border-slate-300 text-emerald-600"
                        />
                        {area}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label
                    className={`text-sm font-semibold ${
                      isLight ? 'text-slate-700' : 'text-slate-200'
                    }`}
                  >
                    Overall rating
                  </label>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setRating(value)}
                        aria-label={`Rate ${value} out of 5`}
                        className={`flex h-11 w-11 items-center justify-center rounded-xl border transition ${
                          value <= rating
                            ? 'border-amber-400 bg-amber-400 text-slate-950'
                            : isLight
                              ? 'border-slate-200 bg-slate-50 text-slate-400 hover:text-amber-500'
                              : 'border-white/10 bg-white/5 text-slate-500 hover:text-amber-300'
                        }`}
                      >
                        <Star
                          size={19}
                          fill={value <= rating ? 'currentColor' : 'none'}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-5">
                  <label
                    htmlFor="site-feedback-comment"
                    className={`text-sm font-semibold ${
                      isLight ? 'text-slate-700' : 'text-slate-200'
                    }`}
                  >
                    Feedback
                  </label>
                  <textarea
                    id="site-feedback-comment"
                    value={comment}
                    onChange={(event) => setComment(event.target.value)}
                    rows={7}
                    placeholder="Tell us what worked well or what should be improved."
                    className={`mt-2 w-full resize-none rounded-2xl border px-4 py-3 text-sm outline-none transition focus:ring-2 ${
                      isLight
                        ? 'border-slate-200 bg-white text-slate-950 placeholder:text-slate-400 focus:border-indigo-400 focus:ring-indigo-100'
                        : 'border-white/10 bg-white/5 text-white placeholder:text-slate-500 focus:border-cyan-300/60 focus:ring-cyan-300/15'
                    }`}
                  />
                </div>
              </>
            )}

            {status === 'success' && (
              <div className="mt-5 flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                <CheckCircle2 size={17} />
                Feedback submitted. Thank you.
              </div>
            )}

            {status === 'error' && (
              <div className="mt-5 flex items-center gap-2 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                <AlertCircle size={17} />
                {error}
              </div>
            )}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              {!user && (
                <button
                  type="button"
                  onClick={onLogin}
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Sign in
                </button>
              )}
              <button
                type="submit"
                disabled={!user || isSubmitting}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Send size={16} />
                )}
                Submit feedback
              </button>
            </div>
          </form>
        </section>

        <section className="mt-5 flex flex-col gap-5">
          <article className="rounded-3xl border border-slate-200/80 bg-white/85 p-5 shadow-sm backdrop-blur">
            <h2 className="text-lg font-black text-slate-950">
              Supported Question Types
            </h2>
            <div className="mt-4 flex flex-col gap-3">
              {questionTypes.map((questionType) => (
                <div
                  key={questionType.label}
                  className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 px-3 py-3"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700">
                    <questionType.icon size={18} />
                  </span>
                  <span className="text-sm font-semibold text-slate-700">
                    {questionType.label}
                  </span>
                </div>
              ))}
            </div>
          </article>
        </section>
      </div>
    </FeedbackPageShell>
  );
};

type StudentTextQuestionId = keyof typeof defaultStudentTextAnswers;
type StudentRatingQuestionId = keyof typeof defaultStudentRatings;
type StudentCheckboxQuestionId = keyof typeof defaultStudentCheckboxAnswers;
type StudentRadioQuestionId = keyof typeof defaultStudentRadioAnswers;
type StudentDropdownQuestionId = keyof typeof defaultStudentDropdownAnswers;
type TeacherTextQuestionId = keyof typeof defaultTeacherTextAnswers;
type TeacherRatingQuestionId = keyof typeof defaultTeacherRatings;
type TeacherCheckboxQuestionId = keyof typeof defaultTeacherCheckboxAnswers;
type TeacherRadioQuestionId = keyof typeof defaultTeacherRadioAnswers;
type TeacherDropdownQuestionId = keyof typeof defaultTeacherDropdownAnswers;
type InstituteTextQuestionId = keyof typeof defaultInstituteTextAnswers;
type InstituteRatingQuestionId = keyof typeof defaultInstituteRatings;
type InstituteCheckboxQuestionId = keyof typeof defaultInstituteCheckboxAnswers;
type InstituteRadioQuestionId = keyof typeof defaultInstituteRadioAnswers;
type InstituteDropdownQuestionId = keyof typeof defaultInstituteDropdownAnswers;

interface StudentFeedbackQuestionsProps {
  isLight: boolean;
  inputClass: string;
  textAnswers: typeof defaultStudentTextAnswers;
  ratings: typeof defaultStudentRatings;
  checkboxAnswers: typeof defaultStudentCheckboxAnswers;
  radioAnswers: typeof defaultStudentRadioAnswers;
  dropdownAnswers: typeof defaultStudentDropdownAnswers;
  onTextChange: (questionId: StudentTextQuestionId, value: string) => void;
  onRatingChange: (questionId: StudentRatingQuestionId, value: number) => void;
  onCheckboxToggle: (questionId: StudentCheckboxQuestionId, option: string) => void;
  onRadioChange: (questionId: StudentRadioQuestionId, value: string) => void;
  onDropdownChange: (questionId: StudentDropdownQuestionId, value: string) => void;
}

const StudentFeedbackQuestions = ({
  isLight,
  inputClass,
  textAnswers,
  ratings,
  checkboxAnswers,
  radioAnswers,
  dropdownAnswers,
  onTextChange,
  onRatingChange,
  onCheckboxToggle,
  onRadioChange,
  onDropdownChange,
}: StudentFeedbackQuestionsProps) => {
  const labelClass = `text-sm font-semibold ${isLight ? 'text-slate-700' : 'text-slate-200'}`;
  const panelClass = `mt-5 rounded-3xl border p-4 sm:p-5 ${
    isLight ? 'border-slate-200 bg-slate-50/80' : 'border-white/10 bg-white/5'
  }`;
  const panelTitleClass = `text-base font-black ${isLight ? 'text-slate-950' : 'text-slate-50'}`;
  const panelHintClass = `mt-1 text-xs leading-5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`;

  return (
    <>
      <section className={panelClass}>
        <h3 className={panelTitleClass}>Written Feedback</h3>
        <p className={panelHintClass}>
          Share specific details so teachers and administrators can understand the student experience clearly.
        </p>
        <div className="mt-4 grid gap-4">
          {studentTextQuestions.map((question) => (
            <div key={question.id}>
              <label htmlFor={`student-${question.id}`} className={labelClass}>
                {question.label}
              </label>
              <textarea
                id={`student-${question.id}`}
                value={textAnswers[question.id]}
                onChange={(event) => onTextChange(question.id, event.target.value)}
                rows={4}
                placeholder={question.placeholder}
                className={`${inputClass} resize-none`}
              />
            </div>
          ))}
        </div>
      </section>

      <section className={panelClass}>
        <h3 className={panelTitleClass}>Ratings</h3>
        <p className={panelHintClass}>
          Use 1 for very poor and 5 for excellent.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {studentRatingQuestions.map((question) => (
            <div
              key={question.id}
              className={`rounded-2xl border px-4 py-4 ${
                isLight ? 'border-slate-200 bg-white' : 'border-white/10 bg-slate-950/40'
              }`}
            >
              <p className={labelClass}>{question.label}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => onRatingChange(question.id, value)}
                    aria-label={`${question.label} ${value} out of 5`}
                    className={`flex h-10 w-10 items-center justify-center rounded-xl border text-sm font-black transition ${
                      value <= ratings[question.id]
                        ? 'border-amber-400 bg-amber-400 text-slate-950'
                        : isLight
                          ? 'border-slate-200 bg-slate-50 text-slate-400 hover:text-amber-500'
                          : 'border-white/10 bg-white/5 text-slate-500 hover:text-amber-300'
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={panelClass}>
        <h3 className={panelTitleClass}>Feature Usage and Improvements</h3>
        <p className={panelHintClass}>
          Select every option that applies.
        </p>
        <div className="mt-4 grid gap-4">
          {studentCheckboxQuestions.map((question) => (
            <fieldset key={question.id}>
              <legend className={labelClass}>{question.label}</legend>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {question.options.map((option) => (
                  <label
                    key={option}
                    className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                      checkboxAnswers[question.id].includes(option)
                        ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                        : isLight
                          ? 'border-slate-200 bg-white text-slate-600'
                          : 'border-white/10 bg-white/5 text-slate-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checkboxAnswers[question.id].includes(option)}
                      onChange={() => onCheckboxToggle(question.id, option)}
                      className="h-4 w-4 rounded border-slate-300 text-emerald-600"
                    />
                    {option}
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
        </div>
      </section>

      <section className={panelClass}>
        <h3 className={panelTitleClass}>Usage and Satisfaction</h3>
        <div className="mt-4 grid gap-4">
          {studentRadioQuestions.map((question) => (
            <fieldset key={question.id}>
              <legend className={labelClass}>{question.label}</legend>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {question.options.map((option) => (
                  <label
                    key={option}
                    className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                      radioAnswers[question.id] === option
                        ? 'border-indigo-500 bg-indigo-600 text-white'
                        : isLight
                          ? 'border-slate-200 bg-white text-slate-600'
                          : 'border-white/10 bg-white/5 text-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`student-${question.id}`}
                      checked={radioAnswers[question.id] === option}
                      onChange={() => onRadioChange(question.id, option)}
                      className="h-4 w-4 border-slate-300 text-indigo-600"
                    />
                    {option}
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
        </div>
      </section>

      <section className={panelClass}>
        <h3 className={panelTitleClass}>Academic and Access Details</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {studentDropdownQuestions.map((question) => (
            <div key={question.id}>
              <label htmlFor={`student-${question.id}`} className={labelClass}>
                {question.label}
              </label>
              <select
                id={`student-${question.id}`}
                value={dropdownAnswers[question.id]}
                onChange={(event) => onDropdownChange(question.id, event.target.value)}
                className={inputClass}
              >
                <option value="">Choose an option</option>
                {question.options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </section>
    </>
  );
};

interface TeacherFeedbackQuestionsProps {
  isLight: boolean;
  inputClass: string;
  textAnswers: typeof defaultTeacherTextAnswers;
  ratings: typeof defaultTeacherRatings;
  checkboxAnswers: typeof defaultTeacherCheckboxAnswers;
  radioAnswers: typeof defaultTeacherRadioAnswers;
  dropdownAnswers: typeof defaultTeacherDropdownAnswers;
  onTextChange: (questionId: TeacherTextQuestionId, value: string) => void;
  onRatingChange: (questionId: TeacherRatingQuestionId, value: number) => void;
  onCheckboxToggle: (questionId: TeacherCheckboxQuestionId, option: string) => void;
  onRadioChange: (questionId: TeacherRadioQuestionId, value: string) => void;
  onDropdownChange: (questionId: TeacherDropdownQuestionId, value: string) => void;
}

const TeacherFeedbackQuestions = ({
  isLight,
  inputClass,
  textAnswers,
  ratings,
  checkboxAnswers,
  radioAnswers,
  dropdownAnswers,
  onTextChange,
  onRatingChange,
  onCheckboxToggle,
  onRadioChange,
  onDropdownChange,
}: TeacherFeedbackQuestionsProps) => {
  const labelClass = `text-sm font-semibold ${isLight ? 'text-slate-700' : 'text-slate-200'}`;
  const panelClass = `mt-5 rounded-3xl border p-4 sm:p-5 ${
    isLight ? 'border-slate-200 bg-slate-50/80' : 'border-white/10 bg-white/5'
  }`;
  const panelTitleClass = `text-base font-black ${isLight ? 'text-slate-950' : 'text-slate-50'}`;
  const panelHintClass = `mt-1 text-xs leading-5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`;

  return (
    <>
      <section className={panelClass}>
        <h3 className={panelTitleClass}>Teaching Feedback</h3>
        <p className={panelHintClass}>
          Share classroom, student management, and teaching workflow details for academic planning.
        </p>
        <div className="mt-4 grid gap-4">
          {teacherTextQuestions.map((question) => (
            <div key={question.id}>
              <label htmlFor={`teacher-${question.id}`} className={labelClass}>
                {question.label}
              </label>
              <textarea
                id={`teacher-${question.id}`}
                value={textAnswers[question.id]}
                onChange={(event) => onTextChange(question.id, event.target.value)}
                rows={4}
                placeholder={question.placeholder}
                className={`${inputClass} resize-none`}
              />
            </div>
          ))}
        </div>
      </section>

      <section className={panelClass}>
        <h3 className={panelTitleClass}>Teaching Ratings</h3>
        <p className={panelHintClass}>
          Use 1 for very poor and 5 for excellent.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {teacherRatingQuestions.map((question) => (
            <div
              key={question.id}
              className={`rounded-2xl border px-4 py-4 ${
                isLight ? 'border-slate-200 bg-white' : 'border-white/10 bg-slate-950/40'
              }`}
            >
              <p className={labelClass}>{question.label}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => onRatingChange(question.id, value)}
                    aria-label={`${question.label} ${value} out of 5`}
                    className={`flex h-10 w-10 items-center justify-center rounded-xl border text-sm font-black transition ${
                      value <= ratings[question.id]
                        ? 'border-amber-400 bg-amber-400 text-slate-950'
                        : isLight
                          ? 'border-slate-200 bg-slate-50 text-slate-400 hover:text-amber-500'
                          : 'border-white/10 bg-white/5 text-slate-500 hover:text-amber-300'
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={panelClass}>
        <h3 className={panelTitleClass}>Feature Usage and Materials</h3>
        <p className={panelHintClass}>
          Select every option that applies to your teaching workflow.
        </p>
        <div className="mt-4 grid gap-4">
          {teacherCheckboxQuestions.map((question) => (
            <fieldset key={question.id}>
              <legend className={labelClass}>{question.label}</legend>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {question.options.map((option) => (
                  <label
                    key={option}
                    className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                      checkboxAnswers[question.id].includes(option)
                        ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                        : isLight
                          ? 'border-slate-200 bg-white text-slate-600'
                          : 'border-white/10 bg-white/5 text-slate-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checkboxAnswers[question.id].includes(option)}
                      onChange={() => onCheckboxToggle(question.id, option)}
                      className="h-4 w-4 rounded border-slate-300 text-emerald-600"
                    />
                    {option}
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
        </div>
      </section>

      <section className={panelClass}>
        <h3 className={panelTitleClass}>Comfort and Continuity</h3>
        <div className="mt-4 grid gap-4">
          {teacherRadioQuestions.map((question) => (
            <fieldset key={question.id}>
              <legend className={labelClass}>{question.label}</legend>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {question.options.map((option) => (
                  <label
                    key={option}
                    className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                      radioAnswers[question.id] === option
                        ? 'border-indigo-500 bg-indigo-600 text-white'
                        : isLight
                          ? 'border-slate-200 bg-white text-slate-600'
                          : 'border-white/10 bg-white/5 text-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`teacher-${question.id}`}
                      checked={radioAnswers[question.id] === option}
                      onChange={() => onRadioChange(question.id, option)}
                      className="h-4 w-4 border-slate-300 text-indigo-600"
                    />
                    {option}
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
        </div>
      </section>

      <section className={panelClass}>
        <h3 className={panelTitleClass}>Teaching Profile and Usage</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {teacherDropdownQuestions.map((question) => (
            <div key={question.id}>
              <label htmlFor={`teacher-${question.id}`} className={labelClass}>
                {question.label}
              </label>
              <select
                id={`teacher-${question.id}`}
                value={dropdownAnswers[question.id]}
                onChange={(event) => onDropdownChange(question.id, event.target.value)}
                className={inputClass}
              >
                <option value="">Choose an option</option>
                {question.options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </section>
    </>
  );
};

interface InstituteFeedbackQuestionsProps {
  isLight: boolean;
  inputClass: string;
  textAnswers: typeof defaultInstituteTextAnswers;
  ratings: typeof defaultInstituteRatings;
  checkboxAnswers: typeof defaultInstituteCheckboxAnswers;
  radioAnswers: typeof defaultInstituteRadioAnswers;
  dropdownAnswers: typeof defaultInstituteDropdownAnswers;
  onTextChange: (questionId: InstituteTextQuestionId, value: string) => void;
  onRatingChange: (questionId: InstituteRatingQuestionId, value: number) => void;
  onCheckboxToggle: (questionId: InstituteCheckboxQuestionId, option: string) => void;
  onRadioChange: (questionId: InstituteRadioQuestionId, value: string) => void;
  onDropdownChange: (questionId: InstituteDropdownQuestionId, value: string) => void;
}

const InstituteFeedbackQuestions = ({
  isLight,
  inputClass,
  textAnswers,
  ratings,
  checkboxAnswers,
  radioAnswers,
  dropdownAnswers,
  onTextChange,
  onRatingChange,
  onCheckboxToggle,
  onRadioChange,
  onDropdownChange,
}: InstituteFeedbackQuestionsProps) => {
  const labelClass = `text-sm font-semibold ${isLight ? 'text-slate-700' : 'text-slate-200'}`;
  const panelClass = `mt-5 rounded-3xl border p-4 sm:p-5 ${
    isLight ? 'border-slate-200 bg-slate-50/80' : 'border-white/10 bg-white/5'
  }`;
  const panelTitleClass = `text-base font-black ${isLight ? 'text-slate-950' : 'text-slate-50'}`;
  const panelHintClass = `mt-1 text-xs leading-5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`;

  return (
    <>
      <section className={panelClass}>
        <h3 className={panelTitleClass}>Institutional Feedback</h3>
        <p className={panelHintClass}>
          Share strategic, administrative, and academic coordination feedback for institution-wide planning.
        </p>
        <div className="mt-4 grid gap-4">
          {instituteTextQuestions.map((question) => (
            <div key={question.id}>
              <label htmlFor={`institute-${question.id}`} className={labelClass}>
                {question.label}
              </label>
              <textarea
                id={`institute-${question.id}`}
                value={textAnswers[question.id]}
                onChange={(event) => onTextChange(question.id, event.target.value)}
                rows={4}
                placeholder={question.placeholder}
                className={`${inputClass} resize-none`}
              />
            </div>
          ))}
        </div>
      </section>

      <section className={panelClass}>
        <h3 className={panelTitleClass}>Institutional Ratings</h3>
        <p className={panelHintClass}>
          Use 1 for very poor and 5 for excellent.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {instituteRatingQuestions.map((question) => (
            <div
              key={question.id}
              className={`rounded-2xl border px-4 py-4 ${
                isLight ? 'border-slate-200 bg-white' : 'border-white/10 bg-slate-950/40'
              }`}
            >
              <p className={labelClass}>{question.label}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => onRatingChange(question.id, value)}
                    aria-label={`${question.label} ${value} out of 5`}
                    className={`flex h-10 w-10 items-center justify-center rounded-xl border text-sm font-black transition ${
                      value <= ratings[question.id]
                        ? 'border-amber-400 bg-amber-400 text-slate-950'
                        : isLight
                          ? 'border-slate-200 bg-slate-50 text-slate-400 hover:text-amber-500'
                          : 'border-white/10 bg-white/5 text-slate-500 hover:text-amber-300'
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={panelClass}>
        <h3 className={panelTitleClass}>Institutional Priorities</h3>
        <p className={panelHintClass}>
          Select every option that applies across your institution.
        </p>
        <div className="mt-4 grid gap-4">
          {instituteCheckboxQuestions.map((question) => (
            <fieldset key={question.id}>
              <legend className={labelClass}>{question.label}</legend>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {question.options.map((option) => (
                  <label
                    key={option}
                    className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                      checkboxAnswers[question.id].includes(option)
                        ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                        : isLight
                          ? 'border-slate-200 bg-white text-slate-600'
                          : 'border-white/10 bg-white/5 text-slate-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checkboxAnswers[question.id].includes(option)}
                      onChange={() => onCheckboxToggle(question.id, option)}
                      className="h-4 w-4 rounded border-slate-300 text-emerald-600"
                    />
                    {option}
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
        </div>
      </section>

      <section className={panelClass}>
        <h3 className={panelTitleClass}>Adoption and Deployment</h3>
        <div className="mt-4 grid gap-4">
          {instituteRadioQuestions.map((question) => (
            <fieldset key={question.id}>
              <legend className={labelClass}>{question.label}</legend>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {question.options.map((option) => (
                  <label
                    key={option}
                    className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                      radioAnswers[question.id] === option
                        ? 'border-indigo-500 bg-indigo-600 text-white'
                        : isLight
                          ? 'border-slate-200 bg-white text-slate-600'
                          : 'border-white/10 bg-white/5 text-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`institute-${question.id}`}
                      checked={radioAnswers[question.id] === option}
                      onChange={() => onRadioChange(question.id, option)}
                      className="h-4 w-4 border-slate-300 text-indigo-600"
                    />
                    {option}
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
        </div>
      </section>

      <section className={panelClass}>
        <h3 className={panelTitleClass}>Institution Profile</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {instituteDropdownQuestions.map((question) => (
            <div key={question.id}>
              <label htmlFor={`institute-${question.id}`} className={labelClass}>
                {question.label}
              </label>
              <select
                id={`institute-${question.id}`}
                value={dropdownAnswers[question.id]}
                onChange={(event) => onDropdownChange(question.id, event.target.value)}
                className={inputClass}
              >
                <option value="">Choose an option</option>
                {question.options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </section>
    </>
  );
};

export default SiteFeedbackPage;
