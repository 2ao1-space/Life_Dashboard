export interface Syncable {
  syncPending(): Promise<void>;
}

class SyncManagerClass {
  private repositories: Syncable[] = [];
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private started = false;

  register(repo: Syncable): void {
    this.repositories.push(repo);
  }

  async syncAll(): Promise<void> {
    if (typeof navigator !== "undefined" && !navigator.onLine) return;

    for (const repo of this.repositories) {
      try {
        await repo.syncPending();
      } catch (error) {
        console.error("[SyncManager] sync failed for a repository:", error);
      }
    }
  }

  start(): void {
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
