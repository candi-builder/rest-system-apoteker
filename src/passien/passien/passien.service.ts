import { HttpException, Inject, Injectable, Logger, ValidationError } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { PrismaService } from 'src/common/prisma.service';
import { PassienRequest, PassienResponse } from 'src/model/passien.model';
import { PassienValidation } from './passien.validation';
import { ValidationService } from 'src/common/validation.service';
import { WebResponse } from 'src/model/web.model';

@Injectable()
export class PassienService {
    constructor(
        private validationService: ValidationService,
        private prismaService: PrismaService,
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
      ) {}

      async register(request: PassienRequest): Promise<WebResponse<PassienResponse>> {
        this.logger.debug(`Registering passien ${JSON.stringify(request)}`);
        const registerPassienRequest: PassienRequest =
          this.validationService.validate(PassienValidation.REGISTER_PASSIEN, request);
      
        try {
            
          const existingPassien = await this.prismaService.pasien.findFirst({
            where: {
              nomor_bpjs: registerPassienRequest.nomor_bpjs,
            },
          });

          const checkPoli = await this.prismaService.poli.findFirst({

            where: {
              poli_id: registerPassienRequest.poli_id,
            },
          });

          if (!checkPoli) {
            
            throw new HttpException('Poli tidak ditemukan', 400);
          }

          if (existingPassien) {
           
            throw new HttpException('Nomor BPJS sudah terdaftar', 400);
          }
      
          const passien = await this.prismaService.pasien.create({
            data: {
              ...registerPassienRequest,
              tanggal_lahir: new Date(registerPassienRequest.tanggal_lahir),
            },
          });
      
          return {
            
           
          };
        } catch (error) {
          this.logger.warn(error);
          throw Error(error);
         
        }
      }




}
