import { FileDown } from 'lucide-react';
import { useCallback } from 'react';

const studentTextQuestions = [
  {
    id: 'mostHelpfulFeature',
    label:
      'Which laboratory simulation or interactive visualization helped you understand a concept best, and why?',
    placeholder:
      'Example: Physics electromagnetism simulation, Chemistry acid-base titration titration curve, etc.',
  },
  {
    id: 'difficulties',
    label:
      'What technical issues did you face while running or interacting with the 3D/graphical lab visualizations?',
    placeholder:
      'Share loading delays, lag in graphics, drag-and-drop issues, simulation resets, or device crashes.',
  },
  {
    id: 'onlineClassExperience',
    label:
      'How interactive and collaborative was your experience during live virtual lab sessions?',
    placeholder:
      'Share your experience collaborating on live lab tools, audio/video clarity, and instructor guidance.',
  },
  {
    id: 'improvements',
    label:
      'What improvements would you suggest for better learning?',
    placeholder:
      'Suggest changes that would make LabZero more useful for your studies.',
  },
  {
    id: 'additionalComments',
    label:
      'Any additional comments regarding student experience?',
    placeholder:
      'Add anything else you want your teacher or the LabZero team to know.',
  },
];

const studentRatingQuestions = [
  {
    id: 'overallUsability',
    label: 'Rate the overall usability of LabZero.',
  },
  {
    id: 'classroomInteraction',
    label:
      'Rate the quality of classroom interaction.',
  },
  {
    id: 'studyMaterialsAccess',
    label:
      'Rate the ease of accessing study resources and lecture notes.',
  },
  {
    id: 'platformSpeed',
    label:
      'Rate the responsiveness and interactive control smoothness of the lab simulations.',
  },
  {
    id: 'overallLearning',
    label:
      'Rate how well the virtual lab simulation matched your real-world lab expectations.',
  },
];

const studentCheckboxQuestions = [
  {
    id: 'regularFeatures',
    label: 'Which features do you use regularly?',
    options: [
      'Live Video Call & Classroom Screen',
      '3D Interactive Simulations',
      'Graphical Data Visualizer',
      'Collaborative Lab Notebook / Whiteboard',
      'Procedure / Experiment Manuals',
      'Chat & Instant Messaging',
    ],
  },
  {
    id: 'desiredImprovements',
    label: 'What improvements would you like?',
    options: [
      'More Virtual Lab experiments',
      'Smoother 3D Graphics Rendering',
      'Step-by-step interactive hints during simulations',
      'Improved Graphing/Data plotting tools',
      'Offline mode support for simulations',
      'Better mobile touch controls for lab equipment',
    ],
  },
  {
    id: 'devicesUsed',
    label: 'Which devices do you use for LabZero?',
    options: ['Mobile', 'Laptop', 'Tablet', 'Desktop'],
  },
];

const studentRadioQuestions = [
  {
    id: 'usageFrequency',
    label:
      'What is your initial impression of the LabZero onboarding tour?',
    options: [
      'Very clear and helpful',
      'Somewhat clear',
      'Confusing / needs improvements',
      'I skipped/did not notice it',
    ],
  },
  {
    id: 'overallSatisfaction',
    label: 'Overall satisfaction with the platform?',
    options: ['Excellent', 'Good', 'Average', 'Poor'],
  },
  {
    id: 'wouldRecommend',
    label:
      'How easily can you follow laboratory procedures using the platform?',
    options: [
      'Very easily',
      'With minor guide help',
      'With major difficulties',
      'Not at all',
    ],
  },
];

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
    label: 'Select your student level / institution type.',
    options: [
      'High School (Grades 9-12)',
      'Undergraduate (B.Sc / B.Tech / B.E)',
      'Postgraduate (M.Sc / M.Tech / Ph.D)',
      'Vocational / Diploma school',
    ],
  },
  {
    id: 'internetQuality',
    label: 'Select your internet connectivity quality.',
    options: ['Excellent', 'Good', 'Average', 'Poor', 'Unstable'],
  },
  {
    id: 'primaryUsageTime',
    label:
      'Select how easily you were able to navigate to the lab visualization page.',
    options: [
      'Very easily (Immediate)',
      'Took some searching',
      'Had to use the onboarding guide',
      'Difficult / got lost',
    ],
  },
];

