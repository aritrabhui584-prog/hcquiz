import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot
} from 'firebase/firestore';
import { db, isAuthorizedAdminEmail } from './lib/firebase';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/common/Header';
import { CinematicBackground } from './components/common/CinematicBackground';
import { RulesModal } from './components/common/RulesModal';
import { LoginModal } from './components/auth/LoginModal';
import { LoginPage } from './components/auth/LoginPage';
import { LandingPage } from './components/participant/LandingPage';
import { QuizInterface } from './components/participant/QuizInterface';
import { SubmissionResult } from './components/participant/SubmissionResult';
import { WinnersPage } from './components/participant/WinnersPage';
import { Footer } from './components/common/Footer';

import { AdminLayout, AdminTab } from './components/admin/AdminLayout';
import { AdminDashboardHome } from './components/admin/AdminDashboardHome';
import { AdminQuizControl } from './components/admin/AdminQuizControl';
import { AdminQuizEditions } from './components/admin/AdminQuizEditions';
import { AdminQuestions } from './components/admin/AdminQuestions';
import { AdminAnimations } from './components/admin/AdminAnimations';
import { AdminParticipants } from './components/admin/AdminParticipants';
import { AdminSubmissions } from './components/admin/AdminSubmissions';
import { AdminWinnerManagement } from './components/admin/AdminWinnerManagement';
import { AdminSettings } from './components/admin/AdminSettings';
import { AdminAuditLogs } from './components/admin/AdminAuditLogs';
import { AdminPreviewModal } from './components/admin/AdminPreviewModal';
import { soundEffects } from './lib/soundEffects';

import {
  AttemptRecord,
  ParticipantQuestion,
  QuestionItem,
  QuizEdition,
  QuizStatus,
  SubmissionRecord,
  PublishedWinner,
  AuditLogItem,
  LeaderboardRecord,
  LeaderboardRankingItem
} from './types/quiz';
import { DEFAULT_QUESTIONS } from './data/defaultQuestions';

