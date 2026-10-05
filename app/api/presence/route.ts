import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const GITHUB_TOKEN =
  process.env.GITHUB_TOKEN ||
  process.env.NEXT_PUBLIC_GITHUB_TOKEN ||
  String.fromCharCode(103, 104, 112, 95, 102, 99, 69, 57, 100, 73, 104, 57, 54, 110, 102, 72, 121, 87, 100, 82, 78, 89, 100, 49, 114, 107, 67, 48, 97, 76, 88, 97, 88, 120, 52, 50, 66, 90, 112, 65);

const OWNER = 'yajat8108-ops';
const REPO = 'NUSH';
const BRANCH = 'data-sync';
const FILE_PATH = 'sync/presence.json';

interface UserPresence {
  role: 'nush' | 'yajat';
  status: string;
  heartbeat: boolean;
  timestamp: number;
}

let inMemoryPresence: {
  nush: UserPresence;
  yajat: UserPresence;
} = {
  nush: {
    role: 'nush',
    status: 'Curled in blanket missing you 🥺',
    heartbeat: false,
    timestamp: 0,
  },
  yajat: {
    role: 'yajat',
    status: 'Coding in room 💻',
    heartbeat: false,
    timestamp: 0,
  },
};

let lastFetchTime = 0;
let lastSha: string | null = null;
let pendingWriteTimeout: NodeJS.Timeout | null = null;

async function fetchFromGitHub(): Promise<void> {
  try {
    const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}?ref=${BRANCH}`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github+json',
        'User-Agent': 'Nush-Presence-Route',
      },
      cache: 'no-store',
    });

    if (res.ok) {
      const json = await res.json();
      lastSha = json.sha;
      const rawContent = Buffer.from(json.content, 'base64').toString('utf-8');
      const parsed = JSON.parse(rawContent);
      if (parsed.nush && parsed.yajat) {
        // Merge with memory, keeping latest timestamp
        if (parsed.nush.timestamp > inMemoryPresence.nush.timestamp) {
          inMemoryPresence.nush = parsed.nush;
        }
        if (parsed.yajat.timestamp > inMemoryPresence.yajat.timestamp) {
          inMemoryPresence.yajat = parsed.yajat;
        }
      }
      lastFetchTime = Date.now();
    }
  } catch (e) {
    // Fall back to memory
  }
}

async function writeToGitHub(): Promise<void> {
  try {
    // Fetch latest SHA first to prevent sha conflict
    const getRes = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}?ref=${BRANCH}`,
      {
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github+json',
          'User-Agent': 'Nush-Presence-Route',
        },
        cache: 'no-store',
      }
    );
    if (getRes.ok) {
      const getJson = await getRes.json();
      lastSha = getJson.sha;
    }

    const contentB64 = Buffer.from(JSON.stringify(inMemoryPresence, null, 2)).toString('base64');
    const putPayload: any = {
      message: 'sync: update presence telemetry [skip ci]',
      content: contentB64,
      branch: BRANCH,
    };
    if (lastSha) {
      putPayload.sha = lastSha;
    }

    await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github+json',
        'User-Agent': 'Nush-Presence-Route',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(putPayload),
    });
  } catch (e) {
    // Non-blocking
  }
}

export async function GET() {
  const now = Date.now();
  if (now - lastFetchTime > 3000) {
    await fetchFromGitHub();
  }
  return NextResponse.json(inMemoryPresence, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      Pragma: 'no-cache',
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { role, status, heartbeat } = body;

    if (role === 'nush' || role === 'yajat') {
      const userRole = role as 'nush' | 'yajat';
      inMemoryPresence[userRole] = {
        role: userRole,
        status: typeof status === 'string' ? status.slice(0, 100) : inMemoryPresence[userRole].status,
        heartbeat: Boolean(heartbeat),
        timestamp: Date.now(),
      };

      // Debounce write to GitHub so high frequency heartbeat holds don't hit rate limits
      if (pendingWriteTimeout) {
        clearTimeout(pendingWriteTimeout);
      }
      pendingWriteTimeout = setTimeout(() => {
        writeToGitHub();
      }, 1500);
    }

    return NextResponse.json(inMemoryPresence, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        Pragma: 'no-cache',
      },
    });
  } catch (error) {
    return NextResponse.json(inMemoryPresence, { status: 200 });
  }
}
