import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PropertiesController } from '@tools/properties.controller';
import { ToolsModule } from '@tools/tools.module';

describe('PropertiesController', () => {
  let controller: PropertiesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ToolsModule],
    }).compile();

    controller = module.get<PropertiesController>(PropertiesController);
  });

  it('returns search results for valid filters', async () => {
    const result = await controller.search({
      location: 'Milano',
      budgetMin: 250000,
      budgetMax: 450000,
      propertyType: 'apartment',
      rooms: 2,
      bathrooms: 1,
      radius: 10,
      amenities: [],
    });

    expect(result.total).toBeGreaterThan(0);
    expect(result.properties.length).toBe(result.total);
  });

  it('returns a property by id', async () => {
    const property = await controller.getById('prop-002');

    expect(property.id).toBe('prop-002');
  });

  it('throws for unknown id', async () => {
    await expect(controller.getById('missing-id')).rejects.toBeInstanceOf(NotFoundException);
  });
});
