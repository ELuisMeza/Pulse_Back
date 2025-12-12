import { Injectable } from '@nestjs/common';
import { WskService } from 'src/wsk/wsk.service';
import { UserService } from '../user/user.service';
import { Message } from './message.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateMessageDto } from './dto/message.dto';
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

  async createMessage(message: CreateMessageDto) {
    const user = await this.usersService.getById(message.senderId);
    
    const channel = await this.channelsService.getChannelById(message.channelId);

    const payload: Partial<Message> = {
      content: message.content,
      user,
      channel,
    };  

    const newMessage = this.messageRepository.create({
      ...payload,
    });

    return this.messageRepository.save(newMessage);
  }

  async getMessagesByChannel(channelId: string, page: number, limit: number) {
    return this.messageRepository.find({ where: { channel: { id: channelId } }, skip: (page - 1) * limit, take: limit, relations: ['user', 'channel'] });
  }

}
