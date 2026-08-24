import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/services/prisma.service';
import { UpdateCandidateProfileDto, AddSkillDto, AddEducationDto, AddExperienceDto } from './dto/candidate.dto';

@Injectable()
export class CandidatesService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string) {
    const profile = await this.prisma.candidateProfile.findUnique({
      where: { userId },
      include: {
        skills: {
          include: { skill: true },
        },
        education: { orderBy: { startDate: 'desc' } },
        workExperience: { orderBy: { startDate: 'desc' } },
        certifications: true,
        languages: true,
      },
    });

    if (!profile) {
      throw new NotFoundException('Candidate profile not found');
    }

    return profile;
  }

  async updateProfile(userId: string, updateDto: UpdateCandidateProfileDto) {
    const profile = await this.prisma.candidateProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Candidate profile not found');
    }

    return this.prisma.candidateProfile.update({
      where: { userId },
      data: updateDto,
    });
  }

  async addSkill(userId: string, skillDto: AddSkillDto) {
    const profile = await this.prisma.candidateProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException('Profile not found');

    // Free text skill entry logic
    const skillName = skillDto.name.trim().toLowerCase();
    
    let skill = await this.prisma.skill.findUnique({
      where: { name: skillName },
    });

    if (!skill) {
      skill = await this.prisma.skill.create({
        data: {
          name: skillName,
          isVerified: false,
        },
      });
    }

    return this.prisma.candidateSkill.upsert({
      where: {
        candidateProfileId_skillId: {
          candidateProfileId: profile.id,
          skillId: skill.id,
        },
      },
      update: {
        level: skillDto.level,
        yearsOfExperience: skillDto.yearsOfExperience,
      },
      create: {
        candidateProfileId: profile.id,
        skillId: skill.id,
        level: skillDto.level,
        yearsOfExperience: skillDto.yearsOfExperience,
      },
      include: { skill: true }
    });
  }

  async removeSkill(userId: string, skillId: string) {
    const profile = await this.prisma.candidateProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException('Profile not found');

    await this.prisma.candidateSkill.delete({
      where: {
        candidateProfileId_skillId: {
          candidateProfileId: profile.id,
          skillId,
        },
      },
    });
  }

  async addEducation(userId: string, dto: AddEducationDto) {
    const profile = await this.prisma.candidateProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException('Profile not found');

    return this.prisma.education.create({
      data: {
        ...dto,
        startDate: new Date(dto.startDate),
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        candidateProfileId: profile.id,
      },
    });
  }

  async removeEducation(userId: string, educationId: string) {
    const profile = await this.prisma.candidateProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException('Profile not found');

    await this.prisma.education.deleteMany({
      where: {
        id: educationId,
        candidateProfileId: profile.id,
      },
    });
  }

  async addExperience(userId: string, dto: AddExperienceDto) {
    const profile = await this.prisma.candidateProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException('Profile not found');

    return this.prisma.workExperience.create({
      data: {
        ...dto,
        startDate: new Date(dto.startDate),
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        candidateProfileId: profile.id,
      },
    });
  }

  async removeExperience(userId: string, experienceId: string) {
    const profile = await this.prisma.candidateProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException('Profile not found');

    await this.prisma.workExperience.deleteMany({
      where: {
        id: experienceId,
        candidateProfileId: profile.id,
      },
    });
  }
}
