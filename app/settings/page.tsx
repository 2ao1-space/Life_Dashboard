import ThemeToggle from "@/components/shared/Themetoggle";
import ProfileSection from "@/components/settings/profileSection";
import OptionalFeaturesSection from "@/components/settings/optionalFeaturesSection";
import ModulesSection from "@/components/settings/modulesSection";
import AccountsSection from "@/components/settings/accountsSection";
import DangerZone from "@/components/settings/dangerZone";

export default function SettingsPage() {
  return (
    <main className="mx-auto max-w-md space-y-6 px-4 pb-28 pt-5">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-extrabold text-app-text">الإعدادات</h1>
        <ThemeToggle />
      </div>

      <ProfileSection />

      <section>
        <h2 className="mb-2 text-xs font-bold text-app-text-2">
          الميزات الاختيارية{" "}
          <span className="font-normal">— شغّل/اقفل من هنا مباشرة</span>
        </h2>
        <OptionalFeaturesSection />
      </section>

      <section>
        <h2 className="mb-2 text-xs font-bold text-app-text-2">
          الصفحات الظاهرة
        </h2>
        <ModulesSection />
      </section>

      <section>
        <h2 className="mb-2 text-xs font-bold text-app-text-2">
          الحسابات المالية
        </h2>
        <AccountsSection />
      </section>

      <DangerZone />
    </main>
  );
}
