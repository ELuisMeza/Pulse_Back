import { Injectable } from '@nestjs/common';
import { WskGateway } from './wsk.gateway';
import { MessageDto } from 'src/modules/message/dto/message.dto';

@Injectable()
export class WskService {
  constructor(private readonly wsGateway: WskGateway) {}

  // Notifica a todos los usuarios de una sala
  notifyRoom(roomId: string, payload: MessageDto) {
    this.wsGateway.notifyRoomMessage(roomId, payload);
  }

}
