import {
  EventSubscriber,
  EntitySubscriberInterface,
  DataSource,
  RemoveEvent,
} from 'typeorm';
import { ConfigEntity } from '../entities/config.entity';
import { existsSync } from 'node:fs';
import { rm } from 'node:fs/promises';

@EventSubscriber()
export class ConfigSubscriber
  implements EntitySubscriberInterface<ConfigEntity>
{
  constructor(private readonly dataSource: DataSource) {
    this.dataSource.subscribers.push(this);
  }

  listenTo() {
    return ConfigEntity;
  }

  async afterRemove(event: RemoveEvent<ConfigEntity>): Promise<void> {
    if (!event.entity) return;

    if (!existsSync(event.entity.fullPath)) return;

    await rm(event.entity.fullPath);
  }
}
