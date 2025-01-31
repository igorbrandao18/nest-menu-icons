import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma.service';
import axios from 'axios';
import { performance } from 'perf_hooks';

describe('IconLibrary Performance Tests', () => {
  let app: INestApplication;
  let baseUrl: string;

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
    
    const port = 3334; // Different port from load tests
    await app.listen(port);
    baseUrl = `http://localhost:${port}`;

    // Wait for the server to be ready
    await new Promise(resolve => setTimeout(resolve, 1000));
  });

  afterAll(async () => {
    await app.close();
  });

  const measureResponseTime = async (url: string): Promise<number> => {
    const start = performance.now();
    await axios.get(url);
    return performance.now() - start;
  };

  const measureMultipleRequests = async (url: string, count: number = 5): Promise<number[]> => {
    const times: number[] = [];
    for (let i = 0; i < count; i++) {
      times.push(await measureResponseTime(url));
    }
    return times;
  };

  describe('Response Time Tests', () => {
    it('should return all icons within acceptable time', async () => {
      const responseTime = await measureResponseTime(`${baseUrl}/api/icons-library`);
      expect(responseTime).toBeLessThan(200); // 200ms threshold
    });

    it('should return collections within acceptable time', async () => {
      const responseTime = await measureResponseTime(`${baseUrl}/api/icons-library/collections`);
      expect(responseTime).toBeLessThan(100); // 100ms threshold for collections
    });

    it('should handle filtered requests efficiently', async () => {
      const responseTime = await measureResponseTime(`${baseUrl}/api/icons-library?collection=FA`);
      expect(responseTime).toBeLessThan(150); // 150ms threshold for filtered requests
    });
  });

  describe('Concurrent Request Performance', () => {
    it('should handle multiple concurrent requests', async () => {
      const requests = Array(5).fill(`${baseUrl}/api/icons-library`);
      const times = await Promise.all(requests.map(url => measureResponseTime(url)));
      
      const maxTime = Math.max(...times);
      expect(maxTime).toBeLessThan(500); // 500ms threshold for concurrent requests
    });
  });

  describe('Memory Usage', () => {
    it('should maintain stable memory usage under load', async () => {
      const initialMemory = process.memoryUsage().heapUsed;
      
      // Make multiple requests
      await Promise.all(Array(20).fill(null).map(() => 
        axios.get(`${baseUrl}/api/icons-library`)
      ));
      
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Memory increase should be less than 50MB
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
    });
  });

  describe('Response Size', () => {
    it('should have reasonable response size for all icons', async () => {
      const response = await axios.get(`${baseUrl}/api/icons-library`);
      const responseSize = JSON.stringify(response.data).length;
      
      // Response size should be less than 1MB
      expect(responseSize).toBeLessThan(1024 * 1024);
    });

    it('should have small response size for collections', async () => {
      const response = await axios.get(`${baseUrl}/api/icons-library/collections`);
      const responseSize = JSON.stringify(response.data).length;
      
      // Collections response should be less than 10KB
      expect(responseSize).toBeLessThan(10 * 1024);
    });
  });

  describe('Dynamic Import Performance', () => {
    it('should load icons efficiently when searching', async () => {
      // Primeira busca carrega os ícones
      const firstSearch = await measureResponseTime(`${baseUrl}/api/icons-library?search=home`);
      
      // Segunda busca com o mesmo termo deve ser mais rápida devido ao módulo já estar carregado
      const secondSearch = await measureResponseTime(`${baseUrl}/api/icons-library?search=home`);
      
      // Log para debug
      console.log(`First search: ${firstSearch.toFixed(2)}ms`);
      console.log(`Second search: ${secondSearch.toFixed(2)}ms`);
      
      // A segunda busca deve ser mais rápida ou pelo menos não muito mais lenta
      expect(secondSearch).toBeLessThanOrEqual(firstSearch * 1.5);
    });

    it('should efficiently handle different search terms', async () => {
      // Busca por diferentes termos para testar o carregamento dinâmico
      const searches = ['user', 'home', 'settings', 'menu'];
      const times = await Promise.all(
        searches.map(term => 
          measureResponseTime(`${baseUrl}/api/icons-library?search=${term}`)
        )
      );
      
      // Todas as buscas devem ser relativamente rápidas
      const maxTime = Math.max(...times);
      expect(maxTime).toBeLessThan(200); // 200ms threshold
    });
  });
}); 