"use client";

import { useEffect } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { useUserId } from "@/lib/context/UserContext";
import { db } from "@/lib/architecture/db";
import { accountsRepository } from "@/lib/repositories/accountsRepository";
import type { AccountEntity } from "@/types/settings";

const seedingPromises = new Map<string, Promise<void>>();

function ensureDefaultAccount(userId: string): Promise<void> {
  const inFlight = seedingPromises.get(userId);
  if (inFlight) return inFlight;

  const promise = db.transaction("rw", db.accounts, async () => {
    const count = await db.accounts.where("user_id").equals(userId).count();
    if (count > 0) return;
    await accountsRepository.create(userId, {
      name: "كاش",
      icon: "💵",
      balance: 0,
      is_default: true,
      order: 0,
    });
  });

  seedingPromises.set(userId, promise);
  return promise;
}

export function useAccounts() {
  const { userId } = useUserId();

  useEffect(() => {
    if (userId) {
      ensureDefaultAccount(userId);
    }
  }, [userId]);

  const accounts = useLiveQuery(async () => {
    if (!userId) return undefined;
    const all = await accountsRepository.getAll(userId);
    return all.sort((a, b) => a.order - b.order);
  }, [userId]);

  const addAccount = (data: { name: string; icon: string }) => {
    if (!userId) return;
    accountsRepository.create(userId, {
      name: data.name,
      icon: data.icon,
      balance: 0,
      is_default: false,
      order: accounts?.length ?? 0,
    });
  };

  const updateAccount = (id: string, changes: Partial<AccountEntity>) => {
    accountsRepository.update(id, changes);
  };

  const removeAccount = (id: string) => {
    accountsRepository.remove(id);
  };

  return {
    accounts: accounts ?? [],
    addAccount,
    updateAccount,
    removeAccount,
    isLoading: accounts === undefined,
  };
}
