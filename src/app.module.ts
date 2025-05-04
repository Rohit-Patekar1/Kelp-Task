
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory(cfg: ConfigService) {
        return {
          type: 'postgres',
          host: cfg.get<string>('DB_HOST'),
          port: parseInt(cfg.get<string>('DB_PORT')!, 10),
          username: cfg.get<string>('DB_USERNAME'),
          password: cfg.get<string>('DB_PASSWORD'),
          database: cfg.get<string>('DB_NAME'),
          entities: [__dirname + '/**/*.entity.{ts,js}'],
          synchronize: true,
          // ← Enable SSL for Neon
          ssl: {
            rejectUnauthorized: false,
          },
        };
      },
    }),
    UsersModule,
  ],
})
export class AppModule {}
