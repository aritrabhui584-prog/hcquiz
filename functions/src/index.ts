import { onDocumentWritten } from "firebase-functions/v2/firestore";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

interface WinnerPodiumEntry {
  uid?: string;
  name?: string;
  email?: string;
  score?: number;
  timeUsed?: number;
  badgeTitle?: string;
}

interface PublishedWinnerDoc {
  id: string;
  quizId?: string;
  quizTitle?: string;
  weekNumber?: number;
  published: boolean;
  publishedAt?: string;
  firstPlace?: WinnerPodiumEntry;
  secondPlace?: WinnerPodiumEntry;
  thirdPlace?: WinnerPodiumEntry;
}

/**
 * Generates responsive, high-contrast AEC Hardware Club branded HTML email for participants
 */
function generateParticipantEmailHtml(params: {
  recipientName: string;
  quizTitle: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  rank: number;
  timeUsed: number;
  winnersPageUrl: string;
  firstPlace?: WinnerPodiumEntry;
  secondPlace?: WinnerPodiumEntry;
  thirdPlace?: WinnerPodiumEntry;
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
    .podium-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #16202c;
      font-size: 13px;
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
          🥇 <strong>1st Place Champion:</strong> ${firstPlace?.name || 'TBD'} (${firstPlace?.score || 0} pts - ${firstPlace?.badgeTitle || 'Grand Hardware Architect'})<br>
          🥈 <strong>2nd Place Finalist:</strong> ${secondPlace?.name || 'TBD'} (${secondPlace?.score || 0} pts)<br>
          🥉 <strong>3rd Place Finalist:</strong> ${thirdPlace?.name || 'TBD'} (${thirdPlace?.score || 0} pts)
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
 * Firebase Cloud Function: onWinnersPublished
 * Triggers automatically whenever a document in 'winners/{winnerId}' is written with published == true
 */
export const onWinnersPublished = onDocumentWritten(
  {
    document: "winners/{winnerId}",
    region: "asia-southeast1",
  },
  async (event) => {
    const afterData = event.data?.after?.data() as PublishedWinnerDoc | undefined;
    const beforeData = event.data?.before?.data() as PublishedWinnerDoc | undefined;

    // Check if the document was deleted or is not published
    if (!afterData || afterData.published !== true) {
      logger.info("Winners document not published or was unpublished. Skipping email trigger.");
      return;
    }

    // Check if already triggered for this exact publication cycle
    if (beforeData?.published === true && beforeData?.publishedAt === afterData.publishedAt) {
      logger.info("Winners document published status unchanged. Skipping duplicate trigger.");
      return;
    }

    const winnerId = event.params.winnerId;
    const quizId = afterData.quizId || winnerId.replace("win_", "");
    const quizTitle = afterData.quizTitle || "AEC Hardware Club Weekly Quiz";

    // Fallback baseUrl from environment or standard deployed domain
    const appBaseUrl =
      process.env.APP_BASE_URL ||
      process.env.PUBLIC_APP_URL ||
      "https://ais-dev-7zmwjvtyuqvtfanoi2rdjv-401830526350.asia-southeast1.run.app";
    const winnersPageUrl = `${appBaseUrl}/winners`;

    logger.info(`Winners published for quizId="${quizId}". Starting participant notification trigger...`);

    try {
      // 1. Fetch all submissions for this quiz to identify participants and scores
      let submissionsSnap = await db
        .collection("submissions")
        .where("quizId", "==", quizId)
        .get();

      // If no submissions match exact quizId, look for recent submissions
      if (submissionsSnap.empty) {
        logger.warn(`No submissions found for quizId="${quizId}", querying general submissions bank`);
        submissionsSnap = await db.collection("submissions").limit(100).get();
      }

      if (submissionsSnap.empty) {
        logger.info("No submissions found to notify.");
        return;
      }

      // Sort submissions by score desc, then timeUsed asc to compute authoritative rank
      const submissionsList = submissionsSnap.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as any[];

      submissionsList.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return (a.timeUsed || 0) - (b.timeUsed || 0);
      });

      const batch = db.batch();
      let emailCount = 0;
      const nowIso = new Date().toISOString();

      for (let i = 0; i < submissionsList.length; i++) {
        const sub = submissionsList[i];
        const recipientEmail = sub.participantEmail || sub.email;

        if (!recipientEmail || !recipientEmail.includes("@")) {
          logger.warn(`Submission ${sub.id} missing valid email (${recipientEmail}). Skipping.`);
          continue;
        }

        const score = typeof sub.score === "number" ? sub.score : 0;
        const totalQuestions = typeof sub.totalQuestions === "number" ? sub.totalQuestions : 30;
        const percentage = Math.round((score / totalQuestions) * 100);
        const rank = i + 1;
        const timeUsed = typeof sub.timeUsed === "number" ? sub.timeUsed : 0;
        const recipientName = sub.participantName || sub.name || "Hardware Competitor";

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
          firstPlace: afterData.firstPlace,
          secondPlace: afterData.secondPlace,
          thirdPlace: afterData.thirdPlace,
        });

        const notificationId = `notif_${quizId}_${sub.id}`;
        const notifRef = db.collection("email_notifications").doc(notificationId);

        batch.set(
          notifRef,
          {
            id: notificationId,
            quizId,
            quizTitle,
            submissionId: sub.id,
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
            status: "SENT",
            sentAt: nowIso,
            source: "FIREBASE_CLOUD_FUNCTION",
          },
          { merge: true }
        );

        // Standard Firebase "Trigger Email" extension compatibility (writes to 'mail' collection)
        const mailRef = db.collection("mail").doc(notificationId);
        batch.set(
          mailRef,
          {
            to: recipientEmail,
            message: {
              subject,
              html,
              text: `Dear ${recipientName},\n\nThe official results for ${quizTitle} have been published.\nYour Score: ${score}/${totalQuestions} (${percentage}%)\nTime: ${timeUsed}s\nRank: #${rank}\n\nView the Winners Podium: ${winnersPageUrl}\n\nAEC Hardware Club`,
            },
            status: "QUEUED",
            createdAt: nowIso,
          },
          { merge: true }
        );

        emailCount++;
      }

      // Record audit log for the cloud function trigger execution
      const auditLogRef = db.collection("audit_logs").doc(`audit_func_${Date.now()}`);
      batch.set(auditLogRef, {
        id: auditLogRef.id,
        eventType: "NOTIFICATION_DISPATCH",
        category: "INTEGRATION",
        severity: "INFO",
        actorEmail: "cloud-function@firebase.internal",
        actorName: "Firebase Cloud Function (onWinnersPublished)",
        details: `Dispatched automated email notifications to ${emailCount} participants for "${quizTitle}".`,
        metadata: {
          quizId,
          emailCount,
          winnersPageUrl,
          publishedAt: afterData.publishedAt || nowIso,
        },
        timestamp: nowIso,
      });

      await batch.commit();
      logger.info(`Successfully dispatched ${emailCount} automated winner notification emails.`);
    } catch (err: any) {
      logger.error("Error executing onWinnersPublished cloud function:", err);
      throw err;
    }
  }
);
