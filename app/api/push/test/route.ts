import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/lib/firebaseAdmin';
import { fetchPushTokens } from '@/lib/pushTokenStore';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const targetRole = searchParams.get('send') as 'nush' | 'yajat' | null;

  const hasSecret = Boolean(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  const adminApp = getFirebaseAdmin();
  const tokens = await fetchPushTokens();

  const report: any = {
    firebaseConfigured: Boolean(adminApp),
    hasEnvVar: hasSecret,
    registeredTokens: {
      nush: tokens.nush?.length || 0,
      yajat: tokens.yajat?.length || 0,
    },
    tokensDetail: {
      nush: tokens.nush?.map(t => ({ token: t.token.slice(0, 12) + '...', updatedAt: new Date(t.updatedAt).toISOString() })),
      yajat: tokens.yajat?.map(t => ({ token: t.token.slice(0, 12) + '...', updatedAt: new Date(t.updatedAt).toISOString() })),
    }
  };

  if (targetRole && (targetRole === 'nush' || targetRole === 'yajat')) {
    if (!adminApp) {
      report.sendResult = 'Firebase Admin not initialized. Check FIREBASE_SERVICE_ACCOUNT_JSON on Vercel.';
      return NextResponse.json(report);
    }

    const roleTokens = tokens[targetRole] || [];
    if (roleTokens.length === 0) {
      report.sendResult = `No tokens registered for ${targetRole}`;
      return NextResponse.json(report);
    }

    const sendResults = [];
    for (const t of roleTokens) {
      try {
        const res = await adminApp.messaging().send({
          token: t.token,
          notification: {
            title: 'Calculator',
            body: 'Calculator is yearning for you 🩷',
          },
          android: {
            priority: 'high',
            directBootOk: true,
            notification: {
              channelId: 'heartbeat',
              sound: 'default',
              icon: 'ic_notification_calculator',
              color: '#FF5C8E',
              clickAction: 'OPEN_HEARTBEAT',
              priority: 'max',
              defaultVibrateTimings: true,
            },
          },
          data: {
            type: 'heartbeat',
            senderRole: targetRole === 'nush' ? 'yajat' : 'nush',
            title: 'Calculator',
            body: 'Calculator is yearning for you 🩷',
            timestamp: String(Date.now()),
            deepLink: 'nush://heartbeat',
          },
        });
        sendResults.push({ token: t.token.slice(0, 12) + '...', success: true, messageId: res });
      } catch (err: any) {
        sendResults.push({
          token: t.token.slice(0, 12) + '...',
          success: false,
          error: err.message,
          code: err.code || err.errorInfo?.code,
        });
      }
    }
    report.sendResults = sendResults;
  }

  return NextResponse.json(report);
}
