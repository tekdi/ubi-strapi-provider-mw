import { Test, TestingModule } from '@nestjs/testing';
import { StrapiAdminController } from './strapi-admin.controller';

describe('StrapiAdminController', () => {
  let controller: StrapiAdminController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StrapiAdminController],
    }).compile();

    controller = module.get<StrapiAdminController>(StrapiAdminController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
