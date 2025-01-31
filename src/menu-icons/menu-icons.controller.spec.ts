import { Test, TestingModule } from '@nestjs/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MenuIconsController } from './menu-icons.controller';
import { MenuIconsService } from './menu-icons.service';

describe('MenuIconsController', () => {
  let controller: MenuIconsController;
  let service: MenuIconsService;

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

  const mockMenuIconsService = {
    findAll: vi.fn(),
    findOne: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MenuIconsController],
      providers: [
        {
          provide: MenuIconsService,
          useValue: mockMenuIconsService,
        },
      ],
    }).compile();

    controller = module.get<MenuIconsController>(MenuIconsController);
    service = module.get<MenuIconsService>(MenuIconsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of menu icons', async () => {
      mockMenuIconsService.findAll.mockResolvedValue([mockMenuIcon]);
      const result = await controller.findAll();
      expect(result).toEqual([mockMenuIcon]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a menu icon', async () => {
      mockMenuIconsService.findOne.mockResolvedValue(mockMenuIcon);
      const result = await controller.findOne('1');
      expect(result).toEqual(mockMenuIcon);
      expect(service.findOne).toHaveBeenCalledWith('1');
    });
  });

  describe('create', () => {
    it('should create a menu icon', async () => {
      const createData = {
        name: 'Home',
        icon: 'HomeIcon',
        category: 'Navigation',
        description: 'Home page icon',
        isActive: true,
      };
      mockMenuIconsService.create.mockResolvedValue(mockMenuIcon);
      const result = await controller.create(createData);
      expect(result).toEqual(mockMenuIcon);
      expect(service.create).toHaveBeenCalledWith(createData);
    });
  });

  describe('update', () => {
    it('should update a menu icon', async () => {
      const updateData = { name: 'Updated Home' };
      mockMenuIconsService.update.mockResolvedValue({
        ...mockMenuIcon,
        ...updateData,
      });
      const result = await controller.update('1', updateData);
      expect(result).toEqual({ ...mockMenuIcon, ...updateData });
      expect(service.update).toHaveBeenCalledWith('1', updateData);
    });
  });

  describe('remove', () => {
    it('should remove a menu icon', async () => {
      mockMenuIconsService.remove.mockResolvedValue(undefined);
      await controller.remove('1');
      expect(service.remove).toHaveBeenCalledWith('1');
    });
  });
}); 