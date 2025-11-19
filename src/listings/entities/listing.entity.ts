import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Seller } from '../../Seller/entities/seller.entity';

@Entity()
export class Listing {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  title?: string;

  @Column({ nullable: true })
  type?: string;

  @Column({ nullable: true })
  breed?: string;

  @Column('float', { nullable: true })
  age?: number;

  @Column('float', { nullable: true })
  weight?: number;

  @Column('float', { nullable: true })
  price?: number;

  @Column({ nullable: true })
  location?: string;

  @Column('text', { nullable: true })
  description?: string;

  @Column('simple-array', { nullable: true })
  images?: string[];

  @ManyToOne(() => Seller, (seller) => seller.listings, { eager: true, nullable: true })
  seller?: Seller;
}
