import { Injectable } from '@nestjs/common';
import { AdminSeeder } from './admin.seeder';

@Injectable()
export class DatabaseSeeder {

  constructor(
    private readonly adminSeeder: AdminSeeder,
  ) { }


  async seed(): Promise<void> {
    console.log('Starting database seeding...');

    try {
      await this.adminSeeder.seed();
      console.log('Database seeding completed successfully!');
    } catch (error) {
      console.error('Database seeding failed:', error.message);
      throw error;
    }
  }


  async drop(): Promise<void> {
    console.log('Starting database cleanup...');

    try {
      await this.adminSeeder.drop();
      console.log('Database cleanup completed successfully!');
    } catch (error) {
      console.error('Database cleanup failed:', error.message);
      throw error;
    }
  }
}