const printStyles = `
  <style>
    @page {
      size: A4;
      margin: 18mm 16mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif;
      color: #1e293b;
      background: #fff;
      line-height: 1.5;
      font-size: 10.5pt;
    }
    .pdf-header {
      text-align: center;
      padding-bottom: 14px;
      border-bottom: 3px solid #4f46e5;
      margin-bottom: 18px;
    }
    .pdf-header h1 {
      font-size: 18pt;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: 0.02em;
    }
    .pdf-header .subtitle {
      font-size: 9pt;
      color: #64748b;
      margin-top: 4px;
    }
    .pdf-header .badge {
      display: inline-block;
      font-size: 7.5pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      color: #4f46e5;
      border: 1px solid #c7d2fe;
      border-radius: 999px;
      padding: 2px 12px;
      margin-bottom: 6px;
    }
    .section {
      margin-top: 16px;
      page-break-inside: avoid;
    }
    .section-title {
      font-size: 12pt;
      font-weight: 800;
      color: #0f172a;
      border-bottom: 1.5px solid #e2e8f0;
      padding-bottom: 4px;
      margin-bottom: 8px;
    }
    .section-hint {
      font-size: 8.5pt;
      color: #64748b;
      margin-bottom: 10px;
    }
    .question {
      margin-bottom: 10px;
    }
    .question-label {
      font-size: 10pt;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 3px;
    }
    .question-label .required {
      font-size: 7.5pt;
      font-weight: 500;
      color: #e11d48;
      margin-left: 2px;
    }
    .question-placeholder {
      font-size: 8pt;
      color: #94a3b8;
      font-style: italic;
      margin-left: 2px;
    }
    .rating-scale {
      display: flex;
      gap: 6px;
      margin-top: 4px;
    }
    .rating-dot {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      border: 1.5px solid #cbd5e1;
      border-radius: 6px;
      font-size: 9pt;
      font-weight: 700;
      color: #475569;
      background: #f8fafc;
    }
    .rating-labels {
      display: flex;
      justify-content: space-between;
      font-size: 7pt;
      color: #94a3b8;
      margin-top: 2px;
      max-width: 170px;
    }
    .option-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4px 12px;
      margin-top: 3px;
    }
    .option-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 9pt;
      color: #334155;
      padding: 2px 0;
    }
    .option-checkbox,
    .option-radio {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 14px;
      height: 14px;
      border: 1.5px solid #94a3b8;
      flex-shrink: 0;
    }
    .option-checkbox {
      border-radius: 3px;
    }
    .option-radio {
      border-radius: 50%;
    }
    .footer {
      margin-top: 20px;
      padding-top: 12px;
      border-top: 1.5px solid #e2e8f0;
      font-size: 7.5pt;
      color: #94a3b8;
      text-align: center;
    }
    .field-group {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px 16px;
      margin-bottom: 12px;
    }
    .field-label {
      font-size: 8.5pt;
      font-weight: 600;
      color: #475569;
      display: block;
      margin-bottom: 2px;
    }
    .field-input {
      display: block;
      width: 100%;
      border: 1px solid #cbd5e1;
      border-radius: 4px;
      padding: 5px 8px;
      font-size: 9pt;
      color: #1e293b;
      background: #fff;
    }
    .info-box {
      background: #eef2ff;
      border: 1px solid #c7d2fe;
      border-radius: 6px;
      padding: 8px 10px;
      font-size: 8.5pt;
      color: #4338ca;
      margin-top: 4px;
      margin-bottom: 6px;
    }
    .info-box strong {
      font-weight: 700;
    }
    .checkbox-section {
      page-break-inside: avoid;
    }
    @media print {
      .no-print {
        display: none !important;
      }
    }
  </style>
`;

