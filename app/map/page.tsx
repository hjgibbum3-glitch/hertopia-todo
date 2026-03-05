"use client";

import { useMemo, useState } from "react";
import rawSpots from "@/data/v1/gather_spots.json";

type UISpot = {
  id: string;
  title: string;
  area?: string;
  tags?: string[];
  note?: string;
};

// 어떤 값이 와도 string[]로 바꿔주는 안전 함수
function toStringArray(v: unknown): string[] {
  if (Array.isArray(v)) return v.filter((x) => typeof x === "string" && x.trim().length > 0) as string[];
  if (typeof v === "string" && v.trim().length > 0) return [v.trim()];
  return [];
}

export default function MapPage() {
  // ✅ raw JSON -> 화면에서 쓰기 좋은 UISpot으로 “정규화”
  const spots: UISpot[] = useMemo(() => {
    const list = (rawSpots as unknown) as any[];

    return list.map((r, idx) => {
      const id = String(r.id ?? `spot_${idx + 1}`);

      // JSON에 title이 없고 name이 있는 케이스를 대비
      const title = String(r.title ?? r.name ?? `스팟 ${idx + 1}`);

      // region / area 둘 중 뭐가 와도 표시되게
      const area = (r.area ?? r.region) ? String(r.area ?? r.region) : undefined;

      // tags: tags/types/items가 섞여 있을 수 있으니 모두 합치기
      const tags = Array.from(
        new Set([
          ...toStringArray(r.tags),
          ...toStringArray(r.types),
          ...toStringArray(r.items),
        ])
      );
      const tagsOrUndef = tags.length ? tags : undefined;

      // note: conditions/respawn/tips/weather 등을 한 줄 메모로 합치기
      const noteParts: string[] = [];

      // conditions가 배열/문자열/객체 어떤 형태든 안전 처리
      const cond = r.conditions;
      if (cond) {
        if (Array.isArray(cond)) {
          noteParts.push(...toStringArray(cond));
        } else if (typeof cond === "string") {
          noteParts.push(cond);
        } else if (typeof cond === "object") {
          // 흔한 형태: { time:[], weather:[] } 같은 구조 대응
          noteParts.push(...toStringArray((cond as any).time).map((t) => `시간: ${t}`));
          noteParts.push(...toStringArray((cond as any).weather).map((w) => `날씨: ${w}`));
          // 혹시 다른 키로 배열이 들어있는 경우도 대비
          noteParts.push(...toStringArray((cond as any).text));
        }
      }

      // weather가 따로 있으면 추가
      noteParts.push(...toStringArray(r.weather).map((w) => `날씨: ${w}`));

      // respawn/tips/note가 있으면 추가
      noteParts.push(...toStringArray(r.respawn).map((x) => `리젠: ${x}`));
      noteParts.push(...toStringArray(r.tips));
      noteParts.push(...toStringArray(r.note));

      const note = noteParts.length ? noteParts.join(" · ") : undefined;

      return { id, title, area, tags: tagsOrUndef, note };
    });
  }, []);

  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const keyword = q.trim().toLowerCase();
    if (!keyword) return spots;

    return spots.filter((s) => {
      const hay = [
        s.title,
        s.area ?? "",
        (s.tags ?? []).join(" "),
        s.note ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(keyword);
    });
  }, [q, spots]);

  return (
    <main className="min-h-screen p-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold">채집 지도</h1>
        <a className="text-sm text-blue-600 underline" href="/">
          홈
        </a>
      </div>

      <div className="mt-2 text-xs text-gray-500">
        * 현재는 “지도 UI(모비라이프풍)” 전 단계로, 데이터/검색/구조부터 먼저 잡습니다.
      </div>

      {/* Search */}
      <div className="mt-4 flex flex-col gap-2">
        <label className="text-sm font-medium">검색</label>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="w-full rounded-lg border px-3 py-2 text-sm"
          placeholder="예) 루틴, 지역명, 메모, 태그…"
        />
      </div>

      {/* List */}
      <div className="mt-4 rounded-xl border p-4">
        <div className="text-sm text-gray-600 mb-3">
          결과: <span className="font-semibold">{filtered.length}</span>개
        </div>

        <div className="grid gap-2">
          {filtered.map((s) => (
            <div key={s.id} className="rounded-lg border p-3">
              <div className="font-medium">{s.title}</div>

              {s.area ? (
                <div className="mt-1 text-xs text-gray-500">지역: {s.area}</div>
              ) : null}

              {s.note ? (
                <div className="mt-1 text-xs text-gray-500">{s.note}</div>
              ) : null}

              {s.tags?.length ? (
                <div className="mt-2 flex flex-wrap gap-1">
                  {s.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border px-2 py-0.5 text-xs text-gray-600"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}