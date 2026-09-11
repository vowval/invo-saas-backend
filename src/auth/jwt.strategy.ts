import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

/**
 * Extracts the "token" cookie value directly from the raw Cookie header.
 * Avoids depending on cookie-parser middleware (and the extra npm package)
 * so this strategy has no external dependency beyond what's already used.
 */
function extractTokenFromCookieHeader(req: Request): string | null {
  const cookieHeader = req.headers?.cookie;
  if (!cookieHeader) return null;
  const match = cookieHeader
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith('token='));
  if (!match) return null;
  const value = match.slice('token='.length);
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        // Primary: Authorization header (Bearer token)
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        // Fallback: httpOnly cookie set by the login endpoint
        extractTokenFromCookieHeader,
      ]),
      ignoreExpiration: false,
      secretOrKey: config.get('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    return {
      // `id` is kept as an alias of `userId` because many controllers across
      // the codebase read `req.user.id` while others read `req.user.userId`.
      // Providing both avoids silently-undefined actor IDs (which broke
      // admin/staff scoped actions such as user creation/deletion).
      id: payload.userId,
      userId: payload.userId,
      userName: payload.userName,
      companyId: payload.companyId,
      companyName: payload.companyName,
      role: payload.role,
    };
  }
}
