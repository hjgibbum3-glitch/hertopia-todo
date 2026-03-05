"use client";

import { useMemo, useState } from "react";
import spots from "@/data/v1/gather_spots.json";

type SpotType = "fish" | "bug" | "bird" | "forage";

type Spot = {
  id: string;
  name: string;
  region: string;
  types: SpotType[];
  items: string[];
  conditions?: {
    time?: string[];
    weather?: string[];
    respawn?: string;
  };
  tips?: string[];
};

const TYPE_LABEL: Record<SpotType, string> = {
  fish: "어류",
  bug: "곤충",
  bird: "새관찰",
  forage: "채집(기타)",
};

export default function GatherPage() {
  const all = spots as Spot[];

  // 지역 목록 자동 생성
  const regions = useMemo(() => {
    const set = new Set(all.map((s) => s.region));
    return ["전체", ...Array.from(set)];
  }, [all]);

  const [q, setQ] = useState("");
  const [type, setType] = useState<"all" | SpotType>("all");
  const [region, setRegion] = useState<string>("전체");
  const [openId, setOpenId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();

    return all.filter((s) => {
      if (type !== "all" && !s.types.includes(type)) return false;
      if (region !== "전체" && s.region !== region) return false;

      if (!query) return true;

      const hay = [
        s.name,
        s.id,
        s.region,
        ...(s.types ?? []),
        ...(s.tips ?? []),
        ...(s.items ?? []),
        ...(s.conditions?.time ?? []),
        ...(s.conditions?.weather ?? []),
        s.conditions?.respawn ?? "",
      ]
        .join(" ")
        .toLowerCase();

      return hay.includes(query);
    });
  }, [all, q, type, region]);

  const clearFilters = () => {
    setQ("");
    setType("all");
    setRegion("전체");
    setOpenId(null);
  };

  return (
    <main className="min-h-screen p-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold">채집</h1>
        <a className="text-sm text-blue-600 underline" href="/">
          홈
        </a>
      </div>

      {/* Filters */}
      <div className="mt-4 rounded-xl border p-4">
        <div className="grid gap-3">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="스팟/지역/팁 검색 (예: 숲, 낚시, 15분)"
            className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-gray-400"
          />

          <div className="flex flex-wrap items-center gap-2">
            {/* Type */}
            <div className="flex flex-wrap gap-2">
              <button
                className={`rounded-full border px-3 py-1 text-sm ${
                  type === "all" ? "bg-gray-100 font-semibold" : "hover:bg-gray-50"
                }`}
                onClick={() => setType("all")}
              >
                전체
              </button>
              {(Object.keys(TYPE_LABEL) as SpotType[]).map((t) => (
                <button
                  key={t}
                  className={`rounded-full border px-3 py-1 text-sm ${
                    type === t ? "bg-gray-100 font-semibold" : "hover:bg-gray-50"
                  }`}
                  onClick={() => setType(t)}
                >
                  {TYPE_LABEL[t]}
                </button>
              ))}
            </div>

            {/* Region */}
            <div className="ml-auto flex items-center gap-2">
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="rounded-lg border px-3 py-2 text-sm"
              >
                {regions.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>

              <button className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50" onClick={clearFilters}>
                초기화
              </button>
            </div>
          </div>

          <div className="text-xs text-gray-500">
            결과: <span className="font-semibold">{filtered.length}</span>개
          </div>
        </div>
      </div>

      {/* List */}
      <div className="mt-4 grid gap-2">
        {filtered.map((s) => {
          const isOpen = openId === s.id;
          return (
            <div key={s.id} className="rounded-xl border">
              <button
                className="w-full text-left p-4 hover:bg-gray-50"
                onClick={() => setOpenId(isOpen ? null : s.id)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold">{s.name}</div>
                    <div className="mt-1 text-xs text-gray-500">
                      지역: {s.region} · 타입: {s.types.map((t) => TYPE_LABEL[t]).join(", ")}
                    </div>
                  </div>

                  {s.conditions?.respawn ? (
                    <div className="text-right">
                      <div className="text-xs text-gray-600">리스폰</div>
                      <div className="font-bold">{s.conditions.respawn}</div>
                    </div>
                  ) : null}
                </div>
              </button>

              {isOpen ? (
                <div className="border-t p-4 text-sm">
                  <div className="grid gap-2 text-xs text-gray-600">
                    {s.conditions?.time?.length ? <div>시간: {s.conditions.time.join(", ")}</div> : null}
                    {s.conditions?.weather?.length ? <div>날씨: {s.conditions.weather.join(", ")}</div> : null}
                    {s.items?.length ? <div>연결 아이템 id: {s.items.join(", ")}</div> : <div>연결 아이템 id: —</div>}
                    {s.tips?.length ? <div>팁: {s.tips.join(" / ")}</div> : null}
                    <div className="text-gray-400">id: {s.id}</div>
                  </div>

                  {s.conditions?.respawn === "15m" ? (
                    <div className="mt-3">
                      <a
                        className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 active:scale-[0.98]"
                        href="/timer?start=black_truffle"
                      >
                        ⏱️ 트러플 타이머 시작
                      </a>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          );
        })}

        {filtered.length === 0 ? (
          <div className="rounded-xl border p-6 text-sm text-gray-600">
            검색 결과가 없어요. 키워드를 바꿔보세요.
          </div>
        ) : null}
      </div>
    </main>
  );
}