import { APP_CONFIG, loadConfig } from './env';
import { Global, Module } from '@nestjs/common';

@Global()
@Module({
  providers: [{ provide: APP_CONFIG, useFactory: () => loadConfig() }],
  exports: [APP_CONFIG],
})
export class ConfigModule {}
