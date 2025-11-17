import { DataSource, Repository } from 'typeorm';
import { Buyer } from './entities/buyer.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserRepository extends Repository<Buyer> {
  constructor(private dataSource: DataSource) {
    super(Buyer, dataSource.createEntityManager());
  }

  async findByEmail(email: string): Promise<Buyer | undefined> {
    const normalizedEmail = email.toLowerCase();
    console.log('UserRepository: Querying buyer with email:', normalizedEmail);
    return this.findOne({ where: { email: normalizedEmail } });
  }
}