import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../enums/role.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    console.log('====================================');
    console.log(request);
    console.log('====================================');
    const user = request.user;

    if (!user || !user.role) {
      console.log('No user or role found:', user);
      return false;
    }

    const hasRole = requiredRoles.some((role) => user.role === role);
    console.log('User role check:', {
      userRole: user.role,
      requiredRoles,
      hasRole,
    });

    return hasRole;
  }
}
