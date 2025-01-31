import { ApiProperty } from '@nestjs/swagger';
import { CreateMenuIconDto } from './create-menu-icon.dto';
import { AvailableIcons } from '../enums/available-icons.enum';

export class UpdateMenuIconDto implements Partial<CreateMenuIconDto> {
  @ApiProperty({
    description: 'The name of the menu icon',
    example: 'home',
    required: false,
  })
  name?: string;

  @ApiProperty({
    description: 'Select an icon from the available options',
    enum: AvailableIcons,
    enumName: 'AvailableIcons',
    required: false,
  })
  icon?: AvailableIcons;

  @ApiProperty({
    description: 'The description of the menu icon',
    example: 'Home page icon',
    required: false,
    nullable: true,
  })
  description?: string | null;

  @ApiProperty({
    description: 'The category of the menu icon',
    example: 'navigation',
    required: false,
    nullable: true,
  })
  category?: string | null;

  @ApiProperty({
    description: 'Whether the menu icon is active',
    example: true,
    required: false,
  })
  isActive?: boolean;
} 