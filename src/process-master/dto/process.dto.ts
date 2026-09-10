export class CreateProcessDto {
  category_id: string;
  name: string;
  process_code: string;
  description?: string;
  process_family: string;
  process_type: string;
  display_order?: number;
}

export class UpdateProcessDto {
  name?: string;
  description?: string;
  process_family?: string;
  process_type?: string;
  is_active?: boolean;
  display_order?: number;
}

export class DuplicateProcessDto {
  new_name: string;
  new_process_code: string;
}

export class ReorderProcessesDto {
  processes: Array<{
    id: string;
    display_order: number;
  }>;
}
