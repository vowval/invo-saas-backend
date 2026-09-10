export class CreateProcessCategoryDto {
  name: string;
  code: string;
  description?: string;
  display_order?: number;
}

export class UpdateProcessCategoryDto {
  name?: string;
  description?: string;
  is_active?: boolean;
  display_order?: number;
}

export class ReorderCategoriesDto {
  categories: Array<{
    id: string;
    display_order: number;
  }>;
}
