import { Module } from '@nestjs/common';
import { AgentsModule } from './agents/agents.module';
import { WorkflowsModule } from './workflows/workflows.module';
import { ToolsModule } from './tools/tools.module';
import { CommonModule } from './common/common.module';
import { UiModule } from './ui/ui.module';

@Module({
  imports: [CommonModule, ToolsModule, AgentsModule, WorkflowsModule, UiModule],
})
export class AppModule {}
