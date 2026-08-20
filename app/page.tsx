"use client";
import { useProfile } from "@/hooks/useProfile";
// import { db } from "@/lib/architecture/db";

export default function Home() {
  // useEffect(() => {
  //   db.profile.put({
  //     id: "profile",
  //     name: "تجربة",
  //     birthDate: null,
  //     syncStatus: "pending",
  //     updatedAt: new Date().toISOString(),
  //   });
  // }, []);

  const { profile, saveProfile } = useProfile();

  return (
    <div>
      <p>الاسم: {profile?.name ?? "مفيش"}</p>
      <button onClick={() => saveProfile({ name: "أحمد", birthDate: null })}>
        احفظ
      </button>
    </div>
  );
}
