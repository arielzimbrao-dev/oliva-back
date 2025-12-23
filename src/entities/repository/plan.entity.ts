import { Inject, Injectable } from "@nestjs/common";
import { Repository, FindOneOptions, FindManyOptions } from "typeorm";
import { Plan } from "../plan.entity";
import { BaseRepository } from "../../common/repository/base.repository";

@Injectable()
export class PlanRepository {
  private base: BaseRepository<Plan>;

  constructor(
    @Inject('PLAN_REPOSITORY')
    private readonly planRepository: Repository<Plan>,
  ) {
    this.base = new BaseRepository<Plan>(this.planRepository);
  }

  findAll(options?: FindManyOptions<Plan>) {
    return this.base.findAll(options);
  }

  findOne(options: FindOneOptions<Plan>) {
    return this.base.findOne(options);
  }

  findOneById(id: string) {
    return this.base.findOneById(id);
  }

  create(entity: Partial<Plan>) {
    return this.base.create(entity);
  }

  save(entity: Plan) {
    return this.base.save(entity);
  }

  update(id: string, partial: Partial<Plan>) {
    return this.base.update(id, partial);
  }

  softDelete(id: string) {
    return this.base.softDelete(id);
  }
}