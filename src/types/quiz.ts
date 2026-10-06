export type QuizStatus =
  | 'DRAFT'
  | 'READY'
  | 'UPCOMING'
  | 'LIVE'
  | 'PAUSED'
  | 'STOPPED'
  | 'RESULTS_PENDING'
  | 'WINNERS_PUBLISHED';

export type HardwareAnimationType =
  | 'RESISTOR'
  | 'CAPACITOR'
  | 'LED'
  | 'TRANSISTOR'
  | 'DIODE'
  | 'RELAY'
  | 'ARDUINO'
  | 'ESP32'
  | 'ULTRASONIC_SENSOR'
  | 'IR_SENSOR'
  | 'LDR'
  | 'SERVO'
  | 'DC_MOTOR'
  | 'BUZZER'
  | 'IC'
  | 'LOGIC_GATE'
  | 'PCB'
  | 'OSCILLOSCOPE'
  | 'BREADBOARD'
  | 'CUSTOM';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  stream?: string;
  year?: string;
  rollNo?: string;
  membershipId?: string;
  photoURL?: string;
  createdAt?: string;
  lastLoginAt?: string;
  isAdmin?: boolean;
}

export interface AdminAccount {
  uid: string;
  email: string;
  role: 'superadmin' | 'quizmaster' | 'viewer';
  name?: string;
  addedAt: string;
}

export interface QuizEdition {
  id: string;
  title: string;
  description: string;
  edition: string;
  weekNumber: number;
  questionCount: number;
  durationSeconds: number;
  status: QuizStatus;
  theme: string;
  startsAt?: string;
  endsAt?: string;
  resultsPublished?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface QuestionItem {
  id: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  category: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  imageUrl?: string;
  animationType: HardwareAnimationType;
  animationAssetUrl?: string;
  active: boolean;
  explanation?: string;
  createdAt: string;
  updatedAt: string;
}

/** Sanitized question returned to participant client — NEVER contains correctAnswer */
export interface ParticipantQuestion {
  id: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  category: string;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  imageUrl?: string;
  animationType: HardwareAnimationType;
  animationAssetUrl?: string;
}

export interface AttemptRecord {
  id: string;
  uid: string;
  quizId: string;
  participantName: string;
  participantEmail: string;
  participantPhone?: string;
  participantPhotoUrl?: string;
  stream?: string;
  year?: string;
  rollNo?: string;
  membershipId?: string;
  selectedQuestionIds: string[];
  startedAt: string;
  deadline: string;
  durationSeconds: number;
  status: 'IN_PROGRESS' | 'SUBMITTED' | 'TIMED_OUT' | 'ABANDONED';
  finalized: boolean;
  submittedAt?: string;
}

export interface SubmissionRecord {
  id: string;
  attemptId: string;
  uid: string;
  quizId: string;
  quizTitle: string;
  participantName: string;
  participantEmail: string;
  participantPhone?: string;
  participantPhotoUrl?: string;
  stream?: string;
  year?: string;
  rollNo?: string;
  membershipId?: string;
  answers: Record<string, string>; // questionId -> selectedOption
  totalQuestions: number;
  attempted: number;
  correct: number;
  wrong: number;
  score: number;
  startedAt: string;
  submittedAt: string;
  timeUsed: number; // in seconds
  syncedToSheets?: boolean;
  sheetsSyncedAt?: string;
  createdAt: string;
}

export interface PublishedWinner {
  id: string;
  quizId: string;
  quizTitle: string;
  edition?: string;
  weekNumber: number;
  published: boolean;
  firstPlace: {
    uid: string;
    name: string;
    email: string;
    photoURL?: string;
    rollNo?: string;
    stream?: string;
    score?: number;
    timeUsed?: number;
    badgeTitle?: string;
  };
  secondPlace: {
    uid: string;
    name: string;
    email: string;
    photoURL?: string;
    rollNo?: string;
    stream?: string;
    score?: number;
    timeUsed?: number;
    badgeTitle?: string;
  };
  thirdPlace: {
    uid: string;
    name: string;
    email: string;
    photoURL?: string;
    rollNo?: string;
    stream?: string;
    score?: number;
    timeUsed?: number;
    badgeTitle?: string;
  };
  title?: string;
  message?: string;
  publishedAt?: string;
  publishedBy?: string;
}

export interface LeaderboardRankingItem {
  rank: number;
  uid?: string;
  participantName: string;
  score: number;
  totalQuestions: number;
  timeUsed: number; // in seconds
  accuracyPercentage?: number;
  badgeTitle?: string;
  submittedAt?: string;
}

export interface LeaderboardRecord {
  id: string;
  quizId: string;
  quizTitle: string;
  edition: string;
  weekNumber: number;
  finalizedAt: string;
  published: boolean;
  totalParticipants: number;
  averageScore?: number;
  fastestTime?: number;
  rankings: LeaderboardRankingItem[];
}

export interface AnimationPresetInfo {
  type: HardwareAnimationType;
  name: string;
  category: 'Passive' | 'Semiconductors' | 'Electromechanical' | 'Digital/MCU' | 'Sensors' | 'Prototyping';
  description: string;
  componentSymbol: string;
}

export type AuditEventType =
  | 'QUIZ_START'
  | 'QUIZ_SUBMIT'
  | 'STATUS_CHANGE'
  | 'WINNERS_PUBLISHED'
  | 'WINNERS_UNPUBLISHED'
  | 'QUESTION_MUTATION'
  | 'SHEETS_SYNC'
  | 'NOTIFICATION_DISPATCH'
  | 'CONFIG_CHANGE';

export interface AuditLogItem {
  id: string;
  eventType: AuditEventType;
  category: 'SECURITY' | 'QUIZ' | 'ADMIN' | 'INTEGRATION';
  severity: 'INFO' | 'WARN' | 'CRITICAL';
  actorUid?: string;
  actorEmail?: string;
  actorName?: string;
  details: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

export interface EmailNotification {
  id: string;
  quizId: string;
  quizTitle: string;
  recipientEmail: string;
  recipientName: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  rank?: number;
  timeUsed?: number;
  badgeTitle?: string;
  winnersPageUrl: string;
  subject: string;
  html: string;
  status: 'SENT' | 'QUEUED' | 'FAILED';
  sentAt: string;
  error?: string;
}
