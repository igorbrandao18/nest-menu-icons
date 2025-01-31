import { Controller, Get, Post, Body, Param, Delete, Put, UseInterceptors } from '@nestjs/common';
import { MenuIconsService } from './menu-icons.service';
import type { MenuIcon } from '@prisma/client';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CreateMenuIconDto } from './dto/create-menu-icon.dto';
import { UpdateMenuIconDto } from './dto/update-menu-icon.dto';
import { ResponseInterceptor } from '../interceptors/response.interceptor';

@ApiTags('menu-icons')
@Controller('menu-icons')
@UseInterceptors(ResponseInterceptor)
export class MenuIconsController {
  constructor(private readonly menuIconsService: MenuIconsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all menu icons' })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns an array of menu icons',
    type: [CreateMenuIconDto]
  })
  async findAll(): Promise<MenuIcon[]> {
    return this.menuIconsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a menu icon by id' })
  @ApiParam({ name: 'id', description: 'Menu icon ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns a single menu icon',
    type: CreateMenuIconDto
  })
  @ApiResponse({ status: 404, description: 'Menu icon not found' })
  async findOne(@Param('id') id: string): Promise<MenuIcon> {
    return this.menuIconsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new menu icon' })
  @ApiResponse({ 
    status: 201, 
    description: 'The menu icon has been successfully created',
    type: CreateMenuIconDto
  })
  async create(@Body() menuIcon: CreateMenuIconDto): Promise<MenuIcon> {
    return this.menuIconsService.create(menuIcon);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a menu icon' })
  @ApiParam({ name: 'id', description: 'Menu icon ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'The menu icon has been successfully updated',
    type: CreateMenuIconDto
  })
  @ApiResponse({ status: 404, description: 'Menu icon not found' })
  async update(
    @Param('id') id: string,
    @Body() updateMenuIconDto: UpdateMenuIconDto,
  ): Promise<MenuIcon> {
    return this.menuIconsService.update(id, updateMenuIconDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a menu icon' })
  @ApiParam({ name: 'id', description: 'Menu icon ID' })
  @ApiResponse({ status: 200, description: 'The menu icon has been successfully deleted' })
  @ApiResponse({ status: 404, description: 'Menu icon not found' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.menuIconsService.remove(id);
  }
} 