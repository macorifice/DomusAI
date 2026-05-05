/**
 * Modulo Workflows
 */

import { Module } from '@nestjs/common';
import { PurchaseWorkflow } from './purchase-workflow.service';
import { AgentsModule } from '@agents/agents.module';
import { WorkflowsController } from './workflows.controller';
import { WorkflowChecklistService } from './workflow-checklist.service';
import { WorkflowChecklistRepository } from './workflow-checklist.repository';

@Module({
  imports: [AgentsModule],
  providers: [PurchaseWorkflow, WorkflowChecklistService, WorkflowChecklistRepository],
  controllers: [WorkflowsController],
  exports: [PurchaseWorkflow],
})
export class WorkflowsModule {}
