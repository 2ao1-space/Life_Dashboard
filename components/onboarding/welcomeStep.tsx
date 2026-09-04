"use client";

const PRINCIPLES = [
  {
    title: "خد يومك واحدة واحدة",
    desc: "تابع صلاتك وعاداتك ومهامك من غير ما تحس إنك داخل على جدول معقد.",
  },
  {
    title: "كل شيء في مكانه",
    desc: "من ملاحظاتك لفلوسك، حاجاتك المهمة تفضل قريبة وسهلة الوصول.",
  },
  {
    title: "على طريقتك أنت",
    desc: "اختار اللي تحتاجه دلوقتي، وسيب الباقي لوقت ما يبقى مناسب ليك.",
  },
];

export default function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <main className="onboarding-shell flex min-h-screen flex-col justify-between px-5 pb-8 pt-7">
      <div>
        <div className="mb-10 flex items-center justify-between">
          <span className="text-xs font-bold text-app-primary">ميزان</span>
          <div
            className="flex items-center gap-2"
            aria-label="الخطوة الأولى من خطوتين"
          >
            <span className="h-1.5 w-10 rounded-full bg-app-primary" />
            <span className="h-1.5 w-10 rounded-full bg-app-border" />
            <span className="mr-1 text-[11px] text-app-text-2">١ / ٢</span>
          </div>
        </div>

        <div className="onboarding-reveal mb-8">
          <p className="mb-3 text-sm font-semibold text-app-primary">
            أهلًا بيك
          </p>
          <h1 className="max-w-sm text-3xl font-extrabold leading-tight text-app-text">
            حياتك، بشكل أبسط
          </h1>
          <p className="mt-3 max-w-sm text-sm leading-7 text-app-text-2">
            ميزان معمول عشان يساعدك تلاحظ يومك وتعتني بالحاجات اللي تفرق معاك،
            من غير ضغط ولا زحمة.
          </p>
        </div>

        <div className="space-y-3">
          {PRINCIPLES.map((principle, index) => (
            <div
              key={principle.title}
              className="onboarding-reveal rounded-card-md border border-app-border bg-app-surface p-4 shadow-card"
              style={{ animationDelay: `${index * 70 + 100}ms` }}
            >
              <p className="text-sm font-bold text-app-text">
                {principle.title}
              </p>
              <p className="mt-1 text-xs leading-5 text-app-text-2">
                {principle.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={onNext}
        className="mt-8 w-full rounded-card-md bg-app-primary py-3.5 text-sm font-bold text-white shadow-card transition-transform active:scale-[.98]"
      >
        تمام، يلا نبدأ
      </button>
    </main>
  );
}
