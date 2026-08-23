export default function OfflinePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3 bg-app-bg px-6 text-center">
      <div className="text-4xl">📡</div>
      <h1 className="text-lg font-bold text-app-text">
        الصفحة دي لسه متزارتش وانت أونلاين
      </h1>
      <p className="max-w-xs text-sm text-app-text-2">
        وصّل بالنت مرة واحدة عشان الصفحة تتحمّل وتتخزن، وبعد كده هتفتح أوفلاين
        عادي زي أي صفحة تانية.
      </p>
    </main>
  );
}
