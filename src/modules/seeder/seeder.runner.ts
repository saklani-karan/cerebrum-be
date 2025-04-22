import { Injectable, Logger } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { InjectEntityManager } from '@nestjs/typeorm';
import { Transactional } from '@utils/transaction';
import IntegrationAndToolSeeder from './scripts/integration-and-tool';
import { AbstractSeederService } from './types';

@Injectable()
export class SeederRunner extends Transactional {
    private readonly logger: Logger;
    constructor(
        @InjectEntityManager() manager: EntityManager,
        private readonly integrationAndToolSeeder: IntegrationAndToolSeeder,
    ) {
        super(manager);
        this.logger = new Logger(this.constructor.name);
    }

    async run() {
        return this.runTransaction(async (manager) => {
            this.logger.log('Running seeder runner');
            const seeders = await this.resolveSeeders();
            this.logger.log(`Found ${seeders.length} seeders`);
            for (const seeder of seeders) {
                this.logger.log(`Running seeder ${seeder.constructor.name}`);
                try {
                    await seeder.run();
                } catch (error) {
                    this.logger.error(`Seeder ${seeder.constructor.name} failed`, error);
                }
                this.logger.log(`Seeder ${seeder.constructor.name} completed`);
            }
            this.logger.log('Seeder runner completed');
        });
    }

    async resolveSeeders(): Promise<AbstractSeederService[]> {
        return [this.integrationAndToolSeeder];
    }
}
