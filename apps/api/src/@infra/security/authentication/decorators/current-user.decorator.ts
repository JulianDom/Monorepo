import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedActor } from '@shared/types';

/**
 * @CurrentUser()
 *
 * Decorador para obtener el usuario/admin autenticado actual.
 *
 * @example
 * @Get('profile')
 * getProfile(@CurrentUser() user: AuthenticatedActor) {
 *   return user;
 * }
 *
 * @example
 * @Get('id')
 * getId(@CurrentUser('id') userId: string) {
 *   return userId;
 * }
 */
export const CurrentUser = createParamDecorator(
  (data: keyof AuthenticatedActor | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as AuthenticatedActor;

    if (!user) {
      return null;
    }

    return data ? user[data] : user;
  },
);
