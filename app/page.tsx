export default function HomePage() {
  return (
    <main className="min-h-screen p-6">
      <h1 className="text-2xl font-bold">두두타투두 (Heartopia Todo)</h1>
      <p className="mt-2 text-sm text-gray-600">
        숙제 / 도감 / 지도 / 타이머 / 판매 효율을 한 곳에서.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <a className="rounded-xl border p-4 hover:bg-gray-50" href="/tasks">
          <div className="font-semibold">숙제도우미</div>
          <div className="text-sm text-gray-600">일일/주간/시즌 체크</div>
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
          <div className="text-sm text-gray-600">2시간/15분 알림</div>
        </a>
        <a className="rounded-xl border p-4 hover:bg-gray-50" href="/sell">
          <div className="font-semibold">판매 효율</div>
          <div className="text-sm text-gray-600">판매가/정렬</div>
        </a>
      </div>

      <p className="mt-8 text-xs text-gray-500">
        * 로그인/동기화는 나중에 추가 예정
      </p>
    </main>
  );
}
