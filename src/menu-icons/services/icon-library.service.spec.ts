import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { IconLibraryService } from './icon-library.service';

// Mock das importações dinâmicas
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

describe('IconLibraryService', () => {
  let service: IconLibraryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IconLibraryService],
    }).compile();

    service = module.get<IconLibraryService>(IconLibraryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('searchIcons', () => {
    it('should return all icons when no search term or collection is provided', async () => {
      const icons = await service.searchIcons();
      expect(Array.isArray(icons)).toBe(true);
      expect(icons.length).toBeGreaterThan(0);
      
      // Verify icon structure
      const icon = icons[0];
      expect(icon).toHaveProperty('name');
      expect(icon).toHaveProperty('collection');
      expect(icon).toHaveProperty('component');
      expect(icon).toHaveProperty('category');
    });

    it('should filter icons by collection', async () => {
      const icons = await service.searchIcons(undefined, 'FA');
      expect(icons.length).toBeGreaterThan(0);
      expect(icons.every(icon => icon.collection === 'Font Awesome')).toBe(true);
    });

    it('should filter icons by search term', async () => {
      const icons = await service.searchIcons('home');
      expect(icons.length).toBeGreaterThan(0);
      expect(icons.every(icon => 
        icon.name.toLowerCase().includes('home') || 
        icon.category?.toLowerCase().includes('home')
      )).toBe(true);
    });

    it('should filter icons by both collection and search term', async () => {
      const icons = await service.searchIcons('user', 'FA');
      expect(icons.length).toBeGreaterThan(0);
      expect(icons.every(icon => 
        icon.collection === 'Font Awesome' &&
        (icon.name.toLowerCase().includes('user') || 
         icon.category?.toLowerCase().includes('user'))
      )).toBe(true);
    });

    it('should return empty array for non-existent collection', async () => {
      const icons = await service.searchIcons(undefined, 'INVALID');
      expect(icons).toEqual([]);
    });

    it('should return empty array when no icons match search term', async () => {
      const icons = await service.searchIcons('nonexistenticon');
      expect(icons).toEqual([]);
    });
  });

  describe('getCollections', () => {
    it('should return all available collections', async () => {
      const collections = await service.getCollections();
      expect(Array.isArray(collections)).toBe(true);
      expect(collections.length).toBe(3); // MD, FA, BS

      // Verify collection structure
      collections.forEach(collection => {
        expect(collection).toHaveProperty('prefix');
        expect(collection).toHaveProperty('name');
        expect(typeof collection.prefix).toBe('string');
        expect(typeof collection.name).toBe('string');
      });
    });

    it('should include all major icon collections', async () => {
      const collections = await service.getCollections();
      const collectionNames = collections.map(c => c.name);
      
      expect(collectionNames).toContain('Material Design Icons');
      expect(collectionNames).toContain('Font Awesome');
      expect(collectionNames).toContain('Bootstrap Icons');
    });
  });

  describe('Icon Categories', () => {
    it('should categorize navigation icons correctly', async () => {
      const icons = await service.searchIcons('home');
      expect(icons.some(icon => icon.category === 'Navigation')).toBe(true);
    });

    it('should categorize user icons correctly', async () => {
      const icons = await service.searchIcons('user');
      expect(icons.some(icon => icon.category === 'Users & People')).toBe(true);
    });

    it('should categorize settings icons correctly', async () => {
      const icons = await service.searchIcons('settings');
      expect(icons.some(icon => icon.category === 'Settings')).toBe(true);
    });
  });
}); 