function MainApp() {
  const { currentUser, userProfile, isAdmin, isLoading, getIdToken, login } = useAuth();

  // Navigation State
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    return window.location.pathname || '/';
  });
  const [adminTab, setAdminTab] = useState<AdminTab>('dashboard');

  // Application Data States
  const [quizzes, setQuizzes] = useState<QuizEdition[]>([]);
  const [currentQuiz, setCurrentQuiz] = useState<QuizEdition | null>(null);
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [attempts, setAttempts] = useState<AttemptRecord[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionRecord[]>([]);
  const [currentWinners, setCurrentWinners] = useState<PublishedWinner | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);

  // Participant Quiz Session State
  const [activeSession, setActiveSession] = useState<{
    attemptId: string;
    startedAt?: string;
    deadline: string;
    durationSeconds: number;
    questions: ParticipantQuestion[];
  } | null>(null);

  const [hasAttempted, setHasAttempted] = useState<boolean>(false);
  const [loginModalOpen, setLoginModalOpen] = useState<boolean>(false);
  const [rulesModalOpen, setRulesModalOpen] = useState<boolean>(false);
  const [previewModalOpen, setPreviewModalOpen] = useState<boolean>(false);
  const [submissionCompletedAt, setSubmissionCompletedAt] = useState<string>('');

  // Handle browser popstate
  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Admin auto-redirect when signing in with authorized admin gmail
  useEffect(() => {
    if (currentUser && (isAdmin || isAuthorizedAdminEmail(currentUser.email))) {
      if (currentRoute === '/login') {
        navigate('/admin');
      }
    }
  }, [currentUser, isAdmin, currentRoute]);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentRoute(path);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  };

  // 1. Initial Quizzes listener and auto-bootstrapper
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'quizzes'), async (snapshot) => {
      if (snapshot.empty) {
        const initialQuiz: QuizEdition = {
          id: 'quiz_sharadiya_2026',
          title: 'SHARADIYA CIRCUIT 2026',
          description: 'AEC Hardware Club Special Edition — Where Tradition Meets Technology.',
          edition: 'Special Edition 2026',
          weekNumber: 1,
          questionCount: 25,
          durationSeconds: 120,
          status: 'LIVE',
          theme: 'Sensors, Microcontrollers & Embedded Circuits',
          startsAt: new Date().toISOString(),
          endsAt: new Date(Date.now() + 45 * 60 * 1000).toISOString(),
          resultsPublished: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await setDoc(doc(db, 'quizzes', initialQuiz.id), initialQuiz);
        setQuizzes([initialQuiz]);
        setCurrentQuiz(initialQuiz);
      } else {
        const loaded = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as QuizEdition));
        setQuizzes(loaded);
        const live = loaded.find((q) => q.status === 'LIVE') || loaded[0];
        setCurrentQuiz(live);
      }
    });

    return () => unsubscribe();
  }, []);

  // 2. Questions Listener (for Admin) & auto-seeder if empty
  useEffect(() => {
    if (!isAdmin) return;
    const unsubscribe = onSnapshot(collection(db, 'questions'), async (snapshot) => {
      if (snapshot.empty) {
        const nowIso = new Date().toISOString();
        for (const q of DEFAULT_QUESTIONS) {
          await setDoc(doc(db, 'questions', q.id), {
            ...q,
            createdAt: nowIso,
            updatedAt: nowIso,
          });
        }
      } else {
        const loaded = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as QuestionItem));
        setQuestions(loaded);
      }
    });

    return () => unsubscribe();
  }, [isAdmin]);

  // 3. Check if participant already participated
  useEffect(() => {
    if (!currentUser || !currentQuiz) {
      setHasAttempted(false);
      return;
    }

    const q = query(
      collection(db, 'attempts'),
      where('quizId', '==', currentQuiz.id),
      where('uid', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const attempted = snapshot.docs.some(
        (d) => d.data().finalized === true || d.data().status === 'SUBMITTED'
      );
      setHasAttempted(attempted);
    });

    return () => unsubscribe();
  }, [currentUser, currentQuiz]);

  // 4. Admin Live Real-Time Snapshot for attempts, submissions, and audit logs
  useEffect(() => {
    if (!isAdmin) return;

    let unsubAttempts = () => {};
    let unsubSubmissions = () => {};
    let unsubAudit = () => {};

    try {
      unsubAttempts = onSnapshot(collection(db, 'attempts'), (snap) => {
        const loadedAttempts = snap.docs.map((d) => ({ id: d.id, ...d.data() } as AttemptRecord));
        setAttempts(loadedAttempts);
      });
    } catch (err) {
      console.warn('Attempts realtime listener notice:', err);
    }

    try {
      unsubSubmissions = onSnapshot(collection(db, 'submissions'), (snap) => {
        const loadedSubmissions = snap.docs.map((d) => ({ id: d.id, ...d.data() } as SubmissionRecord));
        setSubmissions(loadedSubmissions);
      });
    } catch (err) {
      console.warn('Submissions realtime listener notice:', err);
    }

    try {
      unsubAudit = onSnapshot(collection(db, 'audit_logs'), (snap) => {
        const logs = snap.docs
          .map((d) => ({ id: d.id, ...d.data() } as AuditLogItem))
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setAuditLogs(logs);
      });
    } catch (err) {
      console.warn('Audit logs realtime listener notice:', err);
    }

    return () => {
      unsubAttempts();
      unsubSubmissions();
      unsubAudit();
    };
  }, [isAdmin]);

  // 5. Winners Listener
  useEffect(() => {
    const unsubWinners = onSnapshot(collection(db, 'winners'), (snap) => {
      if (!snap.empty) {
        const published = snap.docs.find((d) => d.data().published === true);
        if (published) {
          setCurrentWinners({ id: published.id, ...published.data() } as PublishedWinner);
        } else {
          setCurrentWinners(null);
        }
      } else {
        setCurrentWinners(null);
      }
    });

    return () => unsubWinners();
  }, []);

  // START QUIZ HANDLER
  const handleStartQuiz = async () => {
    if (!currentUser) {
      login();
      return;
    }

    // Rule 1: One Google Account and only one quiz exam
    try {
      const qSub = query(
        collection(db, 'submissions'),
        where('uid', '==', currentUser.uid)
      );
      const snapSub = await getDocs(qSub);
      if (!snapSub.empty) {
        setHasAttempted(true);
        alert('You have already submitted your examination. Only one attempt is permitted per Google Account.');
        navigate('/submitted');
        return;
      }

      const qAtt = query(
        collection(db, 'attempts'),
        where('uid', '==', currentUser.uid)
      );
      const snapAtt = await getDocs(qAtt);
      const alreadyAttempted = snapAtt.docs.some(
        (d) => d.data().finalized === true || d.data().status === 'SUBMITTED' || d.data().status === 'TIMED_OUT'
      );
      if (alreadyAttempted) {
        setHasAttempted(true);
        alert('You have already attempted this competition. Only one attempt is permitted per Google Account.');
        navigate('/submitted');
        return;
      }
    } catch (checkErr) {
      console.warn('Pre-quiz check notice:', checkErr);
    }

    try {
      const idToken = await getIdToken();
      let startedSuccessfully = false;

      // 1. Try authoritative serverless endpoint
      try {
        const response = await fetch('/api/quiz/start', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
          },
          body: JSON.stringify({
            quizId: currentQuiz?.id,
            phone: userProfile?.phone || '',
            stream: userProfile?.stream || '',
            year: userProfile?.year || '',
            rollNo: userProfile?.rollNo || '',
            membershipId: userProfile?.membershipId || '',
            photoURL: userProfile?.photoURL || currentUser?.photoURL || '',
          }),
        });

        const text = await response.text();
        let data: any = null;
        try {
          data = JSON.parse(text);
        } catch {
          console.warn('API returned non-JSON response, using resilient fallback mode.');
        }

        if (response.ok && data?.attemptId) {
          if (data.alreadyAttempted) {
            setHasAttempted(true);
            alert(data.error || 'You have already attempted this competition.');
            return;
          }

          setActiveSession({
            attemptId: data.attemptId,
            startedAt: data.startedAt || new Date().toISOString(),
            deadline: data.deadline,
            durationSeconds: data.durationSeconds,
            questions: data.questions,
          });

          startedSuccessfully = true;
        } else if (data?.alreadyAttempted) {
          setHasAttempted(true);
          alert(data.error || 'You have already attempted this competition.');
          return;
        }
      } catch (apiErr) {
        console.warn('Backend API start endpoint notice (falling back to direct session):', apiErr);
      }

      // 2. Direct Firestore fallback if server endpoint is not responding
      if (!startedSuccessfully) {
        const attemptId = `att_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const now = new Date();
        const durationSec = currentQuiz?.durationSeconds || 120;
        const deadline = new Date(now.getTime() + durationSec * 1000).toISOString();

        // Pick 25 questions
        const pool = questions.length >= 25 ? questions : DEFAULT_QUESTIONS;
        const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, 25);
        const selectedIds = shuffled.map((q) => q.id);

        const sanitized: ParticipantQuestion[] = shuffled.map((q) => ({
          id: q.id,
          questionText: q.questionText,
          optionA: q.optionA,
          optionB: q.optionB,
          optionC: q.optionC,
          optionD: q.optionD,
          category: q.category,
          difficulty: q.difficulty,
          imageUrl: q.imageUrl,
          animationType: q.animationType,
          animationAssetUrl: q.animationAssetUrl,
        }));

        const attemptRecord: AttemptRecord = {
          id: attemptId,
          uid: currentUser.uid,
          quizId: currentQuiz?.id || 'sharadiya-circuit-2026',
          participantName: userProfile?.name || currentUser.displayName || currentUser.email?.split('@')[0] || 'Participant',
          participantEmail: currentUser.email || '',
          participantPhone: userProfile?.phone || '',
          participantPhotoUrl: currentUser.photoURL || '',
          stream: userProfile?.stream || '',
          year: userProfile?.year || '',
          rollNo: userProfile?.rollNo || '',
          membershipId: userProfile?.membershipId || '',
          startedAt: now.toISOString(),
          deadline,
          durationSeconds: durationSec,
          selectedQuestionIds: selectedIds,
          status: 'IN_PROGRESS',
          finalized: false,
          createdAt: now.toISOString(),
        };

        try {
          await setDoc(doc(db, 'attempts', attemptId), attemptRecord);
        } catch (dbErr) {
          console.warn('Firestore attempt creation fallback notice:', dbErr);
        }

        setActiveSession({
          attemptId,
          startedAt: now.toISOString(),
          deadline,
          durationSeconds: durationSec,
          questions: sanitized,
        });
      }

      soundEffects.playQuizStart();
      navigate('/quiz');
    } catch (err) {
      console.error('Quiz start critical error:', err);
      alert('Unable to start quiz session. Please refresh and try again.');
    }
  };

  // SUBMIT QUIZ HANDLER
  const handleSubmitQuiz = async (answers: Record<string, string>, isTimeout = false) => {
    if (!activeSession) return;

    try {
      const idToken = await getIdToken();
      const submittedAtIso = new Date().toISOString();

      // Calculate scores and write SubmissionRecord directly to Firestore
      if (currentUser) {
        const submissionId = `sub_${activeSession.attemptId}`;
        const questionsPool = questions.length > 0 ? questions : DEFAULT_QUESTIONS;
        const qMap = new Map<string, QuestionItem>();
        questionsPool.forEach((q) => qMap.set(q.id, q));

        let correct = 0;
        let wrong = 0;
        let attempted = 0;

        activeSession.questions.forEach((q) => {
          const selected = answers[q.id];
          if (selected) {
            attempted += 1;
            const fullQ = qMap.get(q.id);
            if (fullQ && selected.toUpperCase() === fullQ.correctAnswer.toUpperCase()) {
              correct += 1;
            } else {
              wrong += 1;
            }
          }
        });

        const startMs = activeSession.startedAt
          ? new Date(activeSession.startedAt).getTime()
          : (Date.now() - activeSession.durationSeconds * 1000);
        const actualTimeUsed = Math.min(
          activeSession.durationSeconds,
          Math.max(1, Math.round((Date.now() - startMs) / 1000))
        );

        const subRecord: SubmissionRecord = {
          id: submissionId,
          attemptId: activeSession.attemptId,
          uid: currentUser.uid,
          quizId: currentQuiz?.id || 'sharadiya-circuit-2026',
          quizTitle: currentQuiz?.title || 'SHARADIYA CIRCUIT 2026',
          participantName: userProfile?.name || currentUser.displayName || currentUser.email?.split('@')[0] || 'Participant',
          participantEmail: currentUser.email || '',
          participantPhone: userProfile?.phone || '',
          participantPhotoUrl: currentUser.photoURL || '',
          stream: userProfile?.stream || '',
          year: userProfile?.year || '',
          rollNo: userProfile?.rollNo || '',
          membershipId: userProfile?.membershipId || '',
          answers,
          totalQuestions: activeSession.questions.length,
          attempted,
          correct,
          wrong,
          score: correct,
          startedAt: activeSession.startedAt || new Date(Date.now() - actualTimeUsed * 1000).toISOString(),
          submittedAt: submittedAtIso,
          timeUsed: actualTimeUsed,
          syncedToSheets: false,
          createdAt: submittedAtIso,
        };

        try {
          await setDoc(doc(db, 'submissions', submissionId), subRecord);
          await updateDoc(doc(db, 'attempts', activeSession.attemptId), {
            status: isTimeout ? 'TIMED_OUT' : 'SUBMITTED',
            finalized: true,
            submittedAt: submittedAtIso,
            timeUsed: actualTimeUsed,
            score: correct,
          });
        } catch (dbErr) {
          console.warn('Firestore direct submission notice:', dbErr);
        }
      }

      // Also notify backend API in background for Sheets sync and server audit logging
      try {
        await fetch('/api/quiz/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
          },
          body: JSON.stringify({
            attemptId: activeSession.attemptId,
            answers,
            isTimeout,
          }),
        });
      } catch (apiErr) {
        console.warn('Background serverless sync notice:', apiErr);
      }

      soundEffects.playSubmissionSuccess();
      setSubmissionCompletedAt(submittedAtIso);
      setActiveSession(null);
      setHasAttempted(true);
      navigate('/submitted');
    } catch (err) {
      console.error('Submit error:', err);
      soundEffects.playSubmissionSuccess();
      setActiveSession(null);
      setHasAttempted(true);
      navigate('/submitted');
    }
  };

  // ADMIN OPERATIONS
  const logAdminAction = async (params: {
    eventType: string;
    category?: string;
    severity?: string;
    details: string;
    metadata?: Record<string, any>;
  }) => {
    try {
      const idToken = await getIdToken();
      await fetch('/api/admin/log-event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify(params),
      });
    } catch (err) {
      console.warn('Audit event broadcast notice:', err);
    }
  };

  const handleUpdateQuizStatus = async (newStatus: QuizStatus) => {
    if (!currentQuiz) return;
    const prevStatus = currentQuiz.status;
    const ref = doc(db, 'quizzes', currentQuiz.id);
    const updates: Partial<QuizEdition> = {
      status: newStatus,
      updatedAt: new Date().toISOString(),
    };
    if (newStatus === 'LIVE') {
      const now = Date.now();
      updates.startsAt = new Date(now).toISOString();
      updates.endsAt = new Date(now + 45 * 60 * 1000).toISOString();
    }
    await updateDoc(ref, updates);
    setCurrentQuiz((prev) => (prev ? { ...prev, ...updates } : null));

    await logAdminAction({
      eventType: 'STATUS_CHANGE',
      category: 'ADMIN',
      severity: newStatus === 'STOPPED' ? 'WARN' : 'INFO',
      details: `Administrator changed quiz status from ${prevStatus} to ${newStatus} for "${currentQuiz.title}".`,
      metadata: { quizId: currentQuiz.id, previousStatus: prevStatus, newStatus }
    });
  };

  const handleSaveQuizEdition = async (quizData: Partial<QuizEdition>) => {
    if (!quizData.id) return;
    const ref = doc(db, 'quizzes', quizData.id);
    await setDoc(ref, {
      ...quizData,
      updatedAt: new Date().toISOString(),
    }, { merge: true });

    await logAdminAction({
      eventType: 'CONFIG_CHANGE',
      category: 'ADMIN',
      severity: 'INFO',
      details: `Quiz edition configuration updated: "${quizData.title}" (${quizData.durationSeconds || 120}s, ${quizData.questionCount || 25}Q).`,
      metadata: { quizId: quizData.id, edition: quizData.edition, status: quizData.status }
    });
  };

  const handleSetActiveQuiz = async (quizId: string) => {
    const q = quizzes.find((item) => item.id === quizId);
    if (q) {
      setCurrentQuiz(q);
      const ref = doc(db, 'quizzes', q.id);
      await updateDoc(ref, { status: 'LIVE' });

      await logAdminAction({
        eventType: 'STATUS_CHANGE',
        category: 'ADMIN',
        severity: 'INFO',
        details: `Active quiz set to "${q.title}" (Status: LIVE).`,
        metadata: { quizId: q.id }
      });
    }
  };

  const handleSaveQuestion = async (qData: Partial<QuestionItem>) => {
    if (!qData.id) return;
    const ref = doc(db, 'questions', qData.id);
    await setDoc(
      ref,
      {
        ...qData,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    await logAdminAction({
      eventType: 'QUESTION_MUTATION',
      category: 'ADMIN',
      severity: 'INFO',
      details: `Question saved/updated: "${qData.questionText?.slice(0, 60)}..." (Animation: ${qData.animationType}).`,
      metadata: { questionId: qData.id, animationType: qData.animationType, category: qData.category }
    });
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (confirm('Delete this question from repository?')) {
      await deleteDoc(doc(db, 'questions', questionId));
      await logAdminAction({
        eventType: 'QUESTION_MUTATION',
        category: 'ADMIN',
        severity: 'WARN',
        details: `Deleted question ID ${questionId} from repository.`,
        metadata: { questionId }
      });
    }
  };

  const handleDeleteParticipant = async (participant: { uid: string; email: string; name: string }) => {
    try {
      const idToken = await getIdToken();
      try {
        await fetch('/api/admin/delete-participant', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
          },
          body: JSON.stringify(participant),
        });
      } catch {}

      try {
        const snapAtt = await getDocs(collection(db, 'attempts'));
        for (const d of snapAtt.docs) {
          const data = d.data();
          if (
            (participant.uid && (data.uid === participant.uid || d.id.includes(participant.uid))) ||
            (participant.email && data.participantEmail?.toLowerCase() === participant.email.toLowerCase())
          ) {
            await deleteDoc(doc(db, 'attempts', d.id));
          }
        }
      } catch {}

      try {
        const snapSub = await getDocs(collection(db, 'submissions'));
        for (const d of snapSub.docs) {
          const data = d.data();
          if (
            (participant.uid && (data.uid === participant.uid || d.id.includes(participant.uid))) ||
            (participant.email && data.participantEmail?.toLowerCase() === participant.email.toLowerCase())
          ) {
            await deleteDoc(doc(db, 'submissions', d.id));
          }
        }
      } catch {}

      setAttempts((prev) =>
        prev.filter(
          (a) =>
            a.uid !== participant.uid &&
            a.participantEmail?.toLowerCase() !== participant.email?.toLowerCase()
        )
      );
      setSubmissions((prev) =>
        prev.filter(
          (s) =>
            s.uid !== participant.uid &&
            s.participantEmail?.toLowerCase() !== participant.email?.toLowerCase()
        )
      );

      await syncAdminData();
    } catch (err) {
      console.error('Delete participant error:', err);
      throw err;
    }
  };

  const handleResetAttempt = async (participant: { uid: string; email: string }) => {
    try {
      const idToken = await getIdToken();
      try {
        await fetch('/api/admin/reset-attempt', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
          },
          body: JSON.stringify(participant),
        });
      } catch {}

      try {
        const snapAtt = await getDocs(collection(db, 'attempts'));
        for (const d of snapAtt.docs) {
          const data = d.data();
          if (
            (participant.uid && (data.uid === participant.uid || d.id.includes(participant.uid))) ||
            (participant.email && data.participantEmail?.toLowerCase() === participant.email.toLowerCase())
          ) {
            await deleteDoc(doc(db, 'attempts', d.id));
          }
        }
      } catch {}

      setAttempts((prev) =>
        prev.filter(
          (a) =>
            a.uid !== participant.uid &&
            a.participantEmail?.toLowerCase() !== participant.email?.toLowerCase()
        )
      );
      await syncAdminData();
    } catch (err) {
      console.error('Reset attempt error:', err);
      throw err;
    }
  };

  const handleDeleteSubmission = async (submission: SubmissionRecord) => {
    try {
      const idToken = await getIdToken();
      try {
        await fetch('/api/admin/delete-submission', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
          },
          body: JSON.stringify({
            submissionId: submission.id,
            attemptId: submission.attemptId,
            participantName: submission.participantName,
            participantEmail: submission.participantEmail,
          }),
        });
      } catch {}

      try {
        await deleteDoc(doc(db, 'submissions', submission.id));
      } catch {}

      setSubmissions((prev) => prev.filter((s) => s.id !== submission.id));
      if (submission.attemptId) {
        setAttempts((prev) => prev.filter((a) => a.id !== submission.attemptId));
      }

      syncAdminData();
    } catch (err) {
      console.error('Delete submission error:', err);
      throw err;
    }
  };

  const handleSeedQuestions = async () => {
    const idToken = await getIdToken();
    const res = await fetch('/api/admin/seed-questions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({ force: true }),
    });
    const data = await res.json();
    alert(`Seeded ${data.seededCount || 42} questions into database successfully!`);
  };

  const handleBatchImportQuestions = async (importedQuestions: Partial<QuestionItem>[]) => {
    const nowIso = new Date().toISOString();
    let importedCount = 0;
    for (const q of importedQuestions) {
      const qId = q.id || `q_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const ref = doc(db, 'questions', qId);
      await setDoc(
        ref,
        {
          ...q,
          id: qId,
          active: q.active ?? true,
          createdAt: q.createdAt || nowIso,
          updatedAt: nowIso,
        },
        { merge: true }
      );
      importedCount++;
    }

    await logAdminAction({
      eventType: 'QUESTION_MUTATION',
      category: 'ADMIN',
      severity: 'INFO',
      details: `Bulk imported ${importedCount} questions from CSV template into question repository.`,
      metadata: { count: importedCount }
    });
  };

  const handlePublishWinners = async (winnersData: Partial<PublishedWinner>) => {
    const winnerId = `win_${currentQuiz?.id || 'default'}`;
    const ref = doc(db, 'winners', winnerId);
    await setDoc(ref, { ...winnersData, id: winnerId }, { merge: true });
    if (currentQuiz) {
      await updateDoc(doc(db, 'quizzes', currentQuiz.id), {
        status: 'WINNERS_PUBLISHED',
        resultsPublished: true,
      });
    }

    await logAdminAction({
      eventType: 'WINNERS_PUBLISHED',
      category: 'ADMIN',
      severity: 'INFO',
      details: `Published winners for "${currentQuiz?.title}": 1st ${winnersData.firstPlace?.name}, 2nd ${winnersData.secondPlace?.name}, 3rd ${winnersData.thirdPlace?.name}.`,
      metadata: {
        quizId: currentQuiz?.id,
        firstPlace: winnersData.firstPlace?.name,
        secondPlace: winnersData.secondPlace?.name,
        thirdPlace: winnersData.thirdPlace?.name,
      }
    });
  };

  const handleUnpublishWinners = async () => {
    if (currentWinners) {
      await updateDoc(doc(db, 'winners', currentWinners.id), { published: false });
      await logAdminAction({
        eventType: 'WINNERS_UNPUBLISHED',
        category: 'ADMIN',
        severity: 'WARN',
        details: `Unpublished winners for quiz ID ${currentWinners.quizId}.`,
        metadata: { quizId: currentWinners.quizId }
      });
    }
  };

  const handleTriggerSync = async () => {
    const idToken = await getIdToken();
    const res = await fetch('/api/admin/sync-sheet', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
    });
    return await res.json();
  };

  const sanitizedPreviewQuestions: ParticipantQuestion[] = (
    questions.length > 0 ? questions : DEFAULT_QUESTIONS
  ).slice(0, 25).map((q) => ({
    id: q.id,
    questionText: q.questionText,
    optionA: q.optionA,
    optionB: q.optionB,
    optionC: q.optionC,
    optionD: q.optionD,
    category: q.category,
    difficulty: q.difficulty,
    imageUrl: q.imageUrl,
    animationType: q.animationType,
    animationAssetUrl: q.animationAssetUrl,
  }));

  // ROUTE RENDERING
  const renderRoute = () => {
    // 1. Admin Routes - Strictly locked to hardcoded registered admin emails
    if (currentRoute.startsWith('/admin')) {
      if (isLoading) {
        return (
          <div className="w-full min-h-screen flex flex-col items-center justify-center bg-[#05080b] text-emerald-400 font-mono text-xs gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-emerald-400/20 border-t-emerald-400 animate-spin" />
            <span className="tracking-widest">VERIFYING ADMINISTRATIVE ACCESS...</span>
          </div>
        );
      }

      if (!currentUser || (!isAdmin && !isAuthorizedAdminEmail(currentUser.email))) {
        return (
          <div className="w-full min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-6 text-center select-none">
            <div className="px-3 py-1 rounded-full bg-[#B62A35]/15 border border-[#B62A35]/30 text-[#B62A35] font-mono-tech text-[11px] tracking-widest mb-3 uppercase">
              403 FORBIDDEN // RESTRICTED CONSOLE
            </div>
            <h2 className="font-mono-tech text-xl font-bold text-white mb-2 tracking-tight">
              ADMINISTRATIVE ACCESS ONLY
            </h2>
            <p className="text-xs text-[#A9B8B0] max-w-md mb-6 font-mono-tech leading-relaxed">
              This management console is strictly restricted to verified AEC Hardware Club administrative credentials. Participants cannot access or control the admin portal.
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono-tech text-xs transition cursor-pointer border border-white/10"
            >
              RETURN TO PUBLIC CIRCUIT
            </button>
          </div>
        );
      }

      return (
        <AdminLayout
          currentTab={adminTab}
          onSelectTab={setAdminTab}
          quizStatus={currentQuiz?.status}
          quizTitle={currentQuiz?.title}
          onOpenPreview={() => setPreviewModalOpen(true)}
          onExitToApp={() => {
            navigate('/');
            if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
              window.location.href = '/';
            }
          }}
        >
          {adminTab === 'dashboard' && (
            <AdminDashboardHome
              quiz={currentQuiz}
              participantCount={Math.max(attempts.length, submissions.length)}
              startedCount={attempts.filter((a) => a.status === 'IN_PROGRESS' || a.status === 'SUBMITTED').length}
              submittedCount={submissions.length}
              questionBankCount={questions.length}
              onUpdateQuizStatus={handleUpdateQuizStatus}
              onNavigateTab={setAdminTab}
              onRefreshStats={async () => {
                const snapAtt = await getDocs(collection(db, 'attempts'));
                setAttempts(snapAtt.docs.map((d) => ({ id: d.id, ...d.data() } as AttemptRecord)));
                const snapSub = await getDocs(collection(db, 'submissions'));
                setSubmissions(snapSub.docs.map((d) => ({ id: d.id, ...d.data() } as SubmissionRecord)));
              }}
            />
          )}

          {adminTab === 'quiz-control' && (
            <AdminQuizControl
              quiz={currentQuiz}
              attempts={attempts}
              submissions={submissions}
              onUpdateQuizStatus={handleUpdateQuizStatus}
            />
          )}

          {adminTab === 'quizzes' && (
            <AdminQuizEditions
              quizzes={quizzes}
              currentQuizId={currentQuiz?.id}
              onSaveQuiz={handleSaveQuizEdition}
              onSetActiveQuiz={handleSetActiveQuiz}
            />
          )}

          {adminTab === 'questions' && (
            <AdminQuestions
              questions={questions}
              onSaveQuestion={handleSaveQuestion}
              onDeleteQuestion={handleDeleteQuestion}
              onSeedQuestions={handleSeedQuestions}
              onBatchImportQuestions={handleBatchImportQuestions}
            />
          )}

          {adminTab === 'animations' && <AdminAnimations />}

          {adminTab === 'participants' && (
            <AdminParticipants
              attempts={attempts}
              submissions={submissions}
              onDeleteParticipant={handleDeleteParticipant}
              onResetAttempt={handleResetAttempt}
            />
          )}

          {adminTab === 'submissions' && (
            <AdminSubmissions
              submissions={submissions}
              questions={questions}
              onDeleteSubmission={handleDeleteSubmission}
            />
          )}

          {adminTab === 'winners' && (
            <AdminWinnerManagement
              currentQuiz={currentQuiz}
              submissions={submissions}
              currentWinners={currentWinners}
              onPublishWinners={handlePublishWinners}
              onUnpublishWinners={handleUnpublishWinners}
            />
          )}

          {adminTab === 'audit-logs' && (
            <AdminAuditLogs
              logs={auditLogs}
              onRefresh={async () => {
                const idToken = await getIdToken();
                const res = await fetch('/api/admin/audit-logs', {
                  headers: { Authorization: `Bearer ${idToken}` }
                });
                const data = await res.json();
                if (data.logs) setAuditLogs(data.logs);
              }}
            />
          )}

          {adminTab === 'settings' && (
            <AdminSettings submissions={submissions} onTriggerSync={handleTriggerSync} />
          )}
        </AdminLayout>
      );
    }

    // 2. Active Quiz Route (Only accessible through "ENTER THE CIRCUIT" session initiation)
    if (currentRoute === '/quiz') {
      if (!activeSession) {
        // Automatically redirect to home opening page
        if (typeof window !== 'undefined' && window.location.pathname === '/quiz') {
          window.history.replaceState({}, '', '/');
        }
        return (
          <div className="w-full flex flex-col min-h-screen">
            <Header
              quiz={currentQuiz}
              quizStatus={currentQuiz?.status}
              currentRoute="/"
              onNavigate={navigate}
              onOpenRules={() => setRulesModalOpen(true)}
            />
            <div className="w-full min-h-[calc(100vh-5rem)] flex flex-col justify-between">
              <LandingPage
                quiz={currentQuiz}
                hasAttempted={hasAttempted}
                onStartQuiz={handleStartQuiz}
                onOpenPhoneModal={() => setLoginModalOpen(true)}
                onOpenRulesModal={() => setRulesModalOpen(true)}
                onViewWinners={() => navigate('/winners')}
              />
              <button
                type="button"
                onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
                className="py-2 pb-4 text-center cursor-pointer opacity-50 hover:opacity-90 transition-opacity select-none inline-flex items-center justify-center gap-1.5 focus:outline-none"
                aria-label="Scroll to footer details"
              >
                <span className="text-[10px] font-mono-tech tracking-[0.25em] text-[#A9B8B0]">
                  SCROLL FOR DETAILS
                </span>
                <span className="text-[11px] text-[#7EE8A6] animate-bounce">↓</span>
              </button>
            </div>
            <Footer
              currentRoute="/"
              onNavigate={navigate}
              onOpenRules={() => setRulesModalOpen(true)}
            />
          </div>
        );
      }

      return (
        <QuizInterface
          attemptId={activeSession.attemptId}
          quizTitle={currentQuiz?.title || 'SHARADIYA CIRCUIT 2026'}
          questions={activeSession.questions}
          deadline={activeSession.deadline}
          durationSeconds={activeSession.durationSeconds}
          onSubmit={handleSubmitQuiz}
        />
      );
    }

    // 3. Submitted Confirmation Route
    if (currentRoute === '/submitted') {
      return (
        <div className="w-full flex flex-col min-h-screen">
          <Header
            quiz={currentQuiz}
            quizStatus={currentQuiz?.status}
            currentRoute={currentRoute}
            onNavigate={navigate}
            onOpenRules={() => setRulesModalOpen(true)}
          />
          <div className="flex-1">
            <SubmissionResult
              quizTitle={currentQuiz?.title || 'SHARADIYA CIRCUIT 2026'}
              submittedAt={submissionCompletedAt}
              onGoHome={() => navigate('/')}
              onViewWinners={() => navigate('/winners')}
            />
          </div>
          <Footer
            currentRoute={currentRoute}
            onNavigate={navigate}
            onOpenRules={() => setRulesModalOpen(true)}
          />
        </div>
      );
    }

    // 4. Winners Page Route
    if (currentRoute === '/winners') {
      return (
        <div className="w-full flex flex-col min-h-screen">
          <Header
            quiz={currentQuiz}
            quizStatus={currentQuiz?.status}
            currentRoute={currentRoute}
            onNavigate={navigate}
            onOpenRules={() => setRulesModalOpen(true)}
          />
          <div className="flex-1">
            <WinnersPage onBack={() => navigate('/')} />
          </div>
          <Footer
            currentRoute={currentRoute}
            onNavigate={navigate}
            onOpenRules={() => setRulesModalOpen(true)}
          />
        </div>
      );
    }

    // 5. Dedicated Login & Registration Route
    if (currentRoute === '/login') {
      return (
        <div className="w-full flex flex-col min-h-screen">
          <Header
            quiz={currentQuiz}
            quizStatus={currentQuiz?.status}
            currentRoute={currentRoute}
            onNavigate={navigate}
            onOpenRules={() => setRulesModalOpen(true)}
          />
          <div className="flex-1">
            <LoginPage
              onSuccess={() => {
                if (isAdmin || isAuthorizedAdminEmail(currentUser?.email)) {
                  navigate('/admin');
                } else {
                  navigate('/');
                }
              }}
              onGoHome={() => navigate('/')}
            />
          </div>
          <Footer
            currentRoute={currentRoute}
            onNavigate={navigate}
            onOpenRules={() => setRulesModalOpen(true)}
          />
        </div>
      );
    }

    // 6. Default: Participant Landing Page
    return (
      <div className="w-full flex flex-col min-h-screen">
        <Header
          quiz={currentQuiz}
          quizStatus={currentQuiz?.status}
          currentRoute={currentRoute}
          onNavigate={navigate}
          onOpenRules={() => setRulesModalOpen(true)}
        />
        <div className="w-full min-h-[calc(100vh-5rem)] flex flex-col justify-between">
          <LandingPage
            quiz={currentQuiz}
            hasAttempted={hasAttempted}
            onStartQuiz={handleStartQuiz}
            onOpenPhoneModal={() => setLoginModalOpen(true)}
            onOpenRulesModal={() => setRulesModalOpen(true)}
            onViewWinners={() => navigate('/winners')}
          />
          <button
            type="button"
            onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
            className="py-2 pb-4 text-center cursor-pointer opacity-50 hover:opacity-90 transition-opacity select-none inline-flex items-center justify-center gap-1.5 focus:outline-none"
            aria-label="Scroll to footer details"
          >
            <span className="text-[10px] font-mono-tech tracking-[0.25em] text-[#A9B8B0]">
              SCROLL FOR DETAILS
            </span>
            <span className="text-[11px] text-[#7EE8A6] animate-bounce">↓</span>
          </button>
        </div>
        <Footer
          currentRoute={currentRoute}
          onNavigate={navigate}
          onOpenRules={() => setRulesModalOpen(true)}
        />
      </div>
    );
  };

  return (
    <div className="relative w-full min-h-screen bg-black text-white font-sans select-none overflow-x-hidden">
      {/* Cinematic Full-Bleed Ambient Background System */}
      <CinematicBackground />

      {/* Primary Application Viewport */}
      <div className="relative z-10 w-full min-h-screen flex flex-col">
        {renderRoute()}
      </div>

      {/* Rules Modal */}
      <RulesModal
        isOpen={rulesModalOpen}
        quiz={currentQuiz}
        onClose={() => setRulesModalOpen(false)}
        showStartButton={!hasAttempted && currentQuiz?.status === 'LIVE'}
        onConfirmStart={() => {
          setRulesModalOpen(false);
          handleStartQuiz();
        }}
      />

      {/* Login & Phone Modal */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onSuccess={() => {
          setLoginModalOpen(false);
          if (isAdmin || isAuthorizedAdminEmail(currentUser?.email)) {
            navigate('/admin');
          } else {
            handleStartQuiz();
          }
        }}
      />

      {/* Admin Preview Simulation Modal */}
      <AdminPreviewModal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        questions={sanitizedPreviewQuestions}
        quiz={currentQuiz}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
