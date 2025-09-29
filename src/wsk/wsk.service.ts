import { Injectable } from '@nestjs/common';
import { WskGateway } from './wsk.gateway';

@Injectable()
export class WskService {
  constructor(private readonly wsGateway: WskGateway) {}

  // Notifica a todos los usuarios de una sala
  notifyRoom(payload: { roomId: string; message: string; userId: string }) {
    this.wsGateway.notifyNewMessage(payload);
  }

  // Notifica a todos los usuarios generales
  notifyAll(payload: { message: string; userId: string }) {
    this.wsGateway.notifyNewMessageGeneral(payload);
  }
}
