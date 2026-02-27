"use client";

import { useMemo, useState } from "react";
import dexItems from "@/data/v1/dex_items.json";

type DexCategory = "fish" | "bug" | "bird" | "food" | "garden";
type DexRarity = "common" | "uncommon" | "rare" | "epic" | "legendary";

type DexItem = {
  id: string;
  name: string;
  category: DexCategory;
  rarity?: DexRarity;
  sellPrice?: number;
  howTo: string[];
  time?: string[];
  weather?: string[];
  locations?: string[];
  keywords?: string[];
};

const CATEGORY_LABEL: Record<DexCategory, string> = {
  fish: "어류",
  bug: "곤충",
  bird: "새관찰",
  food: "미식(요리)",
  garden: "원예",
};

const RARITY_LABEL: Record<string, string> = {
  common: "일반",
  uncommon: "고급",
  rare: "희귀",
  epic: "에픽",
  legendary: "전설",
};

export default function DexPage() {
  const all = dexItems as DexItem[];

  const [q, setQ] = useState("");
  const [category, setCategory] = useState<"all" | DexCategory>("all");
  const [sort, setSort] = useState<"name_asc" | "price_desc" | "price_asc">("name_asc");
  const [openId, setOpenId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();

    let items = all.filter((it) => {
      if (category !== "all" && it.category !== category) return false;
      if (!query) return true;

      const hay = [
        it.name,
        it.id,
        ...(it.keywords ?? []),
        ...(it.howTo ?? []),
        ...(it.locations ?? []),
        ...(it.time ?? []),
        ...(it.weather ?? []),
      ]
        .join(" ")
        .toLowerCase();

      return hay.includes(query);
    });

    items = items.sort((a, b) => {
      if (sort === "name_asc") return a.name.localeCompare(b.name);
      const ap = a.sellPrice ?? 0;
      const bp = b.sellPrice ?? 0;
      if (sort === "price_desc") return bp - ap;
      return ap - bp;
    });

    return items;
  }, [all, q, category, sort]);

  const clearFilters = () => {
    setQ("");
    setCategory("all");
    setSort("name_asc");
    setOpenId(null);
  };

  return (
    <main className="min-h-screen p-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold">도감</h1>
        <a className="text-sm text-blue-600 underline" href="/">
          홈
        </a>
      </div>

      {/* Search */}
      <div className="mt-4 rounded-xl border p-4">
        <div className="grid gap-3">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="이름/키워드/장소로 검색 (예: 낚시, 숲, 낮)"
            className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-gray-400"
          />

          <div className="flex flex-wrap items-center gap-2">
            {/* Category */}
            <div className="flex flex-wrap gap-2">
              <button
                className={`rounded-full border px-3 py-1 text-sm ${
                  category === "all" ? "bg-gray-100 font-semibold" : "hover:bg-gray-50"
                }`}
                onClick={() => setCategory("all")}
              >
                전체
              </button>
              {(Object.keys(CATEGORY_LABEL) as DexCategory[]).map((c) => (
                <button
                  key={c}
                  className={`rounded-full border px-3 py-1 text-sm ${
                    category === c ? "bg-gray-100 font-semibold" : "hover:bg-gray-50"
                  }`}
                  onClick={() => setCategory(c)}
                >
                  {CATEGORY_LABEL[c]}
                </button>
              ))}
            </div>

            {/* Sort */}
            <div className="ml-auto flex flex-wrap items-center gap-2">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as any)}
                className="rounded-lg border px-3 py-2 text-sm"
              >
                <option value="name_asc">이름순</option>
                <option value="price_desc">판매가 높은순</option>
                <option value="price_asc">판매가 낮은순</option>
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
        {filtered.map((it) => {
          const isOpen = openId === it.id;
          return (
            <div key={it.id} className="rounded-xl border">
              <button
                className="w-full text-left p-4 hover:bg-gray-50"
                onClick={() => setOpenId(isOpen ? null : it.id)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold">{it.name}</div>
                    <div className="mt-1 text-xs text-gray-500">
                      {CATEGORY_LABEL[it.category]} · {it.rarity ? RARITY_LABEL[it.rarity] ?? it.rarity : "—"}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm text-gray-600">판매가</div>
                    <div className="font-bold">{it.sellPrice ?? 0}</div>
                  </div>
                </div>
              </button>

              {isOpen ? (
                <div className="border-t p-4 text-sm">
                  <div className="font-semibold">획득 방법</div>
                  <ul className="mt-2 list-disc pl-5">
                    {it.howTo.map((line, idx) => (
                      <li key={idx} className="mt-1">
                        {line}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-4 grid gap-2 text-xs text-gray-600">
                    {it.locations?.length ? <div>장소: {it.locations.join(", ")}</div> : null}
                    {it.time?.length ? <div>시간: {it.time.join(", ")}</div> : null}
                    {it.weather?.length ? <div>날씨: {it.weather.join(", ")}</div> : null}
                    {it.keywords?.length ? <div>키워드: {it.keywords.join(", ")}</div> : null}
                    <div className="text-gray-400">id: {it.id}</div>
                  </div>
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