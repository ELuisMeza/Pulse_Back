import { Injectable } from '@nestjs/common';
import path from 'path';
import * as fs from 'fs';
import { v4 as uuid } from 'uuid';
import { Message } from './dto/message.dto';
import { WskService } from 'src/wsk/wsk.service';

@Injectable()
export class MessageService {

    // private readonly dbPathGeneral = path.resolve(__dirname, '../../db/general.json');

    // constructor(
    //   private readonly usersService: UserService,
    //   private readonly wskService: WskService,
    // ) {
    //   if (!fs.existsSync(this.dbPathGeneral)) {
    //     fs.writeFileSync(this.dbPathGeneral, JSON.stringify([], null, 2));
    //   }
    // }

    // private readMessagesGeneral(): Message[] {
    //   const data = fs.readFileSync(this.dbPathGeneral, 'utf8');
    //   return JSON.parse(data);
    // }
    
    // private writeMessagesGeneral(message: Message[]): void {
    //   fs.writeFileSync(this.dbPathGeneral, JSON.stringify(message, null, 2));
    // }
    
    // async sendMessage(content: string, senderId: string, channelId: string): Promise<Message[]> {
    //   const messages = this.readMessagesGeneral();

    //   const sender = await this.usersService.getById(senderId);

    //   const newmessage: Message = {
    //     id: uuid(),
    //     content,
    //     senderId,
    //     senderName: sender.name, 
    //     timestamp: new Date(),
    //     channelId,
    //     channelName: 'Placeholder Channel',
    //   };

    //   messages.push(newmessage);
    //   this.writeMessagesGeneral(messages);

    //   this.wskService.notifyRoom({ roomId: channelId, message: content, userId: senderId });

    //   return messages;
    // }

    // async sendMessageGeneral(content: string, senderId: string, channelId: string): Promise<Message[]> {
    //   const messages = this.readMessagesGeneral();

    //   const sender = await this.usersService.getById(senderId);

    //   const newmessage: Message = {
    //     id: uuid(),
    //     content,
    //     senderId,
    //     senderName: sender.name, 
    //     timestamp: new Date(),
    //     channelId: 'general',
    //     channelName: 'Placeholder Channel',
    //   };

    //   messages.push(newmessage);
    //   this.writeMessagesGeneral(messages);

    //   this.wskService.notifyAll({ message: content, userId: senderId });

    //   return messages;
    // }

    // async getGeneralMessages(): Promise<Message[]> {
    //   const messages = this.readMessagesGeneral();
    //   return messages
    // }
}
