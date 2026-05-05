import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';

export const JwtSub = createParamDecorator((_data: unknown, ctx: ExecutionContext): string => {
  const request = ctx.switchToHttp().getRequest<{ user?: { sub: string } }>();
  const sub = request.user?.sub;
  if (!sub) {
    throw new UnauthorizedException('Sessione non valida');
  }
  return sub;
});