const buildPdfHtml = () => {
  const questionsHtml = (label: string) =>
    `<div class="question">
      <div class="question-label">${label}<span class="required">(required)</span></div>
    </div>`;

  const textQuestionsHtml = studentTextQuestions
    .map(
      (q) => `
    <div class="question">
      <div class="question-label">${q.label}<span class="required">(required)</span></div>
      ${q.id === 'onlineClassExperience'
          ? `<div class="info-box"><strong>To test and access this feature:</strong> Have one group member register as a teacher to create a classroom in the teacher dashboard, and other team members join that classroom as a student. Teacher can also upload notes/assignments from teacher dashboard that can be viewed by the student.</div>`
          : ''
        }
      <div class="question-placeholder">${q.placeholder}</div>
      <div style="margin-top:4px;border:1px solid #e2e8f0;border-radius:4px;min-height:60px;background:#fafafa;"></div>
    </div>`
    )
    .join('');

  const ratingQuestionsHtml = studentRatingQuestions
    .map(
      (q) => `
    <div class="question">
      <div class="question-label">${q.label}<span class="required">(required)</span></div>
      <div class="rating-scale">
        ${[1, 2, 3, 4, 5]
          .map((v) => `<span class="rating-dot">${v}</span>`)
          .join('')}
      </div>
      <div class="rating-labels">
        <span>Very poor</span>
        <span>Excellent</span>
      </div>
    </div>`
    )
    .join('');

  const checkboxQuestionsHtml = studentCheckboxQuestions
    .map(
      (q) => `
    <div class="question checkbox-section">
      <div class="question-label">${q.label}<span class="required">(required)</span></div>
      <div class="option-grid">
        ${q.options
          .map(
            (opt) =>
              `<div class="option-item"><span class="option-checkbox"></span>${opt}</div>`
          )
          .join('')}
      </div>
    </div>`
    )
    .join('');

  const radioQuestionsHtml = studentRadioQuestions
    .map(
      (q) => `
    <div class="question">
      <div class="question-label">${q.label}<span class="required">(required)</span></div>
      <div class="option-grid">
        ${q.options
          .map(
            (opt) =>
              `<div class="option-item"><span class="option-radio"></span>${opt}</div>`
          )
          .join('')}
      </div>
    </div>`
    )
    .join('');

  const dropdownQuestionsHtml = studentDropdownQuestions
    .map(
      (q) => `
    <div class="question">
      <div class="question-label">${q.label}<span class="required">(required)</span></div>
      <div class="option-grid">
        <div class="option-item" style="font-style:italic;color:#94a3b8;">— Choose an option —</div>
        ${q.options
          .map(
            (opt) =>
              `<div class="option-item"><span class="option-radio"></span>${opt}</div>`
          )
          .join('')}
      </div>
    </div>`
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>LabZero - Student Feedback Form</title>
      ${printStyles}
    </head>
    <body>
      <div class="pdf-header">
        <div class="badge">Student Feedback</div>
        <h1>Student Learning Feedback</h1>
        <p class="subtitle">Share feedback about your course, teacher, live class, resources, assignments, and overall learning experience.</p>
      </div>

      <div class="field-group">
        <div><span class="field-label">Course</span><div class="field-input"></div></div>
        <div><span class="field-label">Classroom</span><div class="field-input"></div></div>
        <div><span class="field-label">Session</span><div class="field-input"></div></div>
      </div>

      <div class="section">
        <div class="section-title">Written Feedback</div>
        <div class="section-hint">Share specific details so teachers and administrators can understand the student experience clearly.</div>
        ${textQuestionsHtml}
      </div>

      <div class="section">
        <div class="section-title">Ratings</div>
        <div class="section-hint">Use 1 for very poor and 5 for excellent.</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px 16px;">
          ${ratingQuestionsHtml}
        </div>
      </div>

      <div class="section">
        <div class="section-title">Feature Usage and Improvements</div>
        <div class="section-hint">Select every option that applies.</div>
        ${checkboxQuestionsHtml}
      </div>

      <div class="section">
        <div class="section-title">Usage and Satisfaction</div>
        ${radioQuestionsHtml}
      </div>

      <div class="section">
        <div class="section-title">Academic and Access Details</div>
        ${dropdownQuestionsHtml}
      </div>

      <div class="footer">
        LabZero &mdash; Intelligent Collaborative Learning &amp; Virtual Classroom Platform &mdash; Student Feedback Form
      </div>
    </body>
    </html>
  `;
};

const FeedbackFormPdfGenerator = () => {
  const handleDownloadPdf = useCallback(() => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      return;
    }

    printWindow.document.write(buildPdfHtml());
    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
    }, 600);
  }, []);

  return (
    <button
      type="button"
      onClick={handleDownloadPdf}
      className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
    >
      <FileDown size={16} />
      Download Form PDF
    </button>
  );
};

export { buildPdfHtml, studentTextQuestions, studentRatingQuestions, studentCheckboxQuestions, studentRadioQuestions, studentDropdownQuestions };
export default FeedbackFormPdfGenerator;
