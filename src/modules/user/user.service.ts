import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import * as bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';
import { Like, Repository } from 'typeorm';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { EnumRecordsType } from 'src/globals/enums/records_type.enum';

@Injectable()
export class UserService {

    constructor(
      @InjectRepository(User)
      private readonly userRepository: Repository<User>,
    ) {
    }

   async createUser(email: string, password: string, name: string): Promise<User> {

    const user = await this.userRepository.findOne({ where: { email } });

    if (user) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await this.userRepository.create({  
      email,
      password: hashedPassword,
      name
    });

    const savedUser = await this.userRepository.save(newUser);

    // Consultar el usuario recién creado sin el password (select: false se aplica aquí)
    return await this.userRepository.findOne({ where: { id: savedUser.id } }) as User;
  }

  async getByEmail(email: string): Promise<User> {
    const users = await this.userRepository.findOne({ where: { email } });

    if (!users) {
      throw new NotFoundException('User not found');
    }

    return users;
  }

  // Método específico para autenticación que SÍ incluye el password
  async getByEmailWithPassword(email: string): Promise<User> {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .where('user.email = :email', { email })
      .addSelect('user.password')
      .getOne();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async getAllUsers(page: number = 1, limit: number = 10, search?: string ): Promise<{ data: User[], page: number, limit: number, total: number, totalPages: number }> {
    const queryBuilder = this.userRepository.createQueryBuilder('user')
      .where('user.state = :state', { state: EnumRecordsType.ACTIVE });

    if (search) {
      queryBuilder.andWhere('user.name LIKE :search', { search: `%${search}%` });
    }

    queryBuilder.orderBy('user.created_at', 'DESC');

    const total = await queryBuilder.getCount();

    const users = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      data: users,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    };
  }

  async getById(id: string): Promise<User> {
    const users = await this.userRepository.findOne({ where: { id , state: EnumRecordsType.ACTIVE } });
    const user = users;

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
