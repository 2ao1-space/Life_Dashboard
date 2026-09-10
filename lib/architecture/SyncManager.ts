import { isSupabaseConfigured } from "@/lib/supabase/client";

export interface Syncable {
  syncPending(): Promise<void>;
  syncLabel?: string;
}

class SyncManagerClass {
  private repositories: Syncable[] = [];
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private started = false;

  register(repo: Syncable): void {
    this.repositories.push(repo);
  }

  async syncAll(): Promise<void> {
    if (!isSupabaseConfigured) return;
    if (typeof navigator !== "undefined" && !navigator.onLine) return;

    for (const [index, repo] of this.repositories.entries()) {
      try {
        await repo.syncPending();
      } catch (error) {
        const details = this.describeError(error);
        console.error(
          `[SyncManager] sync failed for ${repo.syncLabel ?? `repository #${index}`}:`,
          details,
        );
      }
    }
  }

  private describeError(error: unknown): Record<string, unknown> {
    if (error instanceof Error) {
      return {
        name: error.name,
        message: error.message,
        code: "code" in error ? error.code : undefined,
        details: "details" in error ? error.details : undefined,
        hint: "hint" in error ? error.hint : undefined,
        stack: error.stack,
      };
    }

    if (error && typeof error === "object") {
      return Object.fromEntries(
        Object.getOwnPropertyNames(error).map((key) => [
          key,
          (error as Record<string, unknown>)[key],
        ]),
      );
    }

    return { message: String(error) };
  }

  start(): void {
    if (!isSupabaseConfigured) return;
    if (this.started || typeof window === "undefined") return;
    this.started = true;

    window.addEventListener("online", () => {
      this.syncAll();
    });

    this.intervalId = setInterval(() => {
      this.syncAll();
    }, 30_000);

    this.syncAll();
  }

  stop(): void {
    if (this.intervalId) clearInterval(this.intervalId);
    this.started = false;
  }
}

export const SyncManager = new SyncManagerClass();
