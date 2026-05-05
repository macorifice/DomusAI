import { Test, TestingModule } from '@nestjs/testing';
import { PropertyLocator } from '@tools/property-locator.service';
import { ToolsModule } from '@tools/tools.module';

describe('PropertyLocator', () => {
  let locator: PropertyLocator;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ToolsModule],
    }).compile();

    locator = module.get<PropertyLocator>(PropertyLocator);
  });

  it('filters properties by criteria', async () => {
    const properties = await locator.searchByCriteria({
      location: 'Milano',
      budgetMin: 300000,
      budgetMax: 400000,
      rooms: 3,
    });

    expect(properties.length).toBeGreaterThan(0);
    expect(properties.every((property) => property.price >= 300000 && property.price <= 400000)).toBe(true);
    expect(properties.every((property) => property.rooms >= 3)).toBe(true);
  });

  it('returns property details by id', async () => {
    const property = await locator.getPropertyDetails('prop-001');

    expect(property).toBeDefined();
    expect(property?.id).toBe('prop-001');
  });

  it('returns null for unknown property id', async () => {
    const property = await locator.getPropertyDetails('not-found');

    expect(property).toBeNull();
  });
});
