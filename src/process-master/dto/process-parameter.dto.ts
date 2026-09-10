import { ParameterDataType } from '../entities/process-parameter.entity';

export class CreateProcessParameterDto {
  process_id: string;
  parameter_code: string;
  parameter_name: string;
  data_type: ParameterDataType;
  unit?: string | null;
  is_required?: boolean;
  display_order?: number;
  default_value?: string | null;
  min_value?: number | null;
  max_value?: number | null;
  allowed_values?: string[] | null;
  help_text?: string | null;
}

export class UpdateProcessParameterDto {
  parameter_name?: string;
  data_type?: ParameterDataType;
  unit?: string | null;
  is_required?: boolean;
  display_order?: number;
  default_value?: string | null;
  min_value?: number | null;
  max_value?: number | null;
  allowed_values?: string[] | null;
  help_text?: string | null;
}

export class ReorderProcessParametersDto {
  parameters: Array<{
    id: string;
    display_order: number;
  }>;
}
