"use client";

import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { SyncManager } from "@/lib/architecture/SyncManager";
import { UserProvider } from "@/lib/context/UserContext";

import "@/lib/repositories/profileRepository";
import "@/lib/repositories/settingsRepository";
import "@/lib/repositories/accountsRepository";
import "@/lib/repositories/transactionsRepository";
import "@/lib/repositories/transactionReasonsRepository";
import "@/lib/repositories/debtsRepository";
import "@/lib/repositories/zakatPaymentsRepository";
import "@/lib/repositories/prayerRepository";
// import "@/lib/repositories/dhikrsRepository";
// import "@/lib/repositories/duasRepository";
// import "@/lib/repositories/quranLogsRepository";
// import "@/lib/repositories/habitsRepository";
// import "@/lib/repositories/habitLogsRepository";
// import "@/lib/repositories/tasksRepository";
// import "@/lib/repositories/moodsRepository";
// import "@/lib/repositories/notesRepository";
// import "@/lib/repositories/documentsRepository";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  useEffect(() => {
    SyncManager.start();
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <UserProvider>{children}</UserProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
