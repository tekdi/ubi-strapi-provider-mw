import { Test, TestingModule } from '@nestjs/testing';
import { StrapiAdminService } from './strapi-admin.service';

describe('StrapiAdminService', () => {
  let service: StrapiAdminService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StrapiAdminService],
    }).compile();

    service = module.get<StrapiAdminService>(StrapiAdminService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
