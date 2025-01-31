import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MenuIcon } from '@prisma/client';

@Injectable()
export class MenuIconsService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<MenuIcon[]> {
    return this.prisma.menuIcon.findMany();
  }

  async findOne(id: string): Promise<MenuIcon> {
    const menuIcon = await this.prisma.menuIcon.findUnique({
      where: { id },
    });

    if (!menuIcon) {
      throw new NotFoundException(`Menu icon with ID ${id} not found`);
    }

    return menuIcon;
  }

  async create(data: Omit<MenuIcon, 'id' | 'createdAt' | 'updatedAt'>): Promise<MenuIcon> {
    return this.prisma.menuIcon.create({
      data,
    });
  }

  async update(id: string, data: Partial<MenuIcon>): Promise<MenuIcon> {
    try {
      return await this.prisma.menuIcon.update({
        where: { id },
        data,
      });
    } catch (error) {
      throw new NotFoundException(`Menu icon with ID ${id} not found`);
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await this.prisma.menuIcon.delete({
        where: { id },
      });
    } catch (error) {
      throw new NotFoundException(`Menu icon with ID ${id} not found`);
    }
  }
} 