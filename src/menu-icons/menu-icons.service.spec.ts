import { Test, TestingModule } from '@nestjs/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MenuIconsService } from './menu-icons.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('MenuIconsService', () => {
  let service: MenuIconsService;
  let prisma: PrismaService;

  const mockMenuIcon = {
    id: '1',
    name: 'Home',
    icon: 'HomeIcon',
    category: 'Navigation',
    description: 'Home page icon',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrismaService = {
    menuIcon: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MenuIconsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<MenuIconsService>(MenuIconsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of menu icons', async () => {
      mockPrismaService.menuIcon.findMany.mockResolvedValue([mockMenuIcon]);
      const result = await service.findAll();
      expect(result).toEqual([mockMenuIcon]);
    });
  });

  describe('findOne', () => {
    it('should return a menu icon', async () => {
      mockPrismaService.menuIcon.findUnique.mockResolvedValue(mockMenuIcon);
      const result = await service.findOne('1');
      expect(result).toEqual(mockMenuIcon);
    });

    it('should throw NotFoundException when menu icon is not found', async () => {
      mockPrismaService.menuIcon.findUnique.mockResolvedValue(null);
      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create and return a menu icon', async () => {
      const createData = {
        name: 'Home',
        icon: 'HomeIcon',
        category: 'Navigation',
        description: 'Home page icon',
        isActive: true,
      };
      mockPrismaService.menuIcon.create.mockResolvedValue(mockMenuIcon);
      const result = await service.create(createData);
      expect(result).toEqual(mockMenuIcon);
    });
  });

  describe('update', () => {
    it('should update and return a menu icon', async () => {
      const updateData = { name: 'Updated Home' };
      mockPrismaService.menuIcon.update.mockResolvedValue({
        ...mockMenuIcon,
        ...updateData,
      });
      const result = await service.update('1', updateData);
      expect(result).toEqual({ ...mockMenuIcon, ...updateData });
    });

    it('should throw NotFoundException when menu icon is not found', async () => {
      mockPrismaService.menuIcon.update.mockRejectedValue(new Error());
      await expect(service.update('1', {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a menu icon', async () => {
      mockPrismaService.menuIcon.delete.mockResolvedValue(mockMenuIcon);
      await expect(service.remove('1')).resolves.not.toThrow();
    });

    it('should throw NotFoundException when menu icon is not found', async () => {
      mockPrismaService.menuIcon.delete.mockRejectedValue(new Error());
      await expect(service.remove('1')).rejects.toThrow(NotFoundException);
    });
  });
}); 