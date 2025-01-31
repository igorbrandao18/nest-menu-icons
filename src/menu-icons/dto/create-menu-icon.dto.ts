import { ApiProperty } from '@nestjs/swagger';
import { AvailableIcons } from '../enums/available-icons.enum';

export class CreateMenuIconDto {
  @ApiProperty({
    description: 'The name of the menu icon',
    example: 'home',
  })
  name: string;

  @ApiProperty({
    description: 'Select an icon from the available options',
    enum: AvailableIcons,
    enumName: 'AvailableIcons',
  })
  icon: AvailableIcons;

  @ApiProperty({
    description: 'The description of the menu icon',
    example: 'Home page icon',
    nullable: true,
  })
  description: string | null = null;

  @ApiProperty({
    description: 'The category of the menu icon',
    example: 'navigation',
    nullable: true,
  })
  category: string | null = null;

  @ApiProperty({
    description: 'Whether the menu icon is active',
    example: true,
    default: true,
  })
  isActive: boolean = true;
} 