"use client";

import { useEffect, useMemo, useState } from "react";

const TASKS_STORAGE_KEY = "ddtd_tasks_v1";

// /tasks와 같은 규칙(아시아 서버 KST, 06:00 리셋)
function getKSTGameDateKey(resetHour = 6, d = new Date()) {
  const kst = new Date(d.toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
  kst.setHours(kst.getHours() - resetHour);

  const y = kst.getFullYear();
  const m = String(kst.getMonth() + 1).padStart(2, "0");
  const day = String(kst.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function getISOWeekGameKey(resetHour = 6, d = new Date()) {
  const kst = new Date(d.toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
  kst.setHours(kst.getHours() - resetHour);

  const date = new Date(Date.UTC(kst.getFullYear(), kst.getMonth(), kst.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);

  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);

  const yyyy = date.getUTCFullYear();
  return `${yyyy}-W${String(weekNo).padStart(2, "0")}`;
}

type TasksState = {
  version: 1;
  daily: Record<string, string[]>;
  weekly: Record<string, string[]>;
};

function loadTasksState(): TasksState | null {
  try {
    const raw = localStorage.getItem(TASKS_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.version !== 1) return null;
    return parsed as TasksState;
  } catch {
    return null;
  }
}

export default function HomePage() {
  // ⚠️ 지금은 샘플 숙제 개수( /tasks에 있는 것과 맞춰둠 )
  const dailyTotal = 3;
  const weeklyTotal = 2;

  const RESET_HOUR = 6;
  const dailyKey = useMemo(() => getKSTGameDateKey(RESET_HOUR), []);
  const weeklyKey = useMemo(() => getISOWeekGameKey(RESET_HOUR), []);

  const [dailyDone, setDailyDone] = useState(0);
  const [weeklyDone, setWeeklyDone] = useState(0);

  useEffect(() => {
    const s = loadTasksState();
    const d = s?.daily?.[dailyKey]?.length ?? 0;
    const w = s?.weekly?.[weeklyKey]?.length ?? 0;
    setDailyDone(d);
    setWeeklyDone(w);
  }, [dailyKey, weeklyKey]);

  return (
    <main className="min-h-screen p-6">
      <h1 className="text-2xl font-bold">두두타투두 (Heartopia Todo)</h1>

      <div className="mt-2 text-sm text-gray-600">
        아시아 서버 기준 리셋: <span className="font-semibold">매일 06:00</span>
      </div>

      {/* 진행률 요약 */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl border p-4">
          <div className="text-sm text-gray-600">오늘 일일 진행</div>
          <div className="mt-1 text-xl font-bold">
            {dailyDone}/{dailyTotal}
          </div>
          <div className="mt-1 text-xs text-gray-500">키: {dailyKey}</div>
        </div>

        <div className="rounded-xl border p-4">
          <div className="text-sm text-gray-600">이번 주 진행</div>
          <div className="mt-1 text-xl font-bold">
            {weeklyDone}/{weeklyTotal}
          </div>
          <div className="mt-1 text-xs text-gray-500">키: {weeklyKey}</div>
        </div>
      </div>

      {/* 메뉴 */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        <a className="rounded-xl border p-4 hover:bg-gray-50" href="/tasks">
          <div className="font-semibold">숙제도우미</div>
          <div className="text-sm text-gray-600">일일/주간 체크</div>
        </a>
        <a className="rounded-xl border p-4 hover:bg-gray-50" href="/dex">
          <div className="font-semibold">도감</div>
          <div className="text-sm text-gray-600">획득 방법/조건 검색</div>
        </a>
        <a className="rounded-xl border p-4 hover:bg-gray-50" href="/map">
          <div className="font-semibold">채집 지도</div>
          <div className="text-sm text-gray-600">스팟 핀/필터</div>
        </a>
        <a className="rounded-xl border p-4 hover:bg-gray-50" href="/timer">
          <div className="font-semibold">리스폰 타이머</div>
          <div className="text-sm text-gray-600">2시간/15분</div>
        </a>
        <a className="rounded-xl border p-4 hover:bg-gray-50" href="/sell">
          <div className="font-semibold">판매 효율</div>
          <div className="text-sm text-gray-600">판매가/정렬</div>
        </a>
      </div>

      <p className="mt-8 text-xs text-gray-500">
        * 로그인/동기화는 다음 단계에서 추가 예정
      </p>
    </main>
  );
}
