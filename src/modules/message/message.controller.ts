import { Body, Controller, Get, Post } from '@nestjs/common';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/message.dto';

@Controller('message')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  // @Post('send-general')
  // async sendMessageGeneral(@Body() body: CreateMessageDto) {
  //   return this.messageService.sendMessageGeneral(body.content, body.senderId, body.channelId);
  // }

  // @Get('general')
  // async getGeneralMessages() {
  //   return this.messageService.getGeneralMessages();
  // }
}
