import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as jwt from 'jsonwebtoken';
import { IS_PUBLIC_KEY } from './public.decorator';

type RemoteJwkSet = Awaited<ReturnType<typeof import('jose').createRemoteJWKSet>>;

const jwksByUrl = new Map<string, RemoteJwkSet>();

@Injectable()
export class SupabaseJwtGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{
      headers?: { authorization?: string };
      user?: { sub: string };
    }>();
    const header = request.headers?.authorization?.trim();
    if (!header || !header.toLowerCase().startsWith('bearer ')) {
      throw new UnauthorizedException('Bearer token richiesto');
    }
    const token = header.slice(7).trim();
    if (!token) {
      throw new UnauthorizedException('Bearer token vuoto');
    }

    await this.verifyToken(token, request);
    return true;
  }

  private async getOrCreateJwks(jwksUrl: string): Promise<RemoteJwkSet> {
    let jwks = jwksByUrl.get(jwksUrl);
    if (!jwks) {
      const { createRemoteJWKSet } = await import('jose');
      jwks = createRemoteJWKSet(new URL(jwksUrl));
      jwksByUrl.set(jwksUrl, jwks);
    }
    return jwks;
  }

  private async verifyToken(
    token: string,
    request: { headers?: { authorization?: string }; user?: { sub: string } },
  ): Promise<void> {
    const parts = jwt.decode(token, { complete: true });
    if (!parts || typeof parts === 'string') {
      throw new UnauthorizedException('Token non valido');
    }

    const alg = parts.header.alg;

    if (alg === 'HS256') {
      const secret = process.env.SUPABASE_JWT_SECRET?.trim();
      if (!secret) {
        throw new UnauthorizedException('Autenticazione non configurata lato server (SUPABASE_JWT_SECRET)');
      }
      try {
        const decoded = jwt.verify(token, secret, { algorithms: ['HS256'] });
        if (typeof decoded === 'string' || !decoded.sub || typeof decoded.sub !== 'string') {
          throw new UnauthorizedException('Token non valido');
        }
        request.user = { sub: decoded.sub };
      } catch (error) {
        if (error instanceof UnauthorizedException) {
          throw error;
        }
        throw new UnauthorizedException('Token non valido o scaduto');
      }
      return;
    }

    if (alg === 'ES256' || alg === 'RS256') {
      const base = process.env.SUPABASE_URL?.trim().replace(/\/$/, '');
      if (!base) {
        throw new UnauthorizedException(
          'SUPABASE_URL richiesto per token firmati con chiave asimmetrica (JWKS). Allinea la stessa URL del progetto usata dal frontend.',
        );
      }
      const jwksUrl = `${base}/auth/v1/.well-known/jwks.json`;
      const issuer = process.env.SUPABASE_JWT_ISSUER?.trim() || `${base}/auth/v1`;
      const JWKS = await this.getOrCreateJwks(jwksUrl);
      try {
        const { jwtVerify } = await import('jose');
        const { payload } = await jwtVerify(token, JWKS, { issuer });
        if (!payload.sub || typeof payload.sub !== 'string') {
          throw new UnauthorizedException('Token non valido');
        }
        request.user = { sub: payload.sub };
      } catch (error) {
        if (error instanceof UnauthorizedException) {
          throw error;
        }
        throw new UnauthorizedException('Token non valido o scaduto');
      }
      return;
    }

    throw new UnauthorizedException(`Algoritmo JWT non supportato: ${String(alg)}`);
  }
}
