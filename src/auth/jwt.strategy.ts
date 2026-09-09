import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    // This object becomes req.user
    // return {
    //   userId: payload.userId,
    //   companyId: payload.companyId,
    //   role: payload.role,
    // };

    return {
      userId: payload.userId,
      userName: payload.userName,
      companyId: payload.companyId,
      companyName: payload.companyName,
      role: payload.role,
    };

  }
}
