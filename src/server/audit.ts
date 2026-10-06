import { collection, doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { AuditLogItem, AuditEventType } from '../types/quiz';

export async function logAuditEvent(params: {
  eventType: AuditEventType;
  category: 'SECURITY' | 'QUIZ' | 'ADMIN' | 'INTEGRATION';
  severity: 'INFO' | 'WARN' | 'CRITICAL';
  actorUid?: string;
  actorEmail?: string;
  actorName?: string;
  details: string;
  metadata?: Record<string, any>;
}): Promise<void> {
  try {
    const timestamp = new Date().toISOString();
    const logId = `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const logItem: AuditLogItem = {
      id: logId,
      eventType: params.eventType,
      category: params.category,
      severity: params.severity,
      actorUid: params.actorUid || 'server_system',
      actorEmail: params.actorEmail || 'system@aechardware.club',
      actorName: params.actorName || 'Server Engine',
      details: params.details,
      metadata: params.metadata || {},
      timestamp,
    };

    await setDoc(doc(db, 'audit_logs', logId), logItem);
  } catch (err) {
    console.error('Failed to record audit log:', err);
  }
}
