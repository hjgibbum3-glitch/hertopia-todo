import guides from "@/data/v1/guides.json";

export function generateStaticParams() {
  return Object.keys(guides).map((slug) => ({ slug }));
}


export default async function GuidePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  type Guide = { title: string; body: string[] };
  type Guides = Record<string, Guide>;
  
  const data =
    (guides as Guides)[slug] ??
    ({
      title: "가이드",
      body: ["이 가이드는 아직 준비 중입니다. 곧 업데이트할게요."],
    } satisfies Guide);
  

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
