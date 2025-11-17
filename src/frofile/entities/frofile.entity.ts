import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';
import { Seller } from '../../Seller/entities/seller.entity';

@Entity()
export class Profile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  phone: string;

  @Column()
  address: string;

  @Column()
  city: string;

  @Column()
  country: string;

  @Column()
  bio: string;

  @Column({ nullable: true })
  image: string;

  @OneToOne(() => Seller, (seller) => seller.profile)
  @JoinColumn()
  seller: Seller;
}