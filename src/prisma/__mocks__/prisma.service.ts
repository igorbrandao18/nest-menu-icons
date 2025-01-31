import { vi } from 'vitest';

export const PrismaService = vi.fn().mockImplementation(() => ({
  menuIcon: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
})); 