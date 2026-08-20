import * as dns from 'dns';
import { NestFactory } from '@nestjs/core';
import { SeederModule } from './seeder.module';
import { DatabaseSeeder } from './database.seeder';

dns.setServers(['8.8.8.8', '1.1.1.1']);

async function bootstrap() {

    try {
        const app = await NestFactory.createApplicationContext(SeederModule);
        const seeder = app.get(DatabaseSeeder);

        const command = process.argv[2];

        switch (command) {
            case 'seed':
                await seeder.seed();
                break;
            case 'drop':
                await seeder.drop();
                break;
            case 'refresh':
                await seeder.drop();
                await seeder.seed();
                break;
            default:
                console.log('Invalid command. Use: seed, drop, or refresh');
                process.exit(1);
        }

        await app.close();
        process.exit(0);
    } catch (error) {
        console.log('Seeder command failed:', error.message);
        process.exit(1);
    }
}

bootstrap();
