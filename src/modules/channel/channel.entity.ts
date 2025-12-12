import { EnumRecordsType } from 'src/globals/enums/records_type.enum';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../user/user.entity';

@Entity('channels')
export class Channel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'modified_at' })
  modifiedAt: Date;

  @Column({ type: 'enum', enum: EnumRecordsType })
  state: EnumRecordsType;

  @Column({ name: 'user_creator' })
  userCreator: string;

  @Column({ type: 'boolean', name: 'is_global', default: false })
  isGlobal: boolean;
  
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_creator' })
  user: User;
}
