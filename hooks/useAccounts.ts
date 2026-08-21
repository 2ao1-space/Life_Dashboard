"use client";

import { useEffect, useState } from "react";

import { useLiveQuery } from "dexie-react-hooks";

import { getCurrentUserId } from "@/lib/supabase/auth";

import { accountsRepository } from "@/lib/repositories/accountsRepository";

import type { AccountEntity } from "@/types/settings";

export function useAccounts() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    getCurrentUserId().then(setUserId);
  }, []);

  const accounts = useLiveQuery(async () => {
    if (!userId) return undefined;

    const existing = await accountsRepository.getAll(userId);

    return existing.sort((a, b) => a.order - b.order);
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    const initializeAccounts = async () => {
      const existing = await accountsRepository.getAll(userId);

      if (existing.length === 0) {
        await accountsRepository.create(userId, {
          name: "كاش",
          icon: "💵",
          balance: 0,
          is_default: true,
          order: 0,
        });
      }
    };

    initializeAccounts();
  }, [userId]);

  const addAccount = async (data: { name: string; icon: string }) => {
    if (!userId) return;

    await accountsRepository.create(userId, {
      name: data.name,
      icon: data.icon,
      balance: 0,
      is_default: false,
      order: accounts?.length ?? 0,
    });
  };

  const updateAccount = async (id: string, changes: Partial<AccountEntity>) => {
    await accountsRepository.update(id, changes);
  };

  const removeAccount = async (id: string) => {
    await accountsRepository.remove(id);
  };

  return {
    accounts: accounts ?? [],
    addAccount,
    updateAccount,
    removeAccount,
    isLoading: accounts === undefined,
  };
}

// "use client";

// import { useEffect, useState } from "react";
// import { useLiveQuery } from "dexie-react-hooks";
// import { getCurrentUserId } from "@/lib/supabase/auth";
// import { accountsRepository } from "@/lib/repositories/accountsRepository";
// import type { AccountEntity } from "@/types/settings";

// export function useAccounts() {
//   const [userId, setUserId] = useState<string | null>(null);

//   useEffect(() => {
//     getCurrentUserId().then(setUserId);
//   }, []);

//   const accounts = useLiveQuery(async () => {
//     if (!userId) return undefined;
//     const existing = await accountsRepository.getAll(userId);
//     if (existing.length > 0) {
//       return existing.sort((a, b) => a.order - b.order);
//     }

//     await accountsRepository.create(userId, {
//       name: "كاش",
//       icon: "💵",
//       balance: 0,
//       is_default: true,
//       order: 0,
//     });
//     return accountsRepository.getAll(userId);
//   }, [userId]);

//   const addAccount = (data: { name: string; icon: string }) => {
//     if (!userId) return;
//     accountsRepository.create(userId, {
//       name: data.name,
//       icon: data.icon,
//       balance: 0,
//       is_default: false,
//       order: accounts?.length ?? 0,
//     });
//   };

//   const updateAccount = (id: string, changes: Partial<AccountEntity>) => {
//     accountsRepository.update(id, changes);
//   };

//   const removeAccount = (id: string) => {
//     accountsRepository.remove(id);
//   };

//   return {
//     accounts: accounts ?? [],
//     addAccount,
//     updateAccount,
//     removeAccount,
//     isLoading: accounts === undefined,
//   };
// }
