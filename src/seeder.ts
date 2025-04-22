import { SeederRunner } from './modules/seeder/seeder.runner';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const seederRunner = app.get(SeederRunner);

    await seederRunner.run();

    process.exit(1);
}

bootstrap().catch((error) => {
    console.error('Seeding failed!', error);
    process.exit(1);
});
