import { BadRequestException } from '@nestjs/common';

export function text(
  value: unknown,
  field: string,
  options: { required?: boolean; max?: number } = {},
): string {
  if (typeof value !== 'string') {
    if (options.required) throw new BadRequestException(`${field} is required`);
    return '';
  }
  const cleaned = value.replace(/[\u0000-\u001F\u007F]/g, '').trim();
  if (options.required && !cleaned) {
    throw new BadRequestException(`${field} is required`);
  }
  if (options.max && cleaned.length > options.max) {
    throw new BadRequestException(`${field} must be ${options.max} characters or fewer`);
  }
  return cleaned;
}

export function email(value: unknown): string {
  const cleaned = text(value, 'Email', { required: true, max: 254 }).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleaned)) {
    throw new BadRequestException('Email is invalid');
  }
  return cleaned;
}

export function decimal(
  value: unknown,
  field: string,
  options: { min?: number; max?: number; required?: boolean } = {},
): number {
  const number = typeof value === 'number' || typeof value === 'string'
    ? Number(value)
    : NaN;
  if (!Number.isFinite(number) && options.required !== false) {
    throw new BadRequestException(`${field} must be a valid number`);
  }
  if (!Number.isFinite(number)) return 0;
  if (options.min !== undefined && number < options.min) {
    throw new BadRequestException(`${field} must be at least ${options.min}`);
  }
  if (options.max !== undefined && number > options.max) {
    throw new BadRequestException(`${field} must be at most ${options.max}`);
  }
  return number;
}

export function date(value: unknown, field: string, required = true): Date | null {
  const raw = text(value, field, { required });
  if (!raw) return null;
  const parsed = new Date(`${raw}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) {
    throw new BadRequestException(`${field} is invalid`);
  }
  return parsed;
}
