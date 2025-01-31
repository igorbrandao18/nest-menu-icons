import { Module } from '@nestjs/common';
import { MenuIconsService } from './menu-icons.service';
import { MenuIconsController } from './menu-icons.controller';
import { IconLibraryService } from './services/icon-library.service';
import { IconLibraryController } from './controllers/icon-library.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [MenuIconsController, IconLibraryController],
  providers: [MenuIconsService, IconLibraryService, PrismaService],
})
export class MenuIconsModule {} 