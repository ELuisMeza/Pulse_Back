import { Injectable } from '@nestjs/common';
import { WskGateway } from './wsk.gateway';
import { MessageDto } from 'src/modules/message/dto/message.dto';
import { ChannelDto } from 'src/modules/channel/dto/channel.dto';

@Injectable()
export class WskService {
  constructor(private readonly wsGateway: WskGateway) {}

  // Notifica a todos los usuarios de una sala
  notifyRoomNewMessage(roomId: string, payload: MessageDto) {
    this.wsGateway.notifyRoomMessage(roomId, payload);
  }

  // Notifica a todos los usuarios de una sala algun cambio en la sala
  notifyRoomUpdate(roomId: string, payload: ChannelDto) {
    this.wsGateway.notifyRoomUpdate(roomId, payload);
  }

}
