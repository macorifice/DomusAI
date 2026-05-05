import { Test, TestingModule } from '@nestjs/testing';
import { WorkflowsController } from '@workflows/workflows.controller';
import { PurchaseWorkflow } from '@workflows/purchase-workflow.service';
import { SearchAgent } from '@agents/search.agent';
import { EvaluationAgent } from '@agents/evaluation.agent';
import { NegotiationAgent } from '@agents/negotiation.agent';
import { DocumentationAgent } from '@agents/documentation.agent';
import { ToolsModule } from '@tools/tools.module';
import { CommonModule } from '@common/common.module';
import { EvaluationService } from '@common/evaluation.service';
import { NegotiationService } from '@common/negotiation.service';
import { WorkflowChecklistService } from '@workflows/workflow-checklist.service';
import { WorkflowChecklistRepository } from '@workflows/workflow-checklist.repository';

describe('WorkflowsController checklist endpoint', () => {
  let controller: WorkflowsController;
  let workflow: PurchaseWorkflow;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ToolsModule, CommonModule],
      controllers: [WorkflowsController],
      providers: [
        PurchaseWorkflow,
        SearchAgent,
        EvaluationAgent,
        NegotiationAgent,
        DocumentationAgent,
        EvaluationService,
        NegotiationService,
        WorkflowChecklistService,
        WorkflowChecklistRepository,
      ],
    }).compile();

    controller = module.get<WorkflowsController>(WorkflowsController);
    workflow = module.get<PurchaseWorkflow>(PurchaseWorkflow);
  });

  it('returns mortgage-related checklist after successful search', async () => {
    const userId = 'user-checklist-endpoint-test';
    await workflow.start({
      userId,
      preferences: {
        requiresMortgage: true,
        dealType: 'compromesso',
      },
    });

    await workflow.search(userId, {
      location: 'Milano',
      budgetMin: 200000,
      budgetMax: 500000,
      propertyType: 'apartment',
    });

    const checklist = (await controller.getChecklist(userId)) as {
      steps?: Array<{ id: string; state: string }>;
      meta?: { requiresMortgage?: boolean };
    };

    expect(checklist?.meta?.requiresMortgage).toBe(true);
    expect(checklist.steps?.some((step) => step.id === 'mortgage-suspensive-clause')).toBe(true);
    expect(checklist.steps?.some((step) => step.state === 'available')).toBe(true);
  });

  it('updates step status and reflects done state', async () => {
    const userId = 'user-checklist-status-test';
    await workflow.start({
      userId,
      preferences: { requiresMortgage: true },
    });

    await workflow.search(userId, {
      location: 'Milano',
      budgetMin: 200000,
      budgetMax: 500000,
    });

    const updated = (await controller.setChecklistStepStatus(userId, 'analyze-search-results', {
      done: true,
    })) as { steps?: Array<{ id: string; done: boolean; state: string }> };

    const target = updated.steps?.find((step) => step.id === 'analyze-search-results');
    expect(target?.done).toBe(true);
    expect(target?.state).toBe('done');
  });

  it('rejects status update for locked step', async () => {
    const userId = 'user-checklist-locked-test';
    await workflow.start({
      userId,
      preferences: { requiresMortgage: true },
    });
    await workflow.search(userId, {
      location: 'Milano',
      budgetMin: 200000,
      budgetMax: 500000,
    });

    await expect(
      controller.setChecklistStepStatus(userId, 'collect-documents', {
        done: true,
      }),
    ).rejects.toThrow('Step non disponibile nella fase corrente');
  });

  it('blocks phase progression when mandatory checklist steps are pending', async () => {
    const userId = 'user-checklist-block-phase-test';
    await workflow.start({
      userId,
      preferences: { requiresMortgage: true },
    });
    await workflow.search(userId, {
      location: 'Milano',
      budgetMin: 200000,
      budgetMax: 500000,
    });

    await expect(controller.evaluate(userId, {})).rejects.toThrow(
      'Completa prima gli step obbligatori/raccomandati della fase corrente',
    );
  });
});
