import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import autocannon from 'autocannon';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma.service';
import { vi } from 'vitest';

describe('IconLibrary Load Tests', () => {
  let app: INestApplication;
  let url: string;

  const mockPrismaService = {
    menuIcon: {
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue({}),
      update: vi.fn().mockResolvedValue({}),
      delete: vi.fn().mockResolvedValue({}),
    },
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
    .overrideProvider(PrismaService)
    .useValue(mockPrismaService)
    .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
    
    const port = 3333;
    await app.listen(port);
    url = `http://localhost:${port}`;

    // Wait for the server to be ready
    await new Promise(resolve => setTimeout(resolve, 1000));
  });

  afterAll(async () => {
    await app.close();
  });

  const runLoadTest = (path: string, duration: number = 10): Promise<autocannon.Result> => {
    return new Promise((resolve, reject) => {
      const instance = autocannon({
        url: `${url}${path}`,
        connections: 10,
        duration,
        pipelining: 1,
        headers: {
          'Content-Type': 'application/json',
        },
      }, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });

      autocannon.track(instance);
    });
  };

  describe('Load Testing Endpoints', () => {
    it('should handle high load on GET /icons-library', async () => {
      const result = await runLoadTest('/api/icons-library');
      
      expect(result.errors).toBe(0);
      expect(result.timeouts).toBe(0);
      expect(result.non2xx).toBe(0);
      expect(result.latency.p99).toBeLessThan(1000); // 1s threshold
      expect(result.requests.average).toBeGreaterThan(50); // At least 50 req/sec
    }, 15000);

    it('should handle high load on GET /icons-library/collections', async () => {
      const result = await runLoadTest('/api/icons-library/collections');
      
      expect(result.errors).toBe(0);
      expect(result.timeouts).toBe(0);
      expect(result.non2xx).toBe(0);
      expect(result.latency.p99).toBeLessThan(500); // 500ms threshold
      expect(result.requests.average).toBeGreaterThan(80); // At least 80 req/sec
    }, 15000);

    it('should handle high load with collection filter', async () => {
      const result = await runLoadTest('/api/icons-library?collection=FA');
      
      expect(result.errors).toBe(0);
      expect(result.timeouts).toBe(0);
      expect(result.non2xx).toBe(0);
      expect(result.latency.p99).toBeLessThan(800); // 800ms threshold
      expect(result.requests.average).toBeGreaterThan(60); // At least 60 req/sec
    }, 15000);

    it('should handle high load with category filter', async () => {
      const result = await runLoadTest('/api/icons-library?category=Navigation');
      
      expect(result.errors).toBe(0);
      expect(result.timeouts).toBe(0);
      expect(result.non2xx).toBe(0);
      expect(result.latency.p99).toBeLessThan(800); // 800ms threshold
      expect(result.requests.average).toBeGreaterThan(60); // At least 60 req/sec
    }, 15000);
  });
}); 