import { ConflictException, Inject, Injectable, NotFoundException, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Channel } from './channel.entity';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { ChannelsUsers } from '../entity/channels_users.entity';
import { EnumRecordsType } from '../../globals/enums/records_type.enum';
import { ChannelDto, ChannelQueryFilters, CreateChannel } from './dto/channel.dto';
import { UserService } from '../user/user.service';
import { WskService } from '../../wsk/wsk.service';

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

  /**
   * Construye el query builder base común para consultas de canales con detalles
   * Puede partir de channelRepository o channelsUsersRepository según los filtros
   * @param filters Filtros opcionales para aplicar a la consulta
   * @returns Query builder configurado con joins, selects y filtros aplicados
   */
  private buildChannelQueryBase(filters: ChannelQueryFilters = {}): SelectQueryBuilder<Channel> | SelectQueryBuilder<ChannelsUsers> {
    // Solo usar channelsUsersRepository cuando se filtra por userId (necesita partir de channels_users)
    // getChannelByUserCreator debe partir de channelRepository para contar correctamente
    const useChannelsUsersBase = filters.userId;

    let queryBuilder: SelectQueryBuilder<Channel> | SelectQueryBuilder<ChannelsUsers>;

    if (useChannelsUsersBase) {
      queryBuilder = this.channelsUsersRepository
        .createQueryBuilder('cu')
        .leftJoin('channels', 'c', 'cu.channel_id = c.id')
        .leftJoin('channels_users', 'cu2', 'cu2.channel_id = c.id AND cu2.state = :activeState', { activeState: EnumRecordsType.ACTIVE })
        .leftJoin('users', 'u', 'u.id = c.user_creator')
        .select([
          'c.*',
          'u.name as user_creator',
          'COUNT(cu2.user_id) AS total_members'
        ]);

      // Establecer el WHERE inicial según los filtros proporcionados
      if (filters.creatorId && filters.creatorId.length > 0) {
        queryBuilder.where('c.user_creator = :creatorId', { creatorId: filters.creatorId });
        queryBuilder.andWhere('cu.state = :cuState', { cuState: EnumRecordsType.ACTIVE });
        queryBuilder.andWhere('c.state = :state', { state: EnumRecordsType.ACTIVE });
      } else if (filters.userId) {
        queryBuilder.where('cu.user_id = :userId', { userId: filters.userId });
        queryBuilder.andWhere('cu.state = :cuState', { cuState: EnumRecordsType.ACTIVE });
        queryBuilder.andWhere('c.state = :state', { state: EnumRecordsType.ACTIVE });
      } else {
        queryBuilder.where('c.state = :state', { state: EnumRecordsType.ACTIVE });
      }
    } else {
      queryBuilder = this.channelRepository
        .createQueryBuilder('c')
        .leftJoin('channels_users', 'cu', 'cu.channel_id = c.id AND cu.state = :activeState', { activeState: EnumRecordsType.ACTIVE })
        .leftJoin('users', 'u', 'u.id = c.user_creator')
        .select([
          'c.*',
          'u.name as user_creator',
          'COUNT(cu.user_id) AS total_members'
        ]);

      // Filtro por estado activo (siempre aplicado)
      queryBuilder.where('c.state = :state', { state: EnumRecordsType.ACTIVE });
    }

    // Filtro por canal global
    if (filters.isGlobal !== undefined) {
      queryBuilder.andWhere('c.is_global = :isGlobal', { isGlobal: filters.isGlobal });
    }

    // Filtro por ID de canal específico
    if (filters.channelId) {
      queryBuilder.andWhere('c.id = :channelId', { channelId: filters.channelId });
    }

    // Excluir canales a los que el usuario ya está unido
    if (filters.excludeUserId) {
      queryBuilder.andWhere(
        'c.id NOT IN (SELECT cu2.channel_id FROM channels_users cu2 WHERE cu2.user_id = :excludeUserId AND cu2.state = :activeState)',
        { excludeUserId: filters.excludeUserId, activeState: EnumRecordsType.ACTIVE }
      );
    }

    // Excluir canales donde el usuario es el creador
    if (filters.excludeCreatorId) {
      queryBuilder.andWhere('c.user_creator != :excludeCreatorId', { excludeCreatorId: filters.excludeCreatorId });
    }

    // Filtro por usuario creador (solo si no se usó como WHERE inicial)
    if (filters.creatorId && filters.creatorId.length > 0 && !useChannelsUsersBase) {
      queryBuilder.andWhere('c.user_creator = :creatorId', { creatorId: filters.creatorId });
    }

    // Filtro de búsqueda por nombre
    if (filters.search && filters.search.length > 0) {
      queryBuilder.andWhere('c.name ILIKE :search', { search: `%${filters.search}%` });
    }

    // GroupBy común
    queryBuilder
      .groupBy('c.id')
      .addGroupBy('c.name')
      .addGroupBy('u.name');

    return queryBuilder;
  }

  async getAllGlobalChannels() {
    const channels = await this.buildChannelQueryBase({ isGlobal: true })
      .getRawMany();
  
    return channels;
  }

  async getAllChannels(page: number = 1, limit: number = 10, search: string, creatorId: string, userId: string) {
    const queryBuilder = this.buildChannelQueryBase({
      isGlobal: false,
      excludeUserId: userId,
      creatorId,
      search
    })
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
    const channels = await this.buildChannelQueryBase({
      userId,
      excludeCreatorId: userId,
      isGlobal: false
    })
      .getRawMany();
  
    return channels;
  }

  async getChannelByUserCreator(userId: string) {
    const channels = await this.buildChannelQueryBase({
      creatorId: userId,
      isGlobal: false
    })
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
    const channel = await this.buildChannelQueryBase({ channelId })
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
