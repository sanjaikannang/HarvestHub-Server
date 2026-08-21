import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/schemas/User/user.schema';
import { AdminSeeder } from './admin.seeder';
import { DatabaseSeeder } from './database.seeder';
import { ConfigService } from 'src/config/config.service';
import { ConfigModule } from 'src/config/config.module';

@Global()
@Module({
    imports: [
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                uri: configService.getMongoDbUri(),
                connectionFactory: (connection) => {
                    connection.on('connected', () => {
                        console.log('MongoDB connected successfully');
                    });
                    connection.once('open', () => {
                        console.log('MongoDB connection opened');
                    });
                    connection.on('error', (err) => {
                        console.error('MongoDB connection error:', err);
                    });
                    return connection;
                },
            }),
            inject: [ConfigService],
        }),
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
        ]),
    ],
    controllers: [],
    providers: [
        ConfigService,
        AdminSeeder,
        DatabaseSeeder
    ],
    exports: [
        DatabaseSeeder
    ],
})
export class SeederModule { }
