import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/services/prisma.service';
import { UpdateRecruiterProfileDto } from './dto/recruiter.dto';

@Injectable()
export class RecruitersService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string) {
    const profile = await this.prisma.recruiterProfile.findUnique({
      where: { userId },
      include: {
        company: true,
      },
    });

    if (!profile) {
      throw new NotFoundException('Recruiter profile not found');
    }

    return profile;
  }

  async updateProfile(userId: string, updateDto: UpdateRecruiterProfileDto) {
    const profile = await this.prisma.recruiterProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Recruiter profile not found');
    }

    return this.prisma.recruiterProfile.update({
      where: { userId },
      data: updateDto,
    });
  }
}
