interface SyncErrorInfo {
  repositoryName: string;
  message: string;
  timestamp: string;
  failCount: number;
}

class SyncStatusStore {
  private listeners = new Set<() => void>();
  errors: SyncErrorInfo[] = [];

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  subscribe(fn: () => void) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  reportError(repositoryName: string, error: unknown) {
    console.error(`[Sync Error] ${repositoryName}:`, error);
    const existing = this.errors.find(
      (e) => e.repositoryName === repositoryName,
    );
    if (existing) {
      existing.failCount += 1;
      existing.message = String(error);
      existing.timestamp = new Date().toISOString();
    } else {
      this.errors.push({
        repositoryName,
        message: String(error),
        timestamp: new Date().toISOString(),
        failCount: 1,
      });
    }
    this.notify();
  }

  clearError(repositoryName: string) {
    this.errors = this.errors.filter(
      (e) => e.repositoryName !== repositoryName,
    );
    this.notify();
  }
}

export const syncStatusStore = new SyncStatusStore();
