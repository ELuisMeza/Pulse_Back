import { Injectable } from '@nestjs/common';
import path from 'path';
import * as fs from 'fs';
import { v4 as uuid } from 'uuid';
import { Message } from './dto/message.dto';
import { UserService } from 'src/user/user.service';
import { WskService } from 'src/wsk/wsk.service';

@Injectable()
export class MessageService {

    private readonly dbPath = path.resolve(__dirname, '../../db/general.json');

    constructor(
      private readonly usersService: UserService,
      private readonly wskService: WskService,
    ) {
      if (!fs.existsSync(this.dbPath)) {
        fs.writeFileSync(this.dbPath, JSON.stringify([], null, 2));
      }
    }

    private readMessages(): Message[] {
      const data = fs.readFileSync(this.dbPath, 'utf8');
      return JSON.parse(data);
    }
    
    private writeMessages(message: Message[]): void {
      fs.writeFileSync(this.dbPath, JSON.stringify(message, null, 2));
    }
    
    async sendMessage(content: string, senderId: string, channelId: string): Promise<Message[]> {
      const messages = this.readMessages();

      const sender = await this.usersService.getById(senderId);

      const newmessage: Message = {
        id: uuid(),
        content,
        senderId,
        senderName: sender.name, 
        timestamp: new Date(),
        channelId,
        channelName: 'Placeholder Channel',
      };

      messages.push(newmessage);
      this.writeMessages(messages);

      await this.wskService.notifyRoom({ roomId: channelId, message: content, userId: senderId });

      return messages;
    }

    async sendMessageGeneral(content: string, senderId: string): Promise<Message[]> {
      const messages = this.readMessages();

      const sender = await this.usersService.getById(senderId);

      const newmessage: Message = {
        id: uuid(),
        content,
        senderId,
        senderName: sender.name, 
        timestamp: new Date(),
        channelId: 'general',
        channelName: 'Placeholder Channel',
      };

      messages.push(newmessage);
      this.writeMessages(messages);

      await this.wskService.notifyAll({ message: content, userId: senderId });

      return messages;
    }
}
