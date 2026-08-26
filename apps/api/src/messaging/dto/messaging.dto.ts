import {
  IsString,
  IsOptional,
  IsUUID,
  IsArray,
  ArrayMinSize,
  MaxLength,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';

export class CreateConversationDto {
  @ApiProperty({
    description: 'User IDs of the other participants in the conversation',
    type: [String],
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  participantIds: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional({ description: 'Optional first message to send' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  initialMessage?: string;
}

export class SendMessageDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  attachmentUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  attachmentName?: string;
}

export class ConversationFilterDto extends PaginationQueryDto {}

export class MessageFilterDto extends PaginationQueryDto {}
