import { BaseService } from '@modules/base/base.service';
import { Skill } from './skill.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

export class SkillService extends BaseService<Skill> {
    constructor(@InjectRepository(Skill) repository: Repository<Skill>) {
        super(repository);
    }
}
