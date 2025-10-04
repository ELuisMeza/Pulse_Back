import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Channel } from './channel.entity';
import { Repository } from 'typeorm';
import { ChannelsUsers } from '../entity/channels_users.entity';
import { EnumRecordsType } from 'src/globals/enums/records_type.enum';
import { ChannelDetails } from './dto/channel.dto';

@Injectable()
export class ChannelService {

  constructor(
    @InjectRepository(Channel)
    private readonly channelRepository: Repository<Channel>,
    @InjectRepository(ChannelsUsers)
    private readonly channelsUsersRepository: Repository<ChannelsUsers>,
  ) {}

  async getAllChannelsByUser(userId: string) {
    const channels = await this.channelsUsersRepository
      .createQueryBuilder('cu')
      .leftJoin('channels', 'c', 'cu.channel_id = c.id') 
      .leftJoin('channels_users', 'cu2', 'cu2.channel_id = c.id') 
      .leftJoin('users', 'u', 'u.id = c.user_creator')
      .select([
        'c.*',
        'u.name as user_creator',
        'COUNT(cu2.user_id) AS total_members'
      ])
      .where('cu.user_id = :userId', { userId })
      .andWhere('cu.state = :state', { state: EnumRecordsType.ACTIVE })
      .groupBy('c.id')
      .addGroupBy('c.name')
      .addGroupBy('u.name')
      .getRawMany();
  
    return channels;
  }



}
