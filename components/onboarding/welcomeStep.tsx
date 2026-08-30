"use client";

const HIGHLIGHTS = [
  {
    icon: "📡",
    title: "بيشتغل من غير نت",
    desc: "أي حاجة تعملها بتتسجل فورًا، حتى من غير إنترنت، وتتزامن لوحدها لما النت يرجع.",
  },
  {
    icon: "🎛️",
    title: "أنت اللي بتحدد",
    desc: "النوافل، القيام، الديون والسلف، الزكاة — كل حاجة اختيارية، تفعّلها من الإعدادات وقت ما تحتاجها.",
  },
  {
    icon: "👆",
    title: "دوس على أي كارت",
    desc: "أي حساب أو نوت أو يوم في الكالندر، دوس عليه تفاصيله بتفتح كاملة.",
  },
  {
    icon: "👉",
    title: "اسحب بين الصفحات",
    desc: "حرّك بإصبعك يمين وشمال في أي وقت تتنقل بين الصفحات بسرعة.",
  },
];

export default function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="flex min-h-screen flex-col justify-between px-5 pb-8 pt-12">
      <div>
        <h1 className="mb-1 text-xl font-extrabold text-app-text">
          أهلًا بيك في حياتي 👋
        </h1>
        <p className="mb-8 text-sm text-app-text-2">
          قبل ما نبدأ، ٤ حاجات سريعة تفهمك الدنيا:
        </p>

        <div className="space-y-4">
          {HIGHLIGHTS.map((h) => (
            <div
              key={h.title}
              className="flex gap-3 rounded-card-lg border border-app-border bg-app-surface p-4 shadow-card"
            >
              <span className="text-2xl">{h.icon}</span>
              <div>
                <p className="text-sm font-bold text-app-text">{h.title}</p>
                <p className="mt-0.5 text-xs text-app-text-2">{h.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={onNext}
        className="w-full rounded-card-md bg-app-primary py-3.5 text-sm font-bold text-white"
      >
        تمام، يلا نبدأ
      </button>
    </div>
  );
}
