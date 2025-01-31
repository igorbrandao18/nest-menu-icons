import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { MenuIconsModule } from '../../src/menu-icons/menu-icons.module';
import { IconLibraryService } from '../../src/menu-icons/services/icon-library.service';
import { IconLibraryController } from '../../src/menu-icons/controllers/icon-library.controller';
import { PrismaService } from '../../src/prisma.service';
import { PrismaModule } from '../../src/prisma/prisma.module';

// Mock react-icons modules
vi.mock('react-icons/md', () => ({
  MdHome: {},
  MdPerson: {},
  MdSettings: {},
  MdDashboard: {},
  MdMenu: {},
}));

vi.mock('react-icons/fa', () => ({
  FaHome: {},
  FaUser: {},
  FaCog: {},
  FaUserCircle: {},
  FaBars: {},
}));

vi.mock('react-icons/bs', () => ({
  BsHouse: {},
  BsPerson: {},
  BsGear: {},
  BsGrid: {},
  BsList: {},
}));

describe('IconLibrary Integration Tests', () => {
  let app: INestApplication;
  let iconLibraryService: IconLibraryService;
  let iconLibraryController: IconLibraryController;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [MenuIconsModule, PrismaModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();

    iconLibraryService = moduleFixture.get<IconLibraryService>(IconLibraryService);
    iconLibraryController = moduleFixture.get<IconLibraryController>(IconLibraryController);
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('Service-Controller Integration', () => {
    it('should properly integrate service with controller for searching all icons', async () => {
      const serviceResult = await iconLibraryService.searchIcons();
      const controllerResult = await iconLibraryController.searchIcons();

      expect(controllerResult).toEqual(serviceResult);
      expect(Array.isArray(controllerResult)).toBe(true);
      expect(controllerResult.length).toBeGreaterThan(0);
      
      // Verify icon structure
      const icon = controllerResult[0];
      expect(icon).toHaveProperty('name');
      expect(icon).toHaveProperty('collection');
      expect(icon).toHaveProperty('component');
      expect(icon).toHaveProperty('category');
    });

    it('should properly integrate service with controller for searching by collection', async () => {
      const collection = 'FA';
      const serviceResult = await iconLibraryService.searchIcons(undefined, collection);
      const controllerResult = await iconLibraryController.searchIcons(collection);

      expect(controllerResult).toEqual(serviceResult);
      expect(controllerResult.every(icon => 
        icon.collection === 'Font Awesome'
      )).toBe(true);
    });

    it('should properly integrate service with controller for searching by term', async () => {
      const searchTerm = 'home';
      const serviceResult = await iconLibraryService.searchIcons(searchTerm);
      const controllerResult = await iconLibraryController.searchIcons(undefined, searchTerm);

      expect(controllerResult).toEqual(serviceResult);
      expect(controllerResult.every(icon => 
        icon.name.toLowerCase().includes(searchTerm) ||
        (icon.category?.toLowerCase() || '').includes(searchTerm)
      )).toBe(true);
    });

    it('should properly integrate service with controller for getCollections', async () => {
      const serviceResult = await iconLibraryService.getCollections();
      const controllerResult = await iconLibraryController.getCollections();

      expect(controllerResult).toEqual(serviceResult);
      expect(Array.isArray(controllerResult)).toBe(true);
      expect(controllerResult.length).toBeGreaterThan(0);
      
      // Verify collection structure
      const collection = controllerResult[0];
      expect(collection).toHaveProperty('prefix');
      expect(collection).toHaveProperty('name');
    });
  });

  describe('Data Consistency', () => {
    it('should maintain icon data structure throughout the stack', async () => {
      const icons = await iconLibraryController.searchIcons();
      
      icons.forEach(icon => {
        expect(icon).toHaveProperty('name');
        expect(icon).toHaveProperty('collection');
        expect(icon).toHaveProperty('component');
        expect(icon).toHaveProperty('category');
        
        expect(typeof icon.name).toBe('string');
        expect(typeof icon.collection).toBe('string');
        expect(typeof icon.component).toBe('string');
        expect(typeof icon.category).toBe('string');
      });
    });

    it('should maintain collection data structure throughout the stack', async () => {
      const collections = await iconLibraryController.getCollections();
      
      collections.forEach(collection => {
        expect(collection).toHaveProperty('prefix');
        expect(collection).toHaveProperty('name');
        
        expect(typeof collection.prefix).toBe('string');
        expect(typeof collection.name).toBe('string');
        expect(collection.prefix.length).toBeGreaterThan(0);
        expect(collection.name.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Search Functionality', () => {
    it('should find icons by name or category', async () => {
      const searchTerm = 'user';
      const icons = await iconLibraryController.searchIcons(undefined, searchTerm);
      
      expect(icons.length).toBeGreaterThan(0);
      expect(icons.every(icon => 
        icon.name.toLowerCase().includes(searchTerm) ||
        (icon.category?.toLowerCase() || '').includes(searchTerm)
      )).toBe(true);
    });

    it('should handle combined collection and search filters', async () => {
      const collection = 'FA';
      const searchTerm = 'home';
      const icons = await iconLibraryController.searchIcons(collection, searchTerm);
      
      expect(icons.length).toBeGreaterThan(0);
      expect(icons.every(icon => 
        icon.collection === 'Font Awesome' &&
        (icon.name.toLowerCase().includes(searchTerm) ||
         (icon.category?.toLowerCase() || '').includes(searchTerm))
      )).toBe(true);
    });
  });
}); 