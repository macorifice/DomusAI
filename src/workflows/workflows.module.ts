/**
 * Modulo Workflows
 */

import { Module } from '@nestjs/common';
import { PurchaseWorkflow } from './purchase-workflow.service';
import { AgentsModule } from '@agents/agents.module';
import { WorkflowsController } from './workflows.controller';
import { WorkflowChecklistService } from './workflow-checklist.service';
import { WorkflowChecklistRepository } from './workflow-checklist.repository';
import { WorkflowStateRepository } from './workflow-state.repository';
import { SupabaseJwtGuard } from '@auth/supabase-jwt.guard';

@Module({
  imports: [AgentsModule],
  providers: [
    PurchaseWorkflow,
    WorkflowChecklistService,
    WorkflowChecklistRepository,
    WorkflowStateRepository,
    SupabaseJwtGuard,
  ],
  controllers: [WorkflowsController],
  exports: [PurchaseWorkflow],
})
export class WorkflowsModule {}
