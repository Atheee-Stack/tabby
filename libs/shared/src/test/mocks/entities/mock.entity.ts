// src/user/entities/user.entity.ts
import { Entity, Property, PrimaryKey } from '@mikro-orm/core';

@Entity()
export class User {
  @PrimaryKey({ type: 'string' }) // 显式指定类型
  _id!: string;

  @Property({ type: 'string' })   // 显式指定类型
  name!: string;

  @Property({ type: 'string' })
  email!: string;
}