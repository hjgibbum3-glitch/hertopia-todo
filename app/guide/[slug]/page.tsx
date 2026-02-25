export function generateStaticParams() {
  return [{ slug: "daily-routine" }, { slug: "weekly-routine" }];
}

export default async function GuidePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const content: Record<string, { title: string; body: string[] }> = {
    "daily-routine": {
      title: "일일 루틴 가이드",
      body: [
        "매일 06:00(아시아 서버) 리셋 기준으로 루틴을 체크하세요.",
        "상점 확인 → 채집/낚시 → 요리/가공 순으로 진행하면 편합니다.",
        "필요하면 타이머/지도 기능과 같이 사용하세요.",
      ],
    },
    "weekly-routine": {
      title: "주간 루틴 가이드",
      body: [
        "주간 목표 보상은 잊기 쉬우니 우선순위를 높게 두세요.",
        "콘텐츠 반복형 숙제는 타이머를 같이 쓰면 편합니다.",
      ],
    },
  };

  const data =
    content[slug] ?? {
      title: "가이드",
      body: ["이 가이드는 아직 준비 중입니다. 곧 업데이트할게요."],
    };

  return (
    <main className="min-h-screen p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">{data.title}</h1>
        <a className="text-sm text-blue-600 underline" href="/tasks">
          숙제로
        </a>
      </div>

      <div className="mt-4 rounded-xl border p-4">
        <div className="text-sm text-gray-600">slug: {slug}</div>
        <ul className="mt-3 list-disc pl-5">
          {data.body.map((line, i) => (
            <li key={i} className="mt-1">
              {line}
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
