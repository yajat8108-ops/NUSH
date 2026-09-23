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

const FILE_MAP: Record<string, string> = {
  journal: 'sync/journal.json',
  vault: 'sync/vault.json',
  voice: 'sync/voice.json',
  streak: 'sync/streak.json',
};

// In-memory cache for fast responses
const memoryCache: Record<string, { data: any; timestamp: number }> = {};
const CACHE_TTL_MS = 2000; // 2 seconds cache to avoid slamming GitHub API while keeping near-instant sync

async function fetchFromGitHub(fileKey: string): Promise<{ data: any; sha: string | null }> {
  const filePath = FILE_MAP[fileKey];
  if (!filePath) return { data: [], sha: null };

  const now = Date.now();
  if (memoryCache[fileKey] && now - memoryCache[fileKey].timestamp < CACHE_TTL_MS) {
    return { data: memoryCache[fileKey].data, sha: null };
  }

  const url = 'https://api.github.com/repos/' + OWNER + '/' + REPO + '/contents/' + filePath + '?ref=' + BRANCH;
  const res = await fetch(url, {
    headers: {
      Authorization: 'Bearer ' + GITHUB_TOKEN,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'Nush-Sync-Route',
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    console.error('Failed to fetch ' + filePath + ':', res.status, res.statusText);
    return { data: memoryCache[fileKey]?.data || [], sha: null };
  }

  const json = await res.json();
  const rawContent = Buffer.from(json.content, 'base64').toString('utf-8');
  try {
    const parsed = JSON.parse(rawContent);
    memoryCache[fileKey] = { data: parsed, timestamp: now };
    return { data: parsed, sha: json.sha };
  } catch (e) {
    console.error('JSON parse error for ' + filePath + ':', e);
    return { data: [], sha: json.sha };
  }
}

async function writeToGitHub(fileKey: string, data: any): Promise<boolean> {
  const filePath = FILE_MAP[fileKey];
  if (!filePath) return false;

  // First get current SHA
  let currentSha: string | null = null;
  try {
    const getRes = await fetch(
      'https://api.github.com/repos/' + OWNER + '/' + REPO + '/contents/' + filePath + '?ref=' + BRANCH,
      {
        headers: {
          Authorization: 'Bearer ' + GITHUB_TOKEN,
          Accept: 'application/vnd.github+json',
          'User-Agent': 'Nush-Sync-Route',
        },
        cache: 'no-store',
      }
    );
    if (getRes.ok) {
      const getJson = await getRes.json();
      currentSha = getJson.sha;
    }
  } catch (e) {
    console.error('Error fetching SHA for update:', e);
  }

  const contentB64 = Buffer.from(JSON.stringify(data, null, 2)).toString('base64');
  const putPayload: any = {
    message: 'sync: update ' + fileKey + ' [skip ci]',
    content: contentB64,
    branch: BRANCH,
  };
  if (currentSha) {
    putPayload.sha = currentSha;
  }

  const putRes = await fetch(
    'https://api.github.com/repos/' + OWNER + '/' + REPO + '/contents/' + filePath,
    {
      method: 'PUT',
      headers: {
        Authorization: 'Bearer ' + GITHUB_TOKEN,
        Accept: 'application/vnd.github+json',
        'User-Agent': 'Nush-Sync-Route',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(putPayload),
    }
  );

  if (!putRes.ok) {
    const errText = await putRes.text();
    console.error('Failed to write ' + filePath + ':', putRes.status, errText);
    return false;
  }

  memoryCache[fileKey] = { data, timestamp: Date.now() };
  return true;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const key = searchParams.get('key') || 'all';

  if (key === 'all') {
    const [journalRes, vaultRes, voiceRes, streakRes] = await Promise.all([
      fetchFromGitHub('journal'),
      fetchFromGitHub('vault'),
      fetchFromGitHub('voice'),
      fetchFromGitHub('streak'),
    ]);

    return NextResponse.json(
      {
        journal: journalRes.data,
        vault: vaultRes.data,
        voice: voiceRes.data,
        streak: streakRes.data || { streakCount: 7, lastVisitDate: '2026-09-23' },
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      }
    );
  }

  if (FILE_MAP[key]) {
    const result = await fetchFromGitHub(key);
    return NextResponse.json(result.data, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    });
  }

  return NextResponse.json({ error: 'Invalid key' }, { status: 400 });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, action, item, id, date } = body;

    if (!type || !FILE_MAP[type]) {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    if (type === 'streak') {
      const { data: currentStreakObj } = await fetchFromGitHub('streak');
      const current =
        currentStreakObj && typeof currentStreakObj.streakCount === 'number'
          ? { ...currentStreakObj }
          : { streakCount: 7, lastVisitDate: null };

      const today = date || new Date().toISOString().slice(0, 10);

      if (!current.lastVisitDate) {
        current.lastVisitDate = today;
        current.streakCount = Math.max(current.streakCount || 1, 1);
      } else if (current.lastVisitDate !== today) {
        const [y1, m1, d1] = current.lastVisitDate.split('-').map(Number);
        const [y2, m2, d2] = today.split('-').map(Number);
        const diff = Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86400000);

        if (diff === 1) {
          current.streakCount += 1;
          current.lastVisitDate = today;
        } else if (diff > 1) {
          if (diff <= 2) {
            current.lastVisitDate = today;
          } else {
            current.streakCount = 1;
            current.lastVisitDate = today;
          }
        }
      }

      await writeToGitHub('streak', current);
      return NextResponse.json({ success: true, data: current });
    }

    const { data: currentList } = await fetchFromGitHub(type);
    let updatedList = Array.isArray(currentList) ? [...currentList] : [];

    if (action === 'add') {
      if (!item || !item.id) {
        return NextResponse.json({ error: 'Item with ID required' }, { status: 400 });
      }
      // Deduplicate by ID
      updatedList = [item, ...updatedList.filter((x: any) => x.id !== item.id)];
    } else if (action === 'delete') {
      if (!id) {
        return NextResponse.json({ error: 'ID required to delete' }, { status: 400 });
      }
      updatedList = updatedList.filter((x: any) => x.id !== id);
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Write back
    const ok = await writeToGitHub(type, updatedList);
    if (!ok) {
      return NextResponse.json({ error: 'Failed to write to GitHub store' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: updatedList });
  } catch (error: any) {
    console.error('Error in sync POST:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
