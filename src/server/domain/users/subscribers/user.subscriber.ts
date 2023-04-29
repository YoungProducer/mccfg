import path from 'node:path';
import { rm } from 'node:fs/promises';
import { existsSync, renameSync } from 'node:fs';
import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  RemoveEvent,
  UpdateEvent,
} from 'typeorm';
import { Inject } from '@nestjs/common';

import { DI_CONFIG } from 'server/config/constants';
import { EnvConfig } from 'server/config/interfaces';
import { safeMkdir } from 'server/utils/safe-mkdir';
import { UserEntity } from '../entities/user.entity';

@EventSubscriber()
export class UserSubscriber implements EntitySubscriberInterface<UserEntity> {
  constructor(
    @Inject(DI_CONFIG)
    private readonly config: EnvConfig,

    private dataSource: DataSource,
  ) {
    this.dataSource.subscribers.push(this);
  }

  listenTo() {
    return UserEntity;
  }

  private getUserUploadsPath(entity: UserEntity): string {
    return path.join(
      process.cwd(),
      this.config.FILE_UPLOAD_DIR,
      entity.username,
    );
  }

  async afterInsert(event: InsertEvent<UserEntity>): Promise<void> {
    const dirPath = path.join(this.getUserUploadsPath(event.entity), 'configs');

    await safeMkdir(dirPath);
  }

  async beforeRemove(event: RemoveEvent<UserEntity>): Promise<void> {
    if (!event.databaseEntity) return;

    const dirPath = path.join(this.getUserUploadsPath(event.databaseEntity));

    if (!existsSync(dirPath)) return;

    await rm(dirPath, {
      recursive: true,
    });
  }

  async afterUpdate(event: UpdateEvent<UserEntity>): Promise<void> {
    const dbEntity = event.databaseEntity;
    const entity = event.entity;

    if (dbEntity?.username && entity?.username) {
      const oldDir = path.join(this.getUserUploadsPath(dbEntity));
      const newDir = path.join(this.getUserUploadsPath(<UserEntity>entity));

      if (oldDir !== newDir && existsSync(oldDir)) {
        renameSync(oldDir, newDir);
      }
    }
  }
}
