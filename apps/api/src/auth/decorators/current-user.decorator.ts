import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from '../dto/auth.dto';

/**
 * Extract the current user from the request (set by JwtAuthGuard).
 *
 * @example
 * ```ts
 * @Get('profile')
 * getProfile(@CurrentUser() user: JwtPayload) {
 *   return user;
 * }
 *
 * // Extract specific field
 * @Get('profile')
 * getProfile(@CurrentUser('sub') userId: string) {
 *   return userId;
 * }
 * ```
 */
export const CurrentUser = createParamDecorator(
  (data: keyof JwtPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as JwtPayload;

    if (data) {
      return user?.[data];
    }

    return user;
  },
);
