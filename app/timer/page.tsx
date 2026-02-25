"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";


type TimerPreset = {
  id: string;
  title: string;
  durationSec: number;
};

type RunningTimer = {
  runId: string;
  presetId: string;
  title: string;
  durationSec: number;
  startedAt: number; // epoch seconds
};

const STORAGE_KEY = "ddtd_timers_v1";

function nowSec() {
  return Math.floor(Date.now() / 1000);
}

function formatRemain(sec: number) {
  const s = Math.max(0, sec);
  const hh = Math.floor(s / 3600);
  const mm = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return hh > 0 ? `${hh}:${pad(mm)}:${pad(ss)}` : `${mm}:${pad(ss)}`;
}

function uuid() {
  return crypto.randomUUID?.() ?? `id_${Date.now()}_${Math.random()}`;
}

export default function TimerPage() {
    const searchParams = useSearchParams();
  const presets: TimerPreset[] = useMemo(
    () => [
      { id: "rare_timber", title: "희귀목재(거대 나무) - 2시간", durationSec: 2 * 60 * 60 },
      { id: "black_truffle", title: "검은 트러플 - 15분", durationSec: 15 * 60 },
    ],
    []
  );

  const [running, setRunning] = useState<RunningTimer[]>([]);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const startId = searchParams.get("start");
    if (!startId) return;

    const p = presets.find((x) => x.id === startId);
    if (!p) return;

    // 같은 preset이 이미 실행 중이면 중복 시작 방지
    const exists = running.some(
      (r) => r.presetId === p.id && nowSec() - r.startedAt < r.durationSec
    );
    if (exists) return;

    // startPreset(p) 대신, 현재 파일 함수명이 다르면 아래처럼 직접 추가해도 됨
    // (너 코드에 startPreset 함수가 있다면 startPreset(p)로 바꾸면 더 깔끔)
    const item: RunningTimer = {
      runId: uuid(),
      presetId: p.id,
      title: p.title,
      durationSec: p.durationSec,
      startedAt: nowSec(),
    };
    setRunning((prev) => [item, ...prev]);
  }, [searchParams, presets, running]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setRunning(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(running));
    } catch {}
  }, [running]);

  useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const startPreset = (p: TimerPreset) => {
    const item: RunningTimer = {
      runId: uuid(),
      presetId: p.id,
      title: p.title,
      durationSec: p.durationSec,
      startedAt: nowSec(),
    };
    setRunning((prev) => [item, ...prev]);
  };

  const removeRun = (runId: string) => {
    setRunning((prev) => prev.filter((t) => t.runId !== runId));
  };

  const clearAll = () => setRunning([]);

  const requestNotify = async () => {
    if (!("Notification" in window)) return;
    if (Notification.permission === "granted") return;
    await Notification.requestPermission();
  };

  useEffect(() => {
    if (!("Notification" in window)) return;
    if (Notification.permission !== "granted") return;

    const completedKey = "ddtd_timers_completed_v1";
    let completed: Record<string, true> = {};
    try {
      completed = JSON.parse(localStorage.getItem(completedKey) || "{}");
    } catch {}

    const now = nowSec();
    const newly = running.filter((t) => now - t.startedAt >= t.durationSec && !completed[t.runId]);

    if (newly.length > 0) {
      newly.forEach((t) => {
        completed[t.runId] = true;
        new Notification("두두타투두 타이머 완료", { body: t.title });
      });
      try {
        localStorage.setItem(completedKey, JSON.stringify(completed));
      } catch {}
    }
  }, [tick, running]);

  const now = nowSec();

  return (
    <main className="min-h-screen p-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold">리스폰 타이머</h1>
        <a className="text-sm text-blue-600 underline" href="/">
          홈
        </a>
      </div>

      <div className="mt-4 rounded-xl border p-4">
        <div className="flex items-center justify-between">
          <div className="font-semibold">프리셋</div>
          <button className="text-sm rounded-lg border px-3 py-1 hover:bg-gray-50" onClick={requestNotify}>
            알림 권한 요청
          </button>
        </div>

        <div className="mt-3 grid gap-2">
          {presets.map((p) => (
            <button
              key={p.id}
              className="rounded-xl border p-3 text-left hover:bg-gray-50"
              onClick={() => startPreset(p)}
            >
              <div className="font-medium">{p.title}</div>
              <div className="text-sm text-gray-600">시작 버튼 기준</div>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 rounded-xl border p-4">
        <div className="flex items-center justify-between">
          <div className="font-semibold">실행 중</div>
          <button className="text-sm rounded-lg border px-3 py-1 hover:bg-gray-50" onClick={clearAll}>
            모두 지우기
          </button>
        </div>

        {running.length === 0 ? (
          <p className="mt-3 text-sm text-gray-600">실행 중인 타이머가 없어요.</p>
        ) : (
          <div className="mt-3 grid gap-2">
            {running.map((t) => {
              const endAt = t.startedAt + t.durationSec;
              const remain = endAt - now;
              const done = remain <= 0;
              return (
                <div key={t.runId} className="rounded-xl border p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium">{t.title}</div>
                      <div className="mt-1 text-sm text-gray-600">
                        남은 시간:{" "}
                        <span className={done ? "text-green-700 font-semibold" : "font-semibold"}>
                          {done ? "완료!" : formatRemain(remain)}
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-gray-500">
                        종료 예정: {new Date(endAt * 1000).toLocaleTimeString()}
                      </div>
                    </div>

                    <button className="rounded-lg border px-3 py-1 text-sm hover:bg-gray-50" onClick={() => removeRun(t.runId)}>
                      삭제
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <p className="mt-6 text-xs text-gray-500">
        * 기기 동기화(로그인)는 다음 단계에서 추가 예정.
      </p>
    </main>
  );
}
