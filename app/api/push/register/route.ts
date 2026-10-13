import { NextRequest, NextResponse } from 'next/server';
import { registerPushToken } from '@/lib/pushTokenStore';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(req: NextRequest) {
  try {
    const sharedSecret = process.env.PUSH_SHARED_SECRET;
    const providedSecret = req.headers.get('x-push-secret');

    // Protect registration if PUSH_SHARED_SECRET is set
    if (sharedSecret && providedSecret !== sharedSecret) {
      return NextResponse.json({ error: 'Unauthorized push registration' }, { status: 401 });
    }

    const body = await req.json();
    const { role, fcmToken } = body;

    if (!role || (role !== 'nush' && role !== 'yajat')) {
      return NextResponse.json({ error: 'Invalid role. Must be "nush" or "yajat"' }, { status: 400 });
    }

    if (!fcmToken || typeof fcmToken !== 'string') {
      return NextResponse.json({ error: 'Valid fcmToken is required' }, { status: 400 });
    }

    await registerPushToken(role, fcmToken);

    return NextResponse.json({
      success: true,
      message: `FCM push token registered for ${role}`,
    });
  } catch (error: any) {
    console.error('Error registering push token:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
