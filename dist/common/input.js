"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.text = text;
exports.email = email;
exports.decimal = decimal;
exports.date = date;
const common_1 = require("@nestjs/common");
function text(value, field, options = {}) {
    if (typeof value !== 'string') {
        if (options.required)
            throw new common_1.BadRequestException(`${field} is required`);
        return '';
    }
    const cleaned = value.replace(/[\u0000-\u001F\u007F]/g, '').trim();
    if (options.required && !cleaned) {
        throw new common_1.BadRequestException(`${field} is required`);
    }
    if (options.max && cleaned.length > options.max) {
        throw new common_1.BadRequestException(`${field} must be ${options.max} characters or fewer`);
    }
    return cleaned;
}
function email(value) {
    const cleaned = text(value, 'Email', { required: true, max: 254 }).toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleaned)) {
        throw new common_1.BadRequestException('Email is invalid');
    }
    return cleaned;
}
function decimal(value, field, options = {}) {
    const number = typeof value === 'number' || typeof value === 'string'
        ? Number(value)
        : NaN;
    if (!Number.isFinite(number) && options.required !== false) {
        throw new common_1.BadRequestException(`${field} must be a valid number`);
    }
    if (!Number.isFinite(number))
        return 0;
    if (options.min !== undefined && number < options.min) {
        throw new common_1.BadRequestException(`${field} must be at least ${options.min}`);
    }
    if (options.max !== undefined && number > options.max) {
        throw new common_1.BadRequestException(`${field} must be at most ${options.max}`);
    }
    return number;
}
function date(value, field, required = true) {
    const raw = text(value, field, { required });
    if (!raw)
        return null;
    const parsed = new Date(`${raw}T00:00:00.000Z`);
    if (Number.isNaN(parsed.getTime())) {
        throw new common_1.BadRequestException(`${field} is invalid`);
    }
    return parsed;
}
//# sourceMappingURL=input.js.map