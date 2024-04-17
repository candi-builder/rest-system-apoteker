import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommonModule } from './common/common.module';
import { UserManagementModule } from './user-management/user-management.module';
import { UserModule } from './user/user.module';
import { PassienModule } from './passien/passien.module';

@Module({
  imports: [CommonModule, UserModule, UserManagementModule, PassienModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
