import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Channel } from './channel.entity';
import { Repository } from 'typeorm';
import { ChannelsUsers } from '../entity/channels_users.entity';
import { EnumRecordsType } from 'src/globals/enums/records_type.enum';
import { CreateChannel } from './dto/channel.dto';
import { UserService } from '../user/user.service';

@Injectable()
export class ChannelService {

  constructor(
    @InjectRepository(Channel)
    private readonly channelRepository: Repository<Channel>,
    @InjectRepository(ChannelsUsers)
    private readonly channelsUsersRepository: Repository<ChannelsUsers>,
    private readonly userService: UserService,
  ) {}

  async getAllGlobalChannels() {
     const channels = await this.channelsUsersRepository
      .createQueryBuilder('cu')
      .leftJoin('channels', 'c', 'cu.channel_id = c.id') 
      .leftJoin('channels_users', 'cu2', 'cu2.channel_id = c.id AND cu2.state = :activeState', { activeState: EnumRecordsType.ACTIVE })
      .leftJoin('users', 'u', 'u.id = c.user_creator')
      .select([
        'c.*',
        'u.name as user_creator',
        'COUNT(cu2.user_id) AS total_members'
      ])
      .where('cu.state = :state', { state: EnumRecordsType.ACTIVE })
      .andWhere('c.is_global = :isGlobal', { isGlobal: true })
      .groupBy('c.id')
      .addGroupBy('c.name')
      .addGroupBy('u.name')
      .getRawMany();
  
    return channels;
  }

  async getAllChannelsByUser(userId: string) {
    const channels = await this.channelsUsersRepository
      .createQueryBuilder('cu')
      .leftJoin('channels', 'c', 'cu.channel_id = c.id') 
      .leftJoin('channels_users', 'cu2', 'cu2.channel_id = c.id AND cu2.state = :activeState', { activeState: EnumRecordsType.ACTIVE })
      .leftJoin('users', 'u', 'u.id = c.user_creator')
      .select([
        'c.*',
        'u.name as user_creator',
        'COUNT(cu2.user_id) AS total_members'
      ])
      .where('cu.user_id = :userId', { userId })
      .andWhere('cu.state = :state', { state: EnumRecordsType.ACTIVE })
      .andWhere('c.is_global = :isGlobal', { isGlobal: false })
      .groupBy('c.id')
      .addGroupBy('c.name')
      .addGroupBy('u.name')
      .getRawMany();
  
    return channels;
  }

  async getChannelByUserCreator(userId: string) {
    const channels = await this.channelRepository.find({ where: { user: { id: userId } } });
    return channels;
  }

  async createChannel(channel: CreateChannel, userId: string) {
    const user = await this.userService.getById(userId);

    const payload: Partial<Channel> = {
      name: channel.name,
      user: user,
      state: EnumRecordsType.ACTIVE
    }

    const newChannel = this.channelRepository.create(payload);

    const savedChannel = await this.channelRepository.save(newChannel);

    await this.addUserToChannel(savedChannel.id, userId);

    return savedChannel;
  }

  async addUserToChannel(channelId: string, userId: string) {

    const oldJoin = await this.channelsUsersRepository.findOne({ where: { channel_id: channelId, user_id: userId } });
   
    if (oldJoin) {
      throw new ConflictException('User already joined to channel');
    }

    const channel = await this.getChannelById(channelId);

    const user = await this.userService.getById(userId);

    const payload: Partial<ChannelsUsers> = {
      channel: channel,
      user: user,
      state: EnumRecordsType.ACTIVE
    }

    const newChannelsUsers = this.channelsUsersRepository.create(payload);

    return this.channelsUsersRepository.save(newChannelsUsers);
  }

  async leaveChannel(channelId: string, userId: string) {
    const channel = await this.getChannelByIdAndUserId(channelId, userId);

    channel.state = EnumRecordsType.INACTIVE;
    return this.channelsUsersRepository.save(channel);
  }

  async getChannelById(channelId: string) {
    const channel = await this.channelRepository.findOne({ where: { id: channelId, state: EnumRecordsType.ACTIVE } });
    if (!channel) {
      throw new NotFoundException('Channel not found');
    }
    return channel;
  }

  async getChannelByIdAndUserId(channelId: string, userId: string) {
    const channel = await this.channelsUsersRepository.findOne({ where: { channel_id: channelId, user_id: userId, state: EnumRecordsType.ACTIVE } });
    if (!channel) {
      throw new NotFoundException('Channel not found');
    }
    return channel;
  }


}
