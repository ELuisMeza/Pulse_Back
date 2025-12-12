import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ChannelService } from './channel.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AddUserToChannel, CreateChannel, LeaveUserToChannel } from './dto/channel.dto';

@Controller('channel')
@UseGuards(JwtAuthGuard)
export class ChannelController {
  constructor(private readonly channelService: ChannelService) {}

  @Get('globals')
  async getAllGlobalChannels() {
    return this.channelService.getAllGlobalChannels()
  }

  @Get('by-user/:userId')
  async getAllChannelsByUser(
    @Param(){userId: userId}
  ){
    return this.channelService.getAllChannelsByUser(userId)
  }

  @Get('by-user-creator/:userId')
  async getChannelByUserCreator(
    @Param() {userId: userId}
  ){
    return this.channelService.getChannelByUserCreator(userId)
  }

  @Post('create')
  async createChannel(
    @Body() channel: CreateChannel,
    @Req() req: { user: { userId: string } }
  ){
    return this.channelService.createChannel(channel, req.user.userId)
  }

  @Post('add-to-channel')
  async addUserToChannel(
    @Body() body: AddUserToChannel,
    @Req() req: { user: { userId: string } }
  ){
    return this.channelService.addUserToChannel(body.channelId, req.user.userId)
  }

  @Post('leave-to-channel')
  async leaveChannel(
    @Body() body: LeaveUserToChannel
  ){
    return this.channelService.leaveChannel(body.channelId, body.userId)
  }
}
