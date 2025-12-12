import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const client: Socket = context.switchToWs().getClient<Socket>();
      const token = this.extractTokenFromHandshake(client);

      if (!token) {
        throw new WsException('Token no proporcionado');
      }

      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET || 'superSecretKey',
      });

      // Adjuntamos el payload al socket para usarlo en los handlers
      client.data.user = payload;
      return true;
    } catch (error) {
      throw new WsException('Token inválido o expirado');
    }
  }

  private extractTokenFromHandshake(client: Socket): string | undefined {
    // Intenta extraer el token desde:
    // 1. Auth header (Authorization: Bearer TOKEN)
    const authHeader = client.handshake?.headers?.authorization;
    if (authHeader) {
      const [type, token] = authHeader.split(' ');
      return type === 'Bearer' ? token : undefined;
    }

    // 2. Query parameter (?token=TOKEN)
    const tokenFromQuery = client.handshake?.query?.token;
    if (tokenFromQuery && typeof tokenFromQuery === 'string') {
      return tokenFromQuery;
    }

    // 3. Auth object (usado por algunos clientes)
    const tokenFromAuth = client.handshake?.auth?.token;
    if (tokenFromAuth && typeof tokenFromAuth === 'string') {
      return tokenFromAuth;
    }

    return undefined;
  }
}

