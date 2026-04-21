/**
 * Test per gli agenti
 */

import { Test, TestingModule } from '@nestjs/testing';
import { SearchAgent } from '@agents/search.agent';
import { PropertyLocator } from '@tools/property-locator.service';

describe('SearchAgent', () => {
  let agent: SearchAgent;
  let propertyLocator: PropertyLocator;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SearchAgent, PropertyLocator],
    }).compile();

    agent = module.get<SearchAgent>(SearchAgent);
    propertyLocator = module.get<PropertyLocator>(PropertyLocator);
  });

  it('Should be defined', () => {
    expect(agent).toBeDefined();
  });

  it('Should return error when required inputs are missing', async () => {
    const result = await agent.execute({});
    expect(result.status).toBe('error');
  });

  it('Should return success when inputs are valid', async () => {
    const result = await agent.execute({
      location: 'Milano',
      budgetMin: 100000,
      budgetMax: 500000,
    });
    expect(result.status).toBe('success');
  });
});
