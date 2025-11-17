import { Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne } from 'typeorm';
// import { User } from '../../users/entities/user.entity';
import { Listing } from '../../listings/entities/listing.entity';
import { Profile } from '../../frofile/entities/frofile.entity'; // fixed typo from 'frofile'

@Entity()
export class Seller {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  emailVerificationToken: string;

  @Column({ default: false })
  isEmailVerified: boolean;

  @OneToOne(() => Profile, (profile) => profile.seller, { cascade: true, eager: true })
  profile: Profile;

  // Add this to fix the TS error about 'listings' property:
  @OneToMany(() => Listing, (listing) => listing.seller)
  listings: Listing[];
}
