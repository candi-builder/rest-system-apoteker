import { Injectable } from '@nestjs/common';
import { Status } from '@prisma/client';
import { PrismaService } from 'src/common/prisma.service';
import { BaseResponse, PaginationData } from 'src/model/BaseResponse.model';
import { AntrianResponse } from 'src/model/antrian.model';
import { Utils } from 'src/utils/utils';

@Injectable()
export class AntrianService {
  constructor(private prismaService: PrismaService) {}

  async getAntrianDocter(
    page: number,
    size: number = 10,
    doctor: string,
  ): Promise<BaseResponse<AntrianResponse[]>> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const totalCount = await this.prismaService.antrian.count({
      where: {
        poli: {
          user_id: doctor,
        },
        tanggal: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
        OR: [
          {
            status: 'WAITING',
          },
          {
            status: 'CHECKING',
          },
        ],
      },
    });
    const totalPages = Math.ceil(totalCount / size);
    const data = await this.prismaService.antrian.findMany({
      skip: (page - 1) * size,
      take: size,
      where: {
        poli: {
          user_id: doctor,
        },
        tanggal: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
      },
      select: {
        passien: {
          select: {
            nomor_bpjs: true,
            nama_passien: true,
          },
        },
        poli: {
          select: {
            user: {
              select: {
                username: true,
              },
            },
            poli: {
              select: {
                poli_name: true,
              },
            },
          },
        },
        status: true,
        tanggal: true,
      },
    });

    const paginationData: PaginationData = {
      page,
      size,
      total_page: totalPages,
      total_data: totalCount,
    };
    const AntrianResponse: AntrianResponse[] = data.map((antrian) => ({
      nomor_bpjs: antrian.passien.nomor_bpjs,
      nama_passien: antrian.passien.nama_passien,
      dokter: antrian.poli.user.username,
      poli: antrian.poli.poli.poli_name,
      status: antrian.status,
    }));

    return {
      data: AntrianResponse,
      pagination: paginationData,
      status_code: 200,
      message: 'success',
    };
  }

  async getAntrianPickup(
    page: number,
    size: number = 10,
  ): Promise<BaseResponse<AntrianResponse[]>> {
    const totalCount = await this.prismaService.antrian.count(

    );
    const totalPages = Math.ceil(totalCount / size);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const data = await this.prismaService.resep.findMany({
      skip: (page - 1) * size,
      take: size,
      select:{
        hasil_diagnosa:true,
        keterangan_resep:true,
        tanggal_resep:true,
        pasien:{
          select:{
            nomor_bpjs:true,
            nama_passien:true,
            Antrian:{
              where: {
                tanggal: {
                  gte: today,
                  lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
                },
                status: "PICKUP"
              },
              select: {
                poli: {
                  select: {
                    user: {
                      select: {
                        username: true,
                      },
                    },
                    poli: {
                      select: {
                        poli_name: true,
                      },
                    },
                  },
                },
                status: true,
                tanggal: true,
              },
            }
          }
        }
      }
    });
    const paginationData: PaginationData = {
      page,
      size,
      total_page: totalPages,
      total_data: totalCount,
    };
    const antrianResponses: AntrianResponse[] = [];

    data.forEach((resep) => {
        resep.pasien.Antrian.forEach((antrian) => {
            const response: AntrianResponse = {
                nomor_bpjs: resep.pasien.nomor_bpjs,
                nama_passien: resep.pasien.nama_passien,
                dokter: antrian.poli.user.username,
                poli: antrian.poli.poli.poli_name,
                status: antrian.status,
                hasil_diagnosa: resep.hasil_diagnosa,
                keterangan_resep: resep.keterangan_resep,
            };
    
            antrianResponses.push(response);
        });
    });
    
    return {
      data: antrianResponses,
      pagination: paginationData,
      status_code: 200,
      message: 'success',
    };
  }

  async updateStatus(
    antrianId:number,
    status:Status,
  ):Promise<BaseResponse<string>>{
    const antrianToUpdate = await this.prismaService.antrian.findUnique(
      {
        where:{
          id:Number(antrianId)
        }
      }
    )
    if (!antrianToUpdate) {
      return{
        status_code:404,
        message:"antrian tidak ditemukan"
      }
    }
    await this.prismaService.antrian.update(
      {
        where:{
          id:Number(antrianId)
        },
        data:{
          status:status
        }
      }
    )
    return {
      status_code:201,
      message:`Beharhasil Mengubah status ke ${status}`
    }
  }
}