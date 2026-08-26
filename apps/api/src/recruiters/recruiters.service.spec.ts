import { Test, TestingModule } from '@nestjs/testing';
import { RecruitersService } from './recruiters.service';
import { PrismaService } from '../common/services/prisma.service';

describe('RecruitersService', () => {
  let service: RecruitersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RecruitersService, { provide: PrismaService, useValue: {} }],
    }).compile();

    service = module.get<RecruitersService>(RecruitersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
