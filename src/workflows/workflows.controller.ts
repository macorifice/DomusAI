import { BadRequestException, Body, Controller, Get, NotFoundException, Param, Post } from '@nestjs/common';
import { PurchaseWorkflow } from './purchase-workflow.service';
import { Property } from '@models/types';
import { SearchAgent } from '@agents/search.agent';
import { EvaluationAgent } from '@agents/evaluation.agent';
import { NegotiationAgent } from '@agents/negotiation.agent';
import { DocumentationAgent } from '@agents/documentation.agent';

interface StartWorkflowBody {
  userId?: string;
  preferences?: Record<string, unknown>;
}

interface SearchBody {
  location?: string;
  budgetMin?: number;
  budgetMax?: number;
  propertyType?: string;
  rooms?: number;
  bathrooms?: number;
}

interface DocumentationBody {
  propertyType?: string;
  region?: string;
  documents?: string[];
}

@Controller('workflow')
export class WorkflowsController {
  constructor(
    private readonly workflow: PurchaseWorkflow,
    private readonly searchAgent: SearchAgent,
    private readonly evaluationAgent: EvaluationAgent,
    private readonly negotiationAgent: NegotiationAgent,
    private readonly documentationAgent: DocumentationAgent,
  ) {}

  @Get('agents')
  getAgents() {
    return [
      this.searchAgent.getInfo(),
      this.evaluationAgent.getInfo(),
      this.negotiationAgent.getInfo(),
      this.documentationAgent.getInfo(),
    ];
  }

  @Post('start')
  async start(@Body() body: StartWorkflowBody) {
    const userId = body.userId?.trim() || `user-${Date.now()}`;

    return this.workflow.start({
      userId,
      preferences: body.preferences || {},
    });
  }

  @Post(':id/search')
  async search(@Param('id') userId: string, @Body() body: SearchBody) {
    return this.workflow.search(userId, {
      location: body.location || 'Milano',
      budgetMin: body.budgetMin ?? 200000,
      budgetMax: body.budgetMax ?? 500000,
      propertyType: body.propertyType || 'apartment',
      rooms: body.rooms ?? 3,
      bathrooms: body.bathrooms ?? 2,
    });
  }

  @Post(':id/evaluate')
  async evaluate(@Param('id') userId: string, @Body() body: { property?: Property }) {
    const state = this.getExistingState(userId);
    const fromSearch = state.metadata.searchResults?.properties?.[0] as Property | undefined;
    const property = body.property || fromSearch;

    if (!property) {
      throw new BadRequestException('Nessuna proprietà disponibile: esegui prima la fase di ricerca');
    }

    return this.workflow.evaluate(userId, property);
  }

  @Post(':id/negotiate')
  async negotiate(@Param('id') userId: string, @Body() body: { property?: Property }) {
    const state = this.getExistingState(userId);
    const fromSearch = state.metadata.searchResults?.properties?.[0] as Property | undefined;
    const property = body.property || fromSearch;

    if (!property) {
      throw new BadRequestException('Nessuna proprietà disponibile: esegui prima la fase di ricerca');
    }

    return this.workflow.negotiate(userId, property);
  }

  @Post(':id/documentation')
  async documentation(@Param('id') userId: string, @Body() body: DocumentationBody) {
    return this.workflow.manageDocumentation(
      userId,
      body.propertyType || 'apartment',
      body.region || 'Lombardia',
      body.documents || [],
    );
  }

  @Post(':id/complete')
  async complete(@Param('id') userId: string) {
    return this.workflow.complete(userId);
  }

  @Get(':id/state')
  getState(@Param('id') userId: string) {
    return this.getExistingState(userId);
  }

  @Get(':id/history')
  getHistory(@Param('id') userId: string) {
    return this.workflow.getProgress(userId);
  }

  private getExistingState(userId: string) {
    try {
      return this.workflow.getState(userId);
    } catch {
      throw new NotFoundException(`Workflow non trovato per l'utente ${userId}`);
    }
  }
}
