"use client";

import { useQuery } from "@tanstack/react-query";

import { useProfile } from "./useProfile";
import { toDateKey } from "@/lib/constants/date";

const CAIRO_FALLBACK = {
  lat: 30.0444,
  lng: 31.2357,
};

interface PrayerTimes {
  fajr: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
}

export function formatPrayerTime(time: string) {
  const [hours, minutes] = time.split(":").map(Number);

  const date = new Date();
  date.setHours(hours, minutes, 0, 0);

  return new Intl.DateTimeFormat("ar-EG", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

export function usePrayerTimes(date: Date = new Date()) {
  const { profile } = useProfile();

  const lat = profile?.location_lat ?? CAIRO_FALLBACK.lat;
  const lng = profile?.location_lng ?? CAIRO_FALLBACK.lng;

  const dateKey = toDateKey(date);

  return useQuery({
    queryKey: ["prayer-times", dateKey, lat, lng],

    enabled: Boolean(profile),

    staleTime: 1000 * 60 * 60,

    queryFn: async (): Promise<PrayerTimes> => {
      const day = date.getDate();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();

      const url =
        `https://api.aladhan.com/v1/timings/` +
        `${day}-${month}-${year}` +
        `?latitude=${lat}` +
        `&longitude=${lng}` +
        `&method=5`;

      const res = await fetch(url);

      if (!res.ok) {
        throw new Error("فشل جلب مواقيت الصلاة");
      }

      const json = await res.json();

      const t = json.data.timings;

      return {
        fajr: t.Fajr,
        dhuhr: t.Dhuhr,
        asr: t.Asr,
        maghrib: t.Maghrib,
        isha: t.Isha,
      };
    },
  });
}
