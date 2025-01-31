import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { IconLibraryController } from './icon-library.controller';
import { IconLibraryService } from '../services/icon-library.service';

describe('IconLibraryController', () => {
  let controller: IconLibraryController;
  let service: IconLibraryService;

  const mockIcons = [
    {
      name: 'FaHome',
      collection: 'Font Awesome',
      component: 'FA_FaHome',
      category: 'Navigation'
    },
    {
      name: 'MdPerson',
      collection: 'Material Design Icons',
      component: 'MD_MdPerson',
      category: 'Users & People'
    },
    {
      name: 'FaUser',
      collection: 'Font Awesome',
      component: 'FA_FaUser',
      category: 'Users & People'
    }
  ];

  const mockCollections = [
    { prefix: 'FA', name: 'Font Awesome' },
    { prefix: 'MD', name: 'Material Design Icons' },
    { prefix: 'BS', name: 'Bootstrap Icons' }
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IconLibraryController],
      providers: [
        {
          provide: IconLibraryService,
          useValue: {
            searchIcons: vi.fn().mockImplementation((search, collection) => {
              let icons = [...mockIcons];
              
              if (collection) {
                const collectionName = collection === 'FA' ? 'Font Awesome' : 'Material Design Icons';
                icons = icons.filter(icon => icon.collection === collectionName);
              }
              
              if (search) {
                const searchLower = search.toLowerCase();
                icons = icons.filter(icon => 
                  icon.name.toLowerCase().includes(searchLower) ||
                  (icon.category?.toLowerCase() || '').includes(searchLower)
                );
              }
              
              return Promise.resolve(icons);
            }),
            getCollections: vi.fn().mockResolvedValue(mockCollections)
          }
        }
      ]
    }).compile();

    controller = module.get<IconLibraryController>(IconLibraryController);
    service = module.get<IconLibraryService>(IconLibraryService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('searchIcons', () => {
    it('should return all icons when no parameters are provided', async () => {
      const result = await controller.searchIcons();
      expect(result).toEqual(mockIcons);
      expect(service.searchIcons).toHaveBeenCalledWith(undefined, undefined);
    });

    it('should filter icons by collection', async () => {
      const result = await controller.searchIcons('FA');
      expect(result.every(icon => icon.collection === 'Font Awesome')).toBe(true);
      expect(service.searchIcons).toHaveBeenCalledWith(undefined, 'FA');
    });

    it('should filter icons by search term', async () => {
      const result = await controller.searchIcons(undefined, 'user');
      expect(result.length).toBe(2);
      expect(result.every(icon => 
        icon.name.toLowerCase().includes('user') ||
        (icon.category?.toLowerCase() || '').includes('user')
      )).toBe(true);
      expect(service.searchIcons).toHaveBeenCalledWith('user', undefined);
    });

    it('should filter icons by both collection and search term', async () => {
      const result = await controller.searchIcons('FA', 'user');
      expect(result.length).toBe(1);
      expect(result[0].name).toBe('FaUser');
      expect(result[0].collection).toBe('Font Awesome');
      expect(service.searchIcons).toHaveBeenCalledWith('user', 'FA');
    });

    it('should return empty array when no icons match the criteria', async () => {
      const result = await controller.searchIcons('INVALID', 'nonexistent');
      expect(result).toEqual([]);
      expect(service.searchIcons).toHaveBeenCalledWith('nonexistent', 'INVALID');
    });
  });

  describe('getCollections', () => {
    it('should return all collections', async () => {
      const result = await controller.getCollections();
      expect(result).toEqual(mockCollections);
      expect(service.getCollections).toHaveBeenCalled();
    });

    it('should return collections with correct structure', async () => {
      const result = await controller.getCollections();
      result.forEach(collection => {
        expect(collection).toHaveProperty('prefix');
        expect(collection).toHaveProperty('name');
        expect(typeof collection.prefix).toBe('string');
        expect(typeof collection.name).toBe('string');
      });
    });
  });
}); 