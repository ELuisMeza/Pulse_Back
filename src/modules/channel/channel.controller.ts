import { Controller, Get, Param } from '@nestjs/common';
import { ChannelService } from './channel.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('channel')
export class ChannelController {
  constructor(private readonly channelService: ChannelService) {}

  @Get('by-user/:userId')
  async getAllChannelsByUser(
    @Param(){userId: userId}
  ){
    return this.channelService.getAllChannelsByUser(userId)
  }
}
