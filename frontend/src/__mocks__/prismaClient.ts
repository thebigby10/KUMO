export class PrismaClient {
  constructor() {
    return {
      $connect: jest.fn(),
      $disconnect: jest.fn(),
      $transaction: jest.fn((cb) => cb(this)),
    };
  }
}
