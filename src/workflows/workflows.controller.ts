import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtSub } from '@auth/jwt-sub.decorator';
import { Public } from '@auth/public.decorator';
import { SupabaseJwtGuard } from '@auth/supabase-jwt.guard';
import { PurchaseWorkflow } from './purchase-workflow.service';
import { Property } from '@models/types';
import { SearchAgent } from '@agents/search.agent';
import { EvaluationAgent } from '@agents/evaluation.agent';
import { NegotiationAgent } from '@agents/negotiation.agent';
import { DocumentationAgent } from '@agents/documentation.agent';

interface StartWorkflowBody {
  /** @deprecated Ignorato: l'utente è il `sub` del JWT. */
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
  radius?: number;
  amenities?: string[];
  maxPricePerSqm?: number;
  maxRenovatedPrice?: number;
  maxToRenovatePrice?: number;
}

interface DocumentationBody {
  propertyType?: string;
  region?: string;
  documents?: string[];
}

interface ChecklistStepStatusBody {
  done?: boolean;
}

@Controller('workflow')
@UseGuards(SupabaseJwtGuard)
export class WorkflowsController {
  constructor(
    private readonly workflow: PurchaseWorkflow,
    private readonly searchAgent: SearchAgent,
    private readonly evaluationAgent: EvaluationAgent,
    private readonly negotiationAgent: NegotiationAgent,
    private readonly documentationAgent: DocumentationAgent,
  ) {}

  @Public()
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
  async start(@Body() body: StartWorkflowBody, @JwtSub() sub: string) {
    return this.workflow.start({
      userId: sub,
      preferences: body.preferences || {},
    });
  }

  @Post(':id/search')
  async search(@Param('id') paramId: string, @JwtSub() sub: string, @Body() body: SearchBody) {
    const userId = this.ensureRouteUser(paramId, sub);
    return this.workflow.search(userId, {
      location: body.location || 'Milano',
      budgetMin: body.budgetMin ?? 200000,
      budgetMax: body.budgetMax ?? 500000,
      propertyType: body.propertyType || 'apartment',
      rooms: body.rooms ?? 3,
      bathrooms: body.bathrooms ?? 2,
      radius: body.radius ?? 10,
      amenities: body.amenities ?? [],
      maxPricePerSqm: body.maxPricePerSqm,
      maxRenovatedPrice: body.maxRenovatedPrice,
      maxToRenovatePrice: body.maxToRenovatePrice,
    });
  }

  @Post(':id/evaluate')
  async evaluate(@Param('id') paramId: string, @JwtSub() sub: string, @Body() body: { property?: Property }) {
    const userId = this.ensureRouteUser(paramId, sub);
    const state = await this.loadExistingState(userId);
    await this.ensureMandatoryChecklistCompleted(userId);
    const fromSearch = state.metadata.searchResults?.properties?.[0] as Property | undefined;
    const property = body.property || fromSearch;

    if (!property) {
      throw new BadRequestException('Nessuna proprietà disponibile: esegui prima la fase di ricerca');
    }

    return this.workflow.evaluate(userId, property);
  }

  @Post(':id/negotiate')
  async negotiate(@Param('id') paramId: string, @JwtSub() sub: string, @Body() body: { property?: Property }) {
    const userId = this.ensureRouteUser(paramId, sub);
    const state = await this.loadExistingState(userId);
    await this.ensureMandatoryChecklistCompleted(userId);
    const fromSearch = state.metadata.searchResults?.properties?.[0] as Property | undefined;
    const property = body.property || fromSearch;

    if (!property) {
      throw new BadRequestException('Nessuna proprietà disponibile: esegui prima la fase di ricerca');
    }

    return this.workflow.negotiate(userId, property);
  }

  @Post(':id/documentation')
  async documentation(@Param('id') paramId: string, @JwtSub() sub: string, @Body() body: DocumentationBody) {
    const userId = this.ensureRouteUser(paramId, sub);
    await this.ensureMandatoryChecklistCompleted(userId);
    return this.workflow.manageDocumentation(
      userId,
      body.propertyType || 'apartment',
      body.region || 'Lombardia',
      body.documents || [],
    );
  }

  @Post(':id/complete')
  async complete(@Param('id') paramId: string, @JwtSub() sub: string) {
    const userId = this.ensureRouteUser(paramId, sub);
    return this.workflow.complete(userId);
  }

  @Get(':id/state')
  async getStateEndpoint(@Param('id') paramId: string, @JwtSub() sub: string) {
    const userId = this.ensureRouteUser(paramId, sub);
    return this.loadExistingState(userId);
  }

  @Get(':id/history')
  async getHistory(@Param('id') paramId: string, @JwtSub() sub: string) {
    const userId = this.ensureRouteUser(paramId, sub);
    await this.loadExistingState(userId);
    return this.workflow.getProgress(userId);
  }

  @Get(':id/checklist')
  async getChecklist(@Param('id') paramId: string, @JwtSub() sub: string) {
    const userId = this.ensureRouteUser(paramId, sub);
    await this.loadExistingState(userId);
    return this.workflow.getChecklist(userId);
  }

  @Post(':id/checklist/:stepId/status')
  async setChecklistStepStatus(
    @Param('id') paramId: string,
    @Param('stepId') stepId: string,
    @JwtSub() sub: string,
    @Body() body: ChecklistStepStatusBody,
  ) {
    if (typeof body.done !== 'boolean') {
      throw new BadRequestException('Il campo `done` deve essere booleano');
    }

    const userId = this.ensureRouteUser(paramId, sub);
    await this.loadExistingState(userId);
    try {
      return await this.workflow.setChecklistStepStatus(userId, stepId, body.done);
    } catch (error) {
      throw new BadRequestException(error instanceof Error ? error.message : 'Aggiornamento checklist non valido');
    }
  }

  private ensureRouteUser(paramId: string, sub: string): string {
    if (paramId !== sub) {
      throw new ForbiddenException("L'ID nel percorso deve coincidere con l'utente autenticato");
    }
    return sub;
  }

  private async loadExistingState(userId: string) {
    try {
      return await this.workflow.getState(userId);
    } catch {
      throw new NotFoundException(`Workflow non trovato per l'utente ${userId}`);
    }
  }

  private async ensureMandatoryChecklistCompleted(userId: string) {
    const checklist = await this.workflow.getChecklist(userId);
    const blocking = checklist.steps.filter(
      (step) => step.state === 'available' && step.priority !== 'optional' && step.done !== true,
    );

    if (blocking.length === 0) {
      return;
    }

    const blockingTitles = blocking.map((step) => step.title).join(', ');
    throw new BadRequestException(
      `Completa prima gli step obbligatori/raccomandati della fase corrente: ${blockingTitles}`,
    );
  }
}
