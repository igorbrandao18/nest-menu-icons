import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MenuIconsModule } from './menu-icons/menu-icons.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    CacheModule.register({
      isGlobal: true,
      ttl: 3600000, // 1 hour
    }),
    MenuIconsModule,
    PrismaModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
