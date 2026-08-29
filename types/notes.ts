import type { BaseEntity } from "@/lib/architecture/db";

export type NoteType = "text" | "todo" | "image" | "drawing";

export interface TodoItem {
  id: string;
  text: string;
  done: boolean;
}

export interface NoteEntity extends BaseEntity {
  type: NoteType;
  title: string;
  category_name: string;
  category_color: string;
  is_pinned: boolean;
  order: number;

  body: string | null;

  todo_items: TodoItem[] | null;

  image_data: string | null;
  caption: string | null;

  drawing_data: string | null;
}
