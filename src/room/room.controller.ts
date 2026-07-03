import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
} from '@nestjs/common';
import { RoomService } from './room.service';
import { createRoomSchema, type CreateRoomDto } from './dto/create-room.dto';

@Controller('room')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Post()
  create(@Body() createRoomDto: CreateRoomDto) {
    const validatedData = createRoomSchema.parse(createRoomDto);
    return this.roomService.create(validatedData);
  }

  @Get()
  findAll() {
    return this.roomService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.roomService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateRoomDto: CreateRoomDto) {
    const validatedData = createRoomSchema.parse(updateRoomDto);
    return this.roomService.update(id, validatedData);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.roomService.remove(id);
  }
}
