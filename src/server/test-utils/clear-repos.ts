import { TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';
import { ObjectLiteral, Repository } from 'typeorm';

export const getRepos = (
  module: TestingModule,
  entities: EntityClassOrSchema[],
) =>
  entities.map((entity) =>
    module.get<Repository<ObjectLiteral>>(getRepositoryToken(entity)),
  );

export const resetRepos = (repositories: Repository<ObjectLiteral>[]) => {
  repositories.forEach((repo) => repo.delete({}));
};
