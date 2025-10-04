import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Channel } from '../channel/channel.entity';
import { User } from '../user/user.entity';
import { EnumRecordsType } from 'src/globals/enums/records_type.enum';

@Entity('channels_users')
export class ChannelsUsers {

  @PrimaryColumn('uuid')
  channel_id: string;

  @PrimaryColumn('uuid')
  user_id: string;

  @CreateDateColumn({ name: 'joined_at' })
  joinedAt: Date;

  @ManyToOne(() => Channel, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'channel_id' })
  channel: Channel;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'enum', enum: EnumRecordsType })
  state: EnumRecordsType;
}
