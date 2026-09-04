import ProfileSection from "@/components/settings/profileSection";
import GoogleSyncSection from "@/components/settings/googleSyncSection";
import OptionalFeaturesSection from "@/components/settings/optionalFeaturesSection";
import ModulesSection from "@/components/settings/modulesSection";
import AccountsSection from "@/components/settings/accountsSection";
import DangerZone from "@/components/settings/dangerZone";

export default function SettingsPage() {
  return (
    <main className="mx-auto max-w-2xl space-y-7 px-4 pb-28 pt-6 sm:px-6">
      <ProfileSection />

      <section>
        <h2 className="mb-3 text-sm font-extrabold text-app-text">
          اختار تجربتك
        </h2>
        <p className="mb-3 text-xs text-app-text-2">
          فعّل الصفحات والميزات اللي تناسب يومك.
        </p>
        <OptionalFeaturesSection />
      </section>

      <section>
        <h2 className="mb-3 text-sm font-extrabold text-app-text">
          صفحات التطبيق
        </h2>
        <p className="mb-3 text-xs text-app-text-2">
          اضغط على أي صفحة لإظهارها أو إخفائها، واسحب لترتيبها.
        </p>
        <ModulesSection />
      </section>

      <section>
        <h2 className="mb-3 text-sm font-extrabold text-app-text">الماليات</h2>
        <AccountsSection />
      </section>

      <section>
        <h2 className="mb-3 text-sm font-extrabold text-app-text">
          الحساب والمزامنة
        </h2>
        <GoogleSyncSection />
      </section>

      <DangerZone />
    </main>
  );
}
