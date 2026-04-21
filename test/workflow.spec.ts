/**
 * Test per il workflow
 */

import { Test, TestingModule } from '@nestjs/testing';
import { PurchaseWorkflow } from '@workflows/purchase-workflow.service';
import { SearchAgent } from '@agents/search.agent';
import { EvaluationAgent } from '@agents/evaluation.agent';
import { NegotiationAgent } from '@agents/negotiation.agent';
import { DocumentationAgent } from '@agents/documentation.agent';
import { PropertyLocator } from '@tools/property-locator.service';
import { MarketAnalyzer } from '@tools/market-analyzer.service';
import { DocumentChecker } from '@tools/document-checker.service';
import { SearchService } from '@common/search.service';
import { EvaluationService } from '@common/evaluation.service';
import { NegotiationService } from '@common/negotiation.service';
import { Property } from '@models/types';

describe('PurchaseWorkflow', () => {
  let workflow: PurchaseWorkflow;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PurchaseWorkflow,
        SearchAgent,
        EvaluationAgent,
        NegotiationAgent,
        DocumentationAgent,
        PropertyLocator,
        MarketAnalyzer,
        DocumentChecker,
        SearchService,
        EvaluationService,
        NegotiationService,
      ],
    }).compile();

    workflow = module.get<PurchaseWorkflow>(PurchaseWorkflow);
  });

  it('Should be defined', () => {
    expect(workflow).toBeDefined();
  });

  it('Should initialize workflow state', async () => {
    const state = await workflow.start({
      userId: 'user-123',
      preferences: {
        budgetMin: 200000,
        budgetMax: 500000,
        location: 'Milano',
      },
    });

    expect(state.phase).toBe('search');
    expect(state.userId).toBe('user-123');
  });

  it('Should retrieve workflow state', async () => {
    await workflow.start({
      userId: 'user-456',
      preferences: {},
    });

    const state = workflow.getState('user-456');
    expect(state.userId).toBe('user-456');
  });

  it('Should complete search phase', async () => {
    const userId = 'user-search-test';
    await workflow.start({
      userId,
      preferences: {},
    });

    const result = await workflow.search(userId, {
      location: 'Milano',
      budgetMin: 200000,
      budgetMax: 500000,
    });

    expect(result.status).toBe('success');
    expect(result.data).toBeDefined();
    expect(workflow.getState(userId).phase).toBe('evaluation');
  });

  it('Should complete evaluation phase', async () => {
    const userId = 'user-eval-test';
    await workflow.start({
      userId,
      preferences: {},
    });

    const mockProperty: Property = {
      id: 'prop-test-001',
      address: 'Via Test, Milano',
      price: 350000,
      area: 120,
      rooms: 3,
      bathrooms: 2,
      yearBuilt: 2015,
      propertyType: 'apartment',
    };

    const result = await workflow.evaluate(userId, mockProperty);

    expect(result.status).toBe('success');
    expect(result.data).toBeDefined();
    expect(workflow.getState(userId).phase).toBe('negotiation');
  });

  it('Should progress phases sequentially across agents', async () => {
    const userId = 'user-sequential-phase-test';
    await workflow.start({
      userId,
      preferences: {},
    });

    const searchResult = await workflow.search(userId, {
      location: 'Milano',
      budgetMin: 200000,
      budgetMax: 500000,
    });
    expect(searchResult.status).toBe('success');
    expect(workflow.getState(userId).phase).toBe('evaluation');

    const selectedProperty = ((searchResult.data as { properties?: Property[] })?.properties || [])[0];
    expect(selectedProperty).toBeDefined();

    await workflow.evaluate(userId, selectedProperty);
    expect(workflow.getState(userId).phase).toBe('negotiation');

    await workflow.negotiate(userId, selectedProperty);
    expect(workflow.getState(userId).phase).toBe('documentation');

    const documentationResult = await workflow.manageDocumentation(
      userId,
      selectedProperty.propertyType,
      'italy',
      ['Certificato di proprietà'],
    );
    expect(documentationResult.status).toBe('success');
    expect(workflow.getState(userId).phase).toBe('completed');
  });

  it('Should generate progress history', async () => {
    const userId = 'user-history-test';
    await workflow.start({
      userId,
      preferences: {},
    });

    const progress = workflow.getProgress(userId);
    expect(progress.length).toBeGreaterThan(0);
    expect(progress[0].phase).toBe('setup');
  });

  it('Should complete workflow', async () => {
    const userId = 'user-complete-test';
    await workflow.start({
      userId,
      preferences: {},
    });

    const state = await workflow.complete(userId);
    expect(state.phase).toBe('completed');
  });

  it('Should reset workflow', async () => {
    const userId = 'user-reset-test';
    await workflow.start({
      userId,
      preferences: {},
    });

    workflow.reset(userId);

    expect(() => workflow.getState(userId)).toThrow();
  });
});
