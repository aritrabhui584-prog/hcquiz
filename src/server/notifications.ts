import { collection, doc, getDocs, query, setDoc, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { PublishedWinner, SubmissionRecord, EmailNotification } from '../types/quiz';
import { logAuditEvent } from './audit';

interface WinnerNotificationResult {
  success: boolean;
  totalNotified: number;
  notifications: EmailNotification[];
  errors: string[];
}

/**
 * Generates responsive, high-contrast AEC Hardware Club branded HTML email for participants
 */
export function generateParticipantEmailHtml(params: {
  recipientName: string;
  quizTitle: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  rank: number;
  timeUsed: number;
  winnersPageUrl: string;
  firstPlace?: { name?: string; score?: number; badgeTitle?: string };
  secondPlace?: { name?: string; score?: number };
  thirdPlace?: { name?: string; score?: number };
}): string {
  const {
    recipientName,
    quizTitle,
    score,
    totalQuestions,
    percentage,
    rank,
    timeUsed,
    winnersPageUrl,
    firstPlace,
    secondPlace,
    thirdPlace,
  } = params;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AEC Hardware Club - Results Announced</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #070b0e;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #e2e8f0;
    }
    .wrapper {
      max-width: 600px;
      margin: 0 auto;
      padding: 32px 20px;
      background-color: #0d1319;
      border: 1px solid rgba(16, 185, 129, 0.2);
      border-radius: 12px;
    }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: #34d399;
      background: rgba(16, 185, 129, 0.12);
      border: 1px solid rgba(16, 185, 129, 0.3);
      border-radius: 9999px;
      margin-bottom: 12px;
    }
    h1 {
      color: #ffffff;
      font-size: 24px;
      font-weight: 800;
      margin: 0 0 8px 0;
      text-transform: uppercase;
      letter-spacing: -0.5px;
    }
    .subtitle {
      color: #94a3b8;
      font-size: 14px;
      margin-bottom: 24px;
    }
    .score-card {
      background: #121a22;
      border: 1px solid rgba(16, 185, 129, 0.25);
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 24px;
    }
    .score-stat {
      display: inline-block;
      width: 48%;
      vertical-align: top;
      margin-bottom: 12px;
    }
    .stat-label {
      font-size: 11px;
      color: #64748b;
      text-transform: uppercase;
      font-weight: 600;
      letter-spacing: 0.5px;
    }
    .stat-val {
      font-size: 20px;
      color: #10b981;
      font-weight: 800;
      margin-top: 2px;
    }
    .podium-box {
      background: #090e13;
      border: 1px solid #1e293b;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 24px;
    }
    .btn-container {
      text-align: center;
      margin: 32px 0 20px 0;
    }
    .btn {
      display: inline-block;
      padding: 14px 32px;
      background: #10b981;
      color: #021a12 !important;
      font-weight: 800;
      font-size: 14px;
      text-decoration: none;
      border-radius: 8px;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    .footer {
      font-size: 12px;
      color: #64748b;
      text-align: center;
      margin-top: 32px;
      border-top: 1px solid #1e293b;
      padding-top: 16px;
    }
  </style>
</head>
<body>
  <div style="padding: 24px 10px;">
    <div class="wrapper">
      <div class="badge">AEC Hardware Club • Official Evaluation</div>
      <h1>Official Results Announced</h1>
      <div class="subtitle">The evaluation committee has published the final standings for <strong>${quizTitle}</strong>.</div>

      <p style="font-size: 15px; line-height: 1.5; color: #cbd5e1; margin-bottom: 20px;">
        Hello <strong>${recipientName}</strong>,<br>
        Thank you for competing in the AEC Hardware Club challenge. Your submission has been verified against the official answer keys. Below is your confirmed score script:
      </p>

      <div class="score-card">
        <div class="score-stat">
          <div class="stat-label">Final Verified Score</div>
          <div class="stat-val">${score} / ${totalQuestions}</div>
        </div>
        <div class="score-stat">
          <div class="stat-label">Accuracy</div>
          <div class="stat-val">${percentage}%</div>
        </div>
        <div class="score-stat">
          <div class="stat-label">Time Consumed</div>
          <div class="stat-val" style="color: #38bdf8;">${timeUsed}s</div>
        </div>
        <div class="score-stat">
          <div class="stat-label">Leaderboard Rank</div>
          <div class="stat-val" style="color: #f59e0b;">#${rank}</div>
        </div>
      </div>

      <div class="podium-box">
        <div style="font-size: 12px; font-weight: 700; color: #e2e8f0; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 0.5px;">
          🏆 Challenge Honor Roll
        </div>
        <div style="font-size: 13px; color: #cbd5e1; line-height: 1.6;">
          🥇 <strong>1st Place Champion:</strong> ${firstPlace?.name || 'TBD'} (${firstPlace?.score ?? 0} pts - ${firstPlace?.badgeTitle || 'Grand Hardware Architect'})<br>
          🥈 <strong>2nd Place Finalist:</strong> ${secondPlace?.name || 'TBD'} (${secondPlace?.score ?? 0} pts)<br>
          🥉 <strong>3rd Place Finalist:</strong> ${thirdPlace?.name || 'TBD'} (${thirdPlace?.score ?? 0} pts)
        </div>
      </div>

      <div class="btn-container">
        <a href="${winnersPageUrl}" class="btn" target="_blank" rel="noopener noreferrer">
          View Interactive Winners Podium &rarr;
        </a>
      </div>

      <p style="font-size: 12px; color: #94a3b8; text-align: center; margin-top: 12px;">
        Or visit directly at: <a href="${winnersPageUrl}" style="color: #34d399; word-break: break-all;">${winnersPageUrl}</a>
      </p>

      <div class="footer">
        Asansol Engineering College • Hardware & Embedded Systems Club<br>
        This is an automated notification triggered upon official results verification.
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Triggers automated participant email notifications for published winners
 */
export async function dispatchWinnerNotificationEmails(
  winnersData: Partial<PublishedWinner>,
  originBaseUrl?: string
): Promise<WinnerNotificationResult> {
  const result: WinnerNotificationResult = {
    success: false,
    totalNotified: 0,
    notifications: [],
    errors: [],
  };

  const quizId = winnersData.quizId || 'quiz_week_01';
  const quizTitle = winnersData.quizTitle || 'AEC Hardware Club Weekly Quiz';

  // Determine base url for winners link
  const baseUrl =
    originBaseUrl ||
    process.env.APP_BASE_URL ||
    process.env.PUBLIC_APP_URL ||
    'https://ais-dev-7zmwjvtyuqvtfanoi2rdjv-401830526350.asia-southeast1.run.app';
  const winnersPageUrl = `${baseUrl}/winners`;

  try {
    // 1. Fetch participant submissions for this quiz
    let submissionsSnap = await getDocs(
      query(collection(db, 'submissions'), where('quizId', '==', quizId))
    );

    // Fallback if submissions don't have quizId match
    if (submissionsSnap.empty) {
      submissionsSnap = await getDocs(collection(db, 'submissions'));
    }

    if (submissionsSnap.empty) {
      result.errors.push('No submissions found to notify.');
      return result;
    }

    const submissionsList: SubmissionRecord[] = submissionsSnap.docs.map(
      (d) => d.data() as SubmissionRecord
    );

    // Sort descending by score, ascending by timeUsed
    submissionsList.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return (a.timeUsed || 0) - (b.timeUsed || 0);
    });

    const nowIso = new Date().toISOString();

    for (let i = 0; i < submissionsList.length; i++) {
      const sub = submissionsList[i];
      const recipientEmail = sub.participantEmail;

      if (!recipientEmail || !recipientEmail.includes('@')) {
        continue;
      }

      const score = sub.score || 0;
      const totalQuestions = sub.totalQuestions || 25;
      const percentage = Math.round((score / totalQuestions) * 100);
      const rank = i + 1;
      const timeUsed = sub.timeUsed || 0;
      const recipientName = sub.participantName || 'Hardware Competitor';

      const subject = `🏆 AEC Hardware Club: Results Published for ${quizTitle} - Your Score: ${score}/${totalQuestions}`;
      const html = generateParticipantEmailHtml({
        recipientName,
        quizTitle,
        score,
        totalQuestions,
        percentage,
        rank,
        timeUsed,
        winnersPageUrl,
        firstPlace: winnersData.firstPlace,
        secondPlace: winnersData.secondPlace,
        thirdPlace: winnersData.thirdPlace,
      });

      const notificationId = `notif_${quizId}_${sub.id}`;
      const notification: EmailNotification = {
        id: notificationId,
        quizId,
        quizTitle,
        recipientEmail,
        recipientName,
        score,
        totalQuestions,
        percentage,
        rank,
        timeUsed,
        winnersPageUrl,
        subject,
        html,
        status: 'SENT',
        sentAt: nowIso,
      };

      // Store in Firestore 'email_notifications' collection
      await setDoc(doc(db, 'email_notifications', notificationId), notification, { merge: true });

      // Store in 'mail' collection (Firebase Trigger Email extension format)
      await setDoc(
        doc(db, 'mail', notificationId),
        {
          to: recipientEmail,
          message: {
            subject,
            html,
            text: `Dear ${recipientName},\n\nThe official results for ${quizTitle} have been published.\nYour Score: ${score}/${totalQuestions} (${percentage}%)\nTime: ${timeUsed}s\nRank: #${rank}\n\nView the Winners Podium: ${winnersPageUrl}\n\nAEC Hardware Club`,
          },
          status: 'QUEUED',
          createdAt: nowIso,
        },
        { merge: true }
      );

      result.notifications.push(notification);
      result.totalNotified += 1;
    }

    // Record audit event
    await logAuditEvent({
      eventType: 'NOTIFICATION_DISPATCH',
      category: 'INTEGRATION',
      severity: 'INFO',
      actorEmail: 'system@aechardware.club',
      actorName: 'Automated Notification Engine',
      details: `Dispatched automated email notifications to ${result.totalNotified} participants for "${quizTitle}".`,
      metadata: {
        quizId,
        totalNotified: result.totalNotified,
        winnersPageUrl,
      },
    });

    result.success = true;
    return result;
  } catch (err: any) {
    console.error('Error dispatching winner notification emails:', err);
    result.errors.push(err.message || 'Failed to dispatch email notifications.');
    return result;
  }
}
