import { DataSource, Repository } from 'typeorm';
import { Seller } from './entities/seller.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SellerRepository extends Repository<Seller> {
  constructor(private dataSource: DataSource) {
    super(Seller, dataSource.createEntityManager());
  }

  async findByEmail(email: string): Promise<Seller | undefined> {
    return this.findOne({ where: { email } });
  }
}
