import { Injectable } from '@nestjs/common';
import { WskService } from '../../wsk/wsk.service';
import { UserService } from '../user/user.service';
import { Message } from './message.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateMessageDto, MessageDto } from './dto/message.dto';
import { ChannelService } from '../channel/channel.service';

@Injectable()
export class MessageService {

    constructor(
      @InjectRepository(Message)
      private readonly messageRepository: Repository<Message>,
      private readonly usersService: UserService,
      private readonly wskService: WskService,
      private readonly channelsService: ChannelService,
    ) {}

  async createMessage(message: CreateMessageDto, senderId: string): Promise<MessageDto> {
    const user = await this.usersService.getById(senderId);

    const channel = await this.channelsService.getChannelById(message.channelId);

    const payload: Partial<Message> = {
      content: message.content,
      user,
      channel,
    };  

    const newMessage = this.messageRepository.create({
      ...payload,
    });

    const savedMessage = await this.messageRepository.save(newMessage);
    const messagePayload: MessageDto = {
      id: savedMessage.id,
      content: savedMessage.content,
      senderId: savedMessage.user.id,
      senderName: savedMessage.user.name,
      timestamp: savedMessage.createdAt
    };

    this.wskService.notifyRoomNewMessage(channel.id, messagePayload)

    return messagePayload;
  }

  async getMessagesByChannel(channelId: string, page: number, limit: number): Promise<MessageDto[]> {
    const messages = await this.messageRepository.find({ where: { channel: { id: channelId } }, skip: (page - 1) * limit, take: limit, relations: ['user', 'channel'] });
    return messages.map(msg => ({
      id: msg.id,
      content: msg.content,
      senderId: msg.user.id,
      senderName: msg.user.name,
      timestamp: msg.createdAt
    }));
  }

}
