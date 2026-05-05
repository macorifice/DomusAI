import { Body, Controller, Get, NotFoundException, Param, Post } from '@nestjs/common';
import { PropertyLocator } from './property-locator.service';
import { SearchPropertyDto } from '@common/dtos';

@Controller('properties')
export class PropertiesController {
  constructor(private readonly propertyLocator: PropertyLocator) {}

  @Post('search')
  async search(@Body() body: SearchPropertyDto) {
    return this.propertyLocator.searchDetailed({
      location: body.location,
      budgetMin: body.budgetMin,
      budgetMax: body.budgetMax,
      propertyType: body.propertyType,
      rooms: body.rooms,
      bathrooms: body.bathrooms,
      amenities: body.amenities,
      radius: body.radius,
      maxPricePerSqm: body.maxPricePerSqm,
      maxRenovatedPrice: body.maxRenovatedPrice,
      maxToRenovatePrice: body.maxToRenovatePrice,
    });
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    const property = await this.propertyLocator.getPropertyDetails(id);
    if (!property) {
      throw new NotFoundException(`Proprieta' non trovata: ${id}`);
    }
    return property;
  }
}
