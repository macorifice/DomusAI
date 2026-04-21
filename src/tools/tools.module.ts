/**
 * Modulo dei Tools
 */

import { Module } from '@nestjs/common';
import { PropertyLocator } from './property-locator.service';
import { MarketAnalyzer } from './market-analyzer.service';
import { DocumentChecker } from './document-checker.service';

@Module({
  providers: [PropertyLocator, MarketAnalyzer, DocumentChecker],
  exports: [PropertyLocator, MarketAnalyzer, DocumentChecker],
})
export class ToolsModule {}
