import { ConflictException, Inject, Injectable, NotFoundException, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Channel } from './channel.entity';
import { Repository } from 'typeorm';
import { ChannelsUsers } from '../entity/channels_users.entity';
import { EnumRecordsType } from 'src/globals/enums/records_type.enum';
import { ChannelDto, CreateChannel } from './dto/channel.dto';
import { UserService } from '../user/user.service';
import { WskService } from 'src/wsk/wsk.service';

@Injectable()
export class ChannelService {

  constructor(
    @InjectRepository(Channel)
    private readonly channelRepository: Repository<Channel>,
    @InjectRepository(ChannelsUsers)
    private readonly channelsUsersRepository: Repository<ChannelsUsers>,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly wskService: WskService,
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

  async getAllChannels(page: number = 1, limit: number = 10, search: string, creatorId: string, userId: string) {
    const queryBuilder = this.channelRepository
      .createQueryBuilder('c')
      .leftJoin('channels_users', 'cu', 'cu.channel_id = c.id AND cu.state = :activeState', { activeState: EnumRecordsType.ACTIVE })
      .leftJoin('users', 'u', 'u.id = c.user_creator')
      .select([
        'c.*',
        'u.name as user_creator',
        'COUNT(cu.user_id) AS total_members'
      ])
      .where('c.state = :state', { state: EnumRecordsType.ACTIVE })
      .andWhere('c.is_global = :isGlobal', { isGlobal: false });

    // Excluir canales a los que el usuario ya está unido
    if (userId) {
      queryBuilder.andWhere(
        'c.id NOT IN (SELECT cu2.channel_id FROM channels_users cu2 WHERE cu2.user_id = :userId AND cu2.state = :activeState)',
        { userId, activeState: EnumRecordsType.ACTIVE }
      );
    }

    // Filtro por usuario creador
    if (creatorId && creatorId.length > 0) {
      queryBuilder.andWhere('c.user_creator = :creatorId', { creatorId });
    }

    // Filtro de búsqueda por nombre
    if (search && search.length > 0) {
      queryBuilder.andWhere('c.name ILIKE :search', { search: `%${search}%` });
    }

    queryBuilder
      .groupBy('c.id')
      .addGroupBy('c.name')
      .addGroupBy('u.name')
      .orderBy('c.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const channels = await queryBuilder.getRawMany();

    const countQueryBuilder = this.channelRepository
      .createQueryBuilder('c')
      .where('c.state = :state', { state: EnumRecordsType.ACTIVE })
      .andWhere('c.is_global = :isGlobal', { isGlobal: false });

    if (userId) {
      countQueryBuilder.andWhere(
        'c.id NOT IN (SELECT cu2.channel_id FROM channels_users cu2 WHERE cu2.user_id = :userId AND cu2.state = :activeState)',
        { userId, activeState: EnumRecordsType.ACTIVE }
      );
    }

    if (creatorId && creatorId.length > 0) {
      countQueryBuilder.andWhere('c.user_creator = :creatorId', { creatorId });
    }

    if (search && search.length > 0) {
      countQueryBuilder.andWhere('c.name ILIKE :search', { search: `%${search}%` });
    }

    const total = await countQueryBuilder.getCount();

    return {
      data: channels,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    };
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
      .andWhere('c.user_creator != :userId', { userId })
      .andWhere('cu.state = :state', { state: EnumRecordsType.ACTIVE })
      .andWhere('c.is_global = :isGlobal', { isGlobal: false })
      .groupBy('c.id')
      .addGroupBy('c.name')
      .addGroupBy('u.name')
      .getRawMany();
  
    return channels;
  }

  async getChannelByUserCreator(userId: string) {

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
      .where('c.user_creator = :userId', { userId })
      .andWhere('cu.state = :state', { state: EnumRecordsType.ACTIVE })
      .andWhere('c.is_global = :isGlobal', { isGlobal: false })
      .groupBy('c.id')
      .addGroupBy('c.name')
      .addGroupBy('u.name')
      .getRawMany();
  
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

    return {...savedChannel, total_members: 1};
  }

  async addUserToChannel(channelId: string, userId: string) {

    const oldJoin = await this.channelsUsersRepository.findOne({ where: { channel_id: channelId, user_id: userId } });
   
    if (oldJoin?.state === EnumRecordsType.ACTIVE) {
      throw new ConflictException('User already joined to channel');
    }

    const channelWithDetails = await this.getChannelByIdWithDetails(channelId);

    const payloadToSocket: ChannelDto =  {
      id: channelWithDetails.id,
      name: channelWithDetails.name,
      created_at: channelWithDetails.created_at,
      modified_at: channelWithDetails.modified_at,
      user_creator:  channelWithDetails.name,
      state: channelWithDetails.state,
      total_members: (Number(channelWithDetails.total_members) + 1).toString(),
      is_global: channelWithDetails.is_global,
    };

    if (oldJoin){
      oldJoin.state = EnumRecordsType.ACTIVE;
      await this.channelsUsersRepository.save(oldJoin);
      this.wskService.notifyRoomUpdate(channelId, payloadToSocket);
      return payloadToSocket;
      
    } else {
      const channel = await this.getChannelById(channelId);
  
      const user = await this.userService.getById(userId);
  
      const payload: Partial<ChannelsUsers> = {
        channel: channel,
        user: user,
        state: EnumRecordsType.ACTIVE
      }
  
      const newChannelsUsers = this.channelsUsersRepository.create(payload);
      await this.channelsUsersRepository.save(newChannelsUsers);

      this.wskService.notifyRoomUpdate(channelId, payloadToSocket);

      return payloadToSocket;
    }

  }

  async leaveChannel(channelId: string, userId: string) {
    const channel = await this.getChannelByIdAndUserId(channelId, userId);
    const channelWithDetails = await this.getChannelByIdWithDetails(channelId);
    
    console.log(channelWithDetails);

    channel.state = EnumRecordsType.INACTIVE;
    await this.channelsUsersRepository.save(channel);

     const payloadToSocket: ChannelDto =  {
        id: channelWithDetails.id,
        name: channelWithDetails.name,
        created_at: channelWithDetails.created_at,
        modified_at: channelWithDetails.modified_at,
        user_creator:  channelWithDetails.user_creator,
        state: channelWithDetails.state,
        total_members: (Number(channelWithDetails.total_members) - 1).toString(),
        is_global: channelWithDetails.is_global,
      };

    this.wskService.notifyRoomUpdate(channelId, payloadToSocket);
    
    return payloadToSocket;
  }

  async getChannelById(channelId: string) {
    const channel = await this.channelRepository.findOne({ where: { id: channelId, state: EnumRecordsType.ACTIVE } });
    if (!channel) {
      throw new NotFoundException('Channel not found');
    }
    return channel;
  }

  async getChannelByIdWithDetails(channelId: string): Promise<ChannelDto> {
    const channel = await this.channelRepository
      .createQueryBuilder('c')
      .leftJoin('channels_users', 'cu', 'cu.channel_id = c.id AND cu.state = :activeState', { activeState: EnumRecordsType.ACTIVE })
      .leftJoin('users', 'u', 'u.id = c.user_creator')
      .select([
        'c.*',
        'u.name as user_creator',
        'COUNT(cu.user_id) AS total_members'
      ])
      .where('c.id = :channelId', { channelId })
      .andWhere('c.state = :state', { state: EnumRecordsType.ACTIVE })
      .groupBy('c.id')
      .addGroupBy('c.name')
      .addGroupBy('u.name')
      .getRawOne();
  
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
