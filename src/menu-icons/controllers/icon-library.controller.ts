import { Controller, Get, Query } from '@nestjs/common';
import { IconLibraryService, IconInfo } from '../services/icon-library.service';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';

@ApiTags('icons-library')
@Controller('icons-library')
export class IconLibraryController {
  constructor(private readonly iconLibraryService: IconLibraryService) {}

  @Get()
  @ApiOperation({ summary: 'Search for icons' })
  @ApiQuery({
    name: 'collection',
    required: false,
    description: 'Filter icons by collection prefix (e.g., MD, FA, BS)',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search term to filter icons by name or category',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns a list of matching icons',
    type: [Object],
    schema: {
      properties: {
        name: { type: 'string', example: 'FaHome' },
        collection: { type: 'string', example: 'Font Awesome' },
        component: { type: 'string', example: 'FA_FaHome' },
        category: { type: 'string', example: 'Navigation' },
      },
    },
  })
  async searchIcons(
    @Query('collection') collection?: string,
    @Query('search') search?: string,
  ): Promise<IconInfo[]> {
    return this.iconLibraryService.searchIcons(search, collection);
  }

  @Get('collections')
  @ApiOperation({ summary: 'Get all icon collections' })
  @ApiResponse({
    status: 200,
    description: 'Returns a list of available icon collections',
    type: [Object],
    schema: {
      properties: {
        prefix: { type: 'string', example: 'FA' },
        name: { type: 'string', example: 'Font Awesome' },
      },
    },
  })
  async getCollections() {
    return this.iconLibraryService.getCollections();
  }
} 