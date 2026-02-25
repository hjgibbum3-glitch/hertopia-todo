"use client";

import { useEffect, useMemo, useState } from "react";
import dailyData from "../../data/v1/tasks_daily.json";
import weeklyData from "../../data/v1/tasks_weekly.json";

type TaskLink = {
    type: "timer" | "map" | "dex" | "sell" | "guide";
    label: string;
    href: string;
  };
  
  type Task = {
    id: string;
    title: string;
    group: "daily" | "weekly";
    priority: number;
    tags?: string[];
    links?: TaskLink[];
  };
  

type TasksState = {
  version: 1;
  daily: Record<string, string[]>;  // key: YYYY-MM-DD
  weekly: Record<string, string[]>; // key: YYYY-Www
};

const STORAGE_KEY = "ddtd_tasks_v1";

function getKSTGameDateKey(resetHour = 6, d = new Date()) {
    // KST 기준 '게임 날짜키' (리셋 시각 전에는 전날로 취급)
    const kst = new Date(d.toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
    kst.setHours(kst.getHours() - resetHour);
  
    const y = kst.getFullYear();
    const m = String(kst.getMonth() + 1).padStart(2, "0");
    const day = String(kst.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }
  
  function getISOWeekGameKey(resetHour = 6, d = new Date()) {
    // KST 기준 '게임 주차키' (리셋 시각 전에는 전날로 취급)
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
  

function loadState(): TasksState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) throw new Error("no data");
    const parsed = JSON.parse(raw) as TasksState;
    if (parsed?.version !== 1) throw new Error("bad version");
    return parsed;
  } catch {
    return { version: 1, daily: {}, weekly: {} };
  }
}

function saveState(s: TasksState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

export default function TasksPage() {
  // ✅ 샘플 숙제(나중에 실제 Heartopia 숙제로 교체)
  const dailyTasks: Task[] = useMemo(
    () => (dailyData as any[]).map((t) => ({ ...t, group: "daily" as const })),
    []
  );
  
  const weeklyTasks: Task[] = useMemo(
    () => (weeklyData as any[]).map((t) => ({ ...t, group: "weekly" as const })),
    []
  );
  

  const [tab, setTab] = useState<"daily" | "weekly">("daily");
  const [state, setState] = useState<TasksState>({ version: 1, daily: {}, weekly: {} });

  const RESET_HOUR = 6; // 아시아 서버 새벽 6시 리셋
  const dailyKey = getKSTGameDateKey(RESET_HOUR);
  const weeklyKey = getISOWeekGameKey(RESET_HOUR);
  

  // load once
  useEffect(() => {
    const s = loadState();
    setState(s);
  }, []);

  // save on change
  useEffect(() => {
    saveState(state);
  }, [state]);

  const doneIds = tab === "daily"
    ? (state.daily[dailyKey] ?? [])
    : (state.weekly[weeklyKey] ?? []);

  const tasks = tab === "daily"
    ? [...dailyTasks].sort((a, b) => a.priority - b.priority)
    : [...weeklyTasks].sort((a, b) => a.priority - b.priority);

  const toggleDone = (taskId: string) => {
    setState((prev) => {
      const next = { ...prev, daily: { ...prev.daily }, weekly: { ...prev.weekly } };

      if (tab === "daily") {
        const list = new Set(next.daily[dailyKey] ?? []);
        list.has(taskId) ? list.delete(taskId) : list.add(taskId);
        next.daily[dailyKey] = Array.from(list);
      } else {
        const list = new Set(next.weekly[weeklyKey] ?? []);
        list.has(taskId) ? list.delete(taskId) : list.add(taskId);
        next.weekly[weeklyKey] = Array.from(list);
      }

      return next;
    });
  };

  const clearToday = () => {
    setState((prev) => {
      const next = { ...prev, daily: { ...prev.daily }, weekly: { ...prev.weekly } };
      if (tab === "daily") next.daily[dailyKey] = [];
      else next.weekly[weeklyKey] = [];
      return next;
    });
  };

  const progress = tasks.length === 0 ? 0 : Math.round((doneIds.length / tasks.length) * 100);

  return (
    <main className="min-h-screen p-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold">숙제도우미</h1>
        <a className="text-sm text-blue-600 underline" href="/">
          홈
        </a>
      </div>

      <div className="mt-2 text-xs text-gray-500">
        {tab === "daily" ? `오늘(${dailyKey})` : `이번 주(${weeklyKey})`} 기준으로 저장됩니다.
      </div>

      {/* Tabs */}
      <div className="mt-4 flex gap-2">
        <button
          className={`rounded-lg border px-3 py-2 text-sm ${tab === "daily" ? "bg-gray-100 font-semibold" : "hover:bg-gray-50"}`}
          onClick={() => setTab("daily")}
        >
          일일
        </button>
        <button
          className={`rounded-lg border px-3 py-2 text-sm ${tab === "weekly" ? "bg-gray-100 font-semibold" : "hover:bg-gray-50"}`}
          onClick={() => setTab("weekly")}
        >
          주간
        </button>

        <div className="ml-auto flex items-center gap-2">
          <div className="text-sm text-gray-600">{progress}%</div>
          <button className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50" onClick={clearToday}>
            초기화
          </button>
        </div>
      </div>

      {/* List */}
      <div className="mt-4 rounded-xl border p-4">
        <div className="grid gap-2">
          {tasks.map((t) => {
            const checked = doneIds.includes(t.id);
            return (
              <label
                key={t.id}
                className="flex items-center gap-3 rounded-lg border p-3 hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleDone(t.id)}
                  className="h-4 w-4"
                />
                <div className="flex-1">
                  <div className={`font-medium ${checked ? "line-through text-gray-500" : ""}`}>{t.title}</div>
                  <div className="text-xs text-gray-500">우선순위 {t.priority}</div>
                  {/* tags */}
{t.tags?.length ? (
  <div className="mt-2 flex flex-wrap gap-1">
    {t.tags.map((tag) => (
      <span
        key={tag}
        className="rounded-full border px-2 py-0.5 text-xs text-gray-600"
      >
        {tag}
      </span>
    ))}
  </div>
) : null}

{/* links */}
{t.links?.length ? (
  <div className="mt-2 flex flex-wrap gap-2">
    {t.links.map((lnk) => (
 <a
 key={`${t.id}-${lnk.href}-${lnk.label}`}
 href={lnk.href}
 className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 active:scale-[0.98]"
 onClick={(e) => e.stopPropagation()}
>
 <span>
   {lnk.label === "가이드" ? "📘 " : ""}
   {lnk.label}
 </span>
</a>

    ))}
  </div>
) : null}

                </div>
              </label>
            );
          })}
        </div>

        <p className="mt-4 text-xs text-gray-500">
          * 지금은 샘플 숙제입니다. 실제 두근두근타운 숙제 데이터로 교체하면서 완성합니다.
        </p>
      </div>
    </main>
  );
}
