import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import * as bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';

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

    await this.userRepository.save(newUser);

    return newUser;
  }

  async getByEmail(email: string): Promise<User> {
    const users = await this.userRepository.findOne({ where: { email } });

    if (!users) {
      throw new NotFoundException('User not found');
    }

    return users;
  }

  async getAllUsers(): Promise<User[]> {
    const users = await this.userRepository.find();
    return users;
  }

  async getById(id: string): Promise<User> {
    const users = await this.userRepository.findOne({ where: { id } });
    const user = users;

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
