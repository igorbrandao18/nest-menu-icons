import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { createServer } from 'http';
import { AddressInfo } from 'net';

describe('IconLibrary (E2E)', () => {
  let app: INestApplication;
  let httpServer: ReturnType<typeof createServer>;
  let baseUrl: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    // Configure app settings
    app.setGlobalPrefix('api');
    
    await app.init();
    httpServer = app.getHttpServer();
    
    const address = httpServer.address() as AddressInfo;
    baseUrl = `http://localhost:${address.port}`;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/icons-library', () => {
    it('should return all icons with correct structure', async () => {
      const response = await fetch(`${baseUrl}/api/icons-library`);
      expect(response.status).toBe(200);
      
      const icons = await response.json();
      expect(Array.isArray(icons)).toBe(true);
      expect(icons.length).toBeGreaterThan(0);
      
      const icon = icons[0];
      expect(icon).toHaveProperty('name');
      expect(icon).toHaveProperty('collection');
      expect(icon).toHaveProperty('component');
      expect(icon).toHaveProperty('category');
    });

    it('should filter icons by collection', async () => {
      const response = await fetch(`${baseUrl}/api/icons-library?collection=FA`);
      expect(response.status).toBe(200);
      
      const icons = await response.json();
      expect(Array.isArray(icons)).toBe(true);
      expect(icons.length).toBeGreaterThan(0);
      expect(icons.every(icon => icon.collection === 'Font Awesome')).toBe(true);
    });

    it('should filter icons by category', async () => {
      const response = await fetch(`${baseUrl}/api/icons-library?category=Navigation`);
      expect(response.status).toBe(200);
      
      const icons = await response.json();
      expect(Array.isArray(icons)).toBe(true);
      expect(icons.every(icon => icon.category === 'Navigation')).toBe(true);
    });

    it('should handle combined filters', async () => {
      const response = await fetch(`${baseUrl}/api/icons-library?collection=FA&category=Navigation`);
      expect(response.status).toBe(200);
      
      const icons = await response.json();
      expect(Array.isArray(icons)).toBe(true);
      icons.forEach(icon => {
        expect(icon.collection).toBe('Font Awesome');
        expect(icon.category).toBe('Navigation');
      });
    });

    it('should handle invalid collection gracefully', async () => {
      const response = await fetch(`${baseUrl}/api/icons-library?collection=INVALID`);
      expect(response.status).toBe(200);
      
      const icons = await response.json();
      expect(Array.isArray(icons)).toBe(true);
      expect(icons).toHaveLength(0);
    });
  });

  describe('GET /api/icons-library/collections', () => {
    it('should return all collections with correct structure', async () => {
      const response = await fetch(`${baseUrl}/api/icons-library/collections`);
      expect(response.status).toBe(200);
      
      const collections = await response.json();
      expect(Array.isArray(collections)).toBe(true);
      expect(collections.length).toBeGreaterThan(0);
      
      collections.forEach(collection => {
        expect(collection).toHaveProperty('prefix');
        expect(collection).toHaveProperty('name');
        expect(typeof collection.prefix).toBe('string');
        expect(typeof collection.name).toBe('string');
      });
    });

    it('should include major icon collections', async () => {
      const response = await fetch(`${baseUrl}/api/icons-library/collections`);
      expect(response.status).toBe(200);
      
      const collections = await response.json();
      const collectionNames = collections.map(c => c.name);
      
      expect(collectionNames).toContain('Material Design Icons');
      expect(collectionNames).toContain('Font Awesome');
      expect(collectionNames).toContain('Bootstrap Icons');
    });
  });

  describe('API Error Handling', () => {
    it('should handle invalid endpoints gracefully', async () => {
      const response = await fetch(`${baseUrl}/api/icons-library/invalid`);
      expect(response.status).toBe(404);
    });

    it('should handle invalid query parameters gracefully', async () => {
      const response = await fetch(`${baseUrl}/api/icons-library?invalid=true`);
      expect(response.status).toBe(200);
      
      const icons = await response.json();
      expect(Array.isArray(icons)).toBe(true);
    });
  });

  describe('Content Type and Headers', () => {
    it('should return JSON content type', async () => {
      const response = await fetch(`${baseUrl}/api/icons-library`);
      expect(response.headers.get('content-type')).toContain('application/json');
    });

    it('should handle CORS headers', async () => {
      const response = await fetch(`${baseUrl}/api/icons-library`, {
        method: 'OPTIONS',
      });
      expect(response.headers.get('access-control-allow-origin')).toBeTruthy();
    });
  });
}); 