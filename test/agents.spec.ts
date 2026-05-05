/**
 * Test per gli agenti
 */

import { Test, TestingModule } from '@nestjs/testing';
import { SearchAgent } from '@agents/search.agent';
import { ToolsModule } from '@tools/tools.module';

describe('SearchAgent', () => {
  let agent: SearchAgent;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ToolsModule],
      providers: [SearchAgent],
    }).compile();

    agent = module.get<SearchAgent>(SearchAgent);
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
