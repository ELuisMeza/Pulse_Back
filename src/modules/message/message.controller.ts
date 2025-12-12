import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/message.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';

@Controller('message')
// @UseGuards(JwtAuthGuard)
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post('send')
  async sendMessage(@Body() body: CreateMessageDto) {
    return this.messageService.createMessage(body);
  }

  @Get('by-channel/:channelId/:page/:limit')
  async getMessagesByChannel(@Param() {channelId: channelId, page: page, limit: limit}) {
    return this.messageService.getMessagesByChannel(channelId, page, limit);
  }
}
