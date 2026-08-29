import type { BaseEntity } from "@/lib/architecture/db";

export interface DocumentEntity extends BaseEntity {
  title: string;
  file_name: string;
  file_type: string;
  file_data: string;
}
