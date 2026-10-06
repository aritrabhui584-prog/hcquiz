import { SubmissionRecord } from '../types/quiz';

export interface GoogleSheetsConfig {
  spreadsheetId?: string;
  webhookUrl?: string; // Supports Google Apps Script Webhook or Google Cloud Function
  serviceAccountConfigured?: boolean;
}

export async function appendSubmissionToGoogleSheets(
  submission: SubmissionRecord,
  quizTitle: string
): Promise<{ success: boolean; error?: string }> {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;

  // If a Google Apps Script Webhook or Sheet Sync Webhook URL is configured
  if (webhookUrl) {
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'append_submission',
          spreadsheetId: spreadsheetId || '',
          sheet1_participant: [
            submission.uid,
            submission.participantName,
            submission.participantEmail,
            submission.participantPhone || 'N/A',
            submission.participantPhotoUrl || 'N/A',
            submission.stream || 'N/A',
            submission.year || 'N/A',
            submission.rollNo || 'N/A',
            submission.membershipId || 'N/A',
            submission.quizId,
            quizTitle,
            submission.startedAt,
            submission.submittedAt,
            submission.timeUsed,
            'SUBMITTED',
            submission.score
          ],
          sheet2_answerScript: [
            submission.uid,
            submission.participantName,
            submission.participantEmail,
            submission.rollNo || 'N/A',
            submission.quizId,
            ...Object.entries(submission.answers).map(([qId, ans]) => `${qId}:${ans}`),
            submission.correct,
            submission.wrong,
            submission.score,
            submission.timeUsed
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`Google Sheets Webhook responded with ${response.status}`);
      }

      return { success: true };
    } catch (err) {
      console.error('Google Sheets sync error (saved in Firestore, retryable):', err);
      return { success: false, error: err instanceof Error ? err.message : String(err) };
    }
  }

  // If only SPREADSHEET_ID is set without webhook, log notice and return pending state
  if (spreadsheetId) {
    console.info(`[GoogleSheetsAdapter] Submission ${submission.id} ready for Sheet ID: ${spreadsheetId}`);
    return { success: true };
  }

  // Graceful fallback: Submission is safely saved in Firestore with syncedToSheets: false
  return {
    success: false,
    error: 'GOOGLE_SHEETS_SPREADSHEET_ID or GOOGLE_SHEETS_WEBHOOK_URL not configured in environment.'
  };
}

/**
 * Generate CSV rows for Sheet 1 (Participants)
 */
export function generateParticipantsCsv(submissions: SubmissionRecord[]): string {
  const headers = [
    'Participant ID',
    'Name',
    'Email',
    'Phone',
    'Profile Photo URL',
    'Stream',
    'Year',
    'Roll No',
    'HC Membership ID',
    'Quiz ID',
    'Quiz Name',
    'Started At',
    'Submitted At',
    'Time Used (s)',
    'Status',
    'Score'
  ];

  const rows = submissions.map((sub) => [
    `"${sub.uid}"`,
    `"${sub.participantName.replace(/"/g, '""')}"`,
    `"${sub.participantEmail}"`,
    `"${sub.participantPhone || ''}"`,
    `"${(sub.participantPhotoUrl || '').replace(/"/g, '""')}"`,
    `"${(sub.stream || '').replace(/"/g, '""')}"`,
    `"${(sub.year || '').replace(/"/g, '""')}"`,
    `"${(sub.rollNo || '').replace(/"/g, '""')}"`,
    `"${(sub.membershipId || '').replace(/"/g, '""')}"`,
    `"${sub.quizId}"`,
    `"${sub.quizTitle.replace(/"/g, '""')}"`,
    `"${sub.startedAt}"`,
    `"${sub.submittedAt}"`,
    sub.timeUsed,
    '"SUBMITTED"',
    sub.score
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

/**
 * Generate CSV rows for Sheet 2 (Answer Scripts)
 */
export function generateAnswerScriptsCsv(submissions: SubmissionRecord[]): string {
  // Extract up to 25 question headers
  const qHeaders = Array.from({ length: 25 }, (_, i) => `Q${String(i + 1).padStart(2, '0')}`);
  const headers = [
    'Participant ID',
    'Name',
    'Email',
    'Quiz ID',
    ...qHeaders,
    'Correct',
    'Wrong',
    'Score',
    'Time Used (s)'
  ];

  const rows = submissions.map((sub) => {
    const answersList = Object.values(sub.answers);
    const qCols = qHeaders.map((_, idx) => `"${answersList[idx] || '-'}"`);
    return [
      `"${sub.uid}"`,
      `"${sub.participantName.replace(/"/g, '""')}"`,
      `"${sub.participantEmail}"`,
      `"${sub.quizId}"`,
      ...qCols,
      sub.correct,
      sub.wrong,
      sub.score,
      sub.timeUsed
    ];
  });

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

/**
 * Generate CSV rows for Question Bank Template / Export
 */
export function generateQuestionsBankCsv(
  questions: {
    id?: string;
    questionText: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correctAnswer: string;
    category: string;
    difficulty: string;
    animationType: string;
    explanation?: string;
    imageUrl?: string;
  }[],
  templateOnly = false
): string {
  const headers = [
    'id',
    'questionText',
    'optionA',
    'optionB',
    'optionC',
    'optionD',
    'correctAnswer',
    'category',
    'difficulty',
    'animationType',
    'explanation',
    'imageUrl'
  ];

  if (templateOnly || questions.length === 0) {
    const sampleRows = [
      [
        '"q_sample_01"',
        '"What is the typical forward voltage drop of a standard red LED?"',
        '"0.7V"',
        '"1.8V to 2.2V"',
        '"3.3V"',
        '"5.0V"',
        '"B"',
        '"Semiconductors"',
        '"EASY"',
        '"LED"',
        '"Standard red GaAsP LEDs typically exhibit a 1.8V to 2.2V forward drop."',
        '""'
      ].join(','),
      [
        '"q_sample_02"',
        '"Which pin on an ATmega328P (Arduino Uno) supports PWM output?"',
        '"Pin 2"',
        '"Pin 4"',
        '"Pin 9"',
        '"Pin 12"',
        '"C"',
        '"Microcontrollers"',
        '"MEDIUM"',
        '"ARDUINO"',
        '"Pins 3, 5, 6, 9, 10, and 11 provide 8-bit PWM output via timer compare registers."',
        '""'
      ].join(',')
    ];
    return [headers.join(','), ...sampleRows].join('\n');
  }

  const rows = questions.map((q) => [
    `"${(q.id || '').replace(/"/g, '""')}"`,
    `"${(q.questionText || '').replace(/"/g, '""')}"`,
    `"${(q.optionA || '').replace(/"/g, '""')}"`,
    `"${(q.optionB || '').replace(/"/g, '""')}"`,
    `"${(q.optionC || '').replace(/"/g, '""')}"`,
    `"${(q.optionD || '').replace(/"/g, '""')}"`,
    `"${(q.correctAnswer || 'A').replace(/"/g, '""')}"`,
    `"${(q.category || 'Components').replace(/"/g, '""')}"`,
    `"${(q.difficulty || 'MEDIUM').replace(/"/g, '""')}"`,
    `"${(q.animationType || 'IC').replace(/"/g, '""')}"`,
    `"${(q.explanation || '').replace(/"/g, '""')}"`,
    `"${(q.imageUrl || '').replace(/"/g, '""')}"`
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}
