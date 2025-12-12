import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    
    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    
    if (err || !user) {
      throw err || new UnauthorizedException('Token inválido o no proporcionado');
    }
    return user;
  }
}
