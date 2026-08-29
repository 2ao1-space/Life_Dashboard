import { CollectionRepository } from "../architecture/CollectionRepository";
import { db } from "../architecture/db";
import { TaskEntity } from "@/types/habits";

export const tasksRepository = new CollectionRepository<TaskEntity>(
  db.tasks,
  "tasks",
);
