import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma.service';
import { BaseResponse, PaginationData } from 'src/model/BaseResponse.model';
import { UserResponse } from 'src/model/UserManagement.model';

@Injectable()
export class UserManagementService {
  constructor(private prismaService: PrismaService) {}

  async getAllUsers(
    page: number,
    size: number,
  ): Promise<BaseResponse<UserResponse[]>> {
    const totalCount = await this.prismaService.user.count();
    const totalPages = Math.ceil(totalCount / size);

    const users = await this.prismaService.user.findMany({
      skip: (page - 1) * size,
      take: size,
      select: {
        uuid: true,
        username: true,
        full_name: true,
        roles: true,
      },
    });

    const userResponses: UserResponse[] = users.map((user) => ({
      uuid: user.uuid,
      username: user.username,
      fullname: user.full_name,
      role: user.roles,
    }));

    const paginationData: PaginationData = {
      page,
      size,
      total_page: totalPages,
      total_data: totalCount,
    };

    return {
      data: userResponses,
      pagination: paginationData,
      status_code: 200,
      message: 'success',
    };
  }

  async getDetailUser(uuid: string): Promise<BaseResponse<UserResponse>> {
    const user = await this.prismaService.user.findUnique({
      where: {
        uuid: uuid,
      },
    });
    if (!user) {
      return {
        data: null,
        status_code: 404,
        message: 'user tidak ditemukan',
      };
    }
    const userResponses: UserResponse = {
      uuid: user.uuid,
      username: user.username,
      role: user.roles,
      fullname: user.full_name,
    };

    return {
      data: userResponses,
      status_code: 200,
      message: 'success',
    };
  }

  async deleteUser(uuid: string): Promise<BaseResponse<string>> {
    try {
      const deleteUser = await this.prismaService.user.delete({
        where: {
          uuid: uuid,
        },
      });

      if (!deleteUser) {
        return {
          data: null,
          status_code: 400,
          message: 'Gagal menghapus user',
        };
      }

      return {
        data: null,
        status_code: 200,
        message: `Berhasil menghapus ${deleteUser.full_name}`,
      };
    } catch (error) {
      return {
        data: null,
        status_code: 500,
        message: `Gagal menghapus user: ${error.message}`,
      };
    }
  }
}