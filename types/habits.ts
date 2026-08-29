import type { BaseEntity } from "@/lib/architecture/db";

export interface HabitEntity extends BaseEntity {
  name: string;
  order: number;
}

export interface HabitLogEntity extends BaseEntity {
  habit_id: string;
  date: string;
  done: boolean;
}

export interface TaskEntity extends BaseEntity {
  date: string;
  text: string;
  done: boolean;
  order: number;
}

export interface MoodEntity extends BaseEntity {
  date: string;
  mood: number;
}
