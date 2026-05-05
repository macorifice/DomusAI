/**
 * Modulo dei Tools
 */

import { Module } from '@nestjs/common';
import { PropertyLocator } from './property-locator.service';
import { MarketAnalyzer } from './market-analyzer.service';
import { DocumentChecker } from './document-checker.service';
import { PROPERTY_DATA_PROVIDER } from './property-provider.port';
import { MockPropertyProvider } from './mock-property.provider';
import { PropertiesController } from './properties.controller';
import { PortalHttpClient } from './providers/portal-http.client';
import { IdealistaProvider } from './providers/idealista.provider';
import { ImmobiliareProvider } from './providers/immobiliare.provider';
import { CasaItProvider } from './providers/casa-it.provider';
import { MultiPortalProvider } from './providers/multi-portal.provider';
import { OpenApiRealEstateProvider } from './providers/openapi-realestate.provider';
import { ListingCacheService } from '@cache/listing-cache.service';
import { ConditionalRulesService } from '@search-rules/conditional-rules.service';
import { ZonePricingService } from './zone-pricing.service';

@Module({
  controllers: [PropertiesController],
  providers: [
    PropertyLocator,
    MarketAnalyzer,
    DocumentChecker,
    PortalHttpClient,
    IdealistaProvider,
    ImmobiliareProvider,
    CasaItProvider,
    MultiPortalProvider,
    OpenApiRealEstateProvider,
    MockPropertyProvider,
    ListingCacheService,
    ConditionalRulesService,
    ZonePricingService,
    {
      provide: PROPERTY_DATA_PROVIDER,
      useExisting: MultiPortalProvider,
    },
  ],
  exports: [PropertyLocator, MarketAnalyzer, DocumentChecker],
})
export class ToolsModule {}
