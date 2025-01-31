import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('IconLibrary (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/api/icons-library (GET)', () => {
    it('should return all icons', () => {
      return request(app.getHttpServer())
        .get('/api/icons-library')
        .expect(200)
        .expect('Content-Type', /json/)
        .then(response => {
          expect(Array.isArray(response.body)).toBe(true);
          expect(response.body.length).toBeGreaterThan(0);
          
          const icon = response.body[0];
          expect(icon).toHaveProperty('name');
          expect(icon).toHaveProperty('collection');
          expect(icon).toHaveProperty('component');
          expect(icon).toHaveProperty('category');
        });
    });

    it('should filter icons by collection', () => {
      return request(app.getHttpServer())
        .get('/api/icons-library?collection=FA')
        .expect(200)
        .expect('Content-Type', /json/)
        .then(response => {
          expect(Array.isArray(response.body)).toBe(true);
          expect(response.body.length).toBeGreaterThan(0);
          expect(response.body.every(icon => 
            icon.collection === 'Font Awesome'
          )).toBe(true);
        });
    });

    it('should filter icons by category', () => {
      return request(app.getHttpServer())
        .get('/api/icons-library?category=Navigation')
        .expect(200)
        .expect('Content-Type', /json/)
        .then(response => {
          expect(Array.isArray(response.body)).toBe(true);
          expect(response.body.every(icon => 
            icon.category === 'Navigation'
          )).toBe(true);
        });
    });
  });

  describe('/api/icons-library/collections (GET)', () => {
    it('should return all collections', () => {
      return request(app.getHttpServer())
        .get('/api/icons-library/collections')
        .expect(200)
        .expect('Content-Type', /json/)
        .then(response => {
          expect(Array.isArray(response.body)).toBe(true);
          expect(response.body.length).toBeGreaterThan(0);
          
          const collection = response.body[0];
          expect(collection).toHaveProperty('prefix');
          expect(collection).toHaveProperty('name');
          
          // Check for major collections
          const collectionNames = response.body.map(c => c.name);
          expect(collectionNames).toContain('Material Design Icons');
          expect(collectionNames).toContain('Font Awesome');
          expect(collectionNames).toContain('Bootstrap Icons');
        });
    });
  });
}); 