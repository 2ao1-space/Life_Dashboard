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
      icon: "account-cash",
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

  const defaultAccountId =
    accounts?.find((account) => account.is_default)?.id ??
    accounts?.find((account) => account.name === "كاش")?.id ??
    accounts?.[0]?.id ??
    "";

  const addAccount = (data: { name: string; icon: string }) => {
    if (!userId) return;
    const willBeFirst = !accounts || accounts.length === 0;
    accountsRepository.create(userId, {
      name: data.name,
      icon: data.icon,
      balance: 0,
      is_default: willBeFirst,
      order: accounts?.length ?? 0,
    });
  };

  const updateAccount = (id: string, changes: Partial<AccountEntity>) => {
    accountsRepository.update(id, changes);
  };

  const setDefaultAccount = (id: string) => {
    if (!userId || !accounts) return;
    accounts.forEach((account) => {
      accountsRepository.update(account.id, {
        is_default: account.id === id,
      });
    });
  };

  const removeAccount = (id: string) => {
    accountsRepository.remove(id);
  };

  return {
    accounts: accounts ?? [],
    defaultAccountId,
    addAccount,
    updateAccount,
    setDefaultAccount,
    removeAccount,
    isLoading: accounts === undefined,
  };
}
