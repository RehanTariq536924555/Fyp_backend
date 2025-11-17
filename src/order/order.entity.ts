
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  orderId: string;

  @Column('jsonb')
  items: { id: string; title: string; price: number }[];

  @Column('float')
  subtotal: number;

  @Column('float')
  tax: number;

  @Column('float')
  total: number;

  @Column()
  paymentMethod: string;

  @Column('jsonb', { nullable: true })
  paymentDetails: { bankName?: string; accountNumber?: string; stripePaymentIntentId?: string } | null;

  @Column()
  status: string;



  @Column({ nullable: true })
  buyerId: number;

  @Column({ nullable: true })
  seller: string;

  @Column({ nullable: true })
  date: string;
}
