import * as migration_20260823_101153 from './20260823_101153';
import * as migration_20260823_130000 from './20260823_130000';
import * as migration_20260823_150000 from './20260823_150000';
import * as migration_20260823_160000 from './20260823_160000';
import * as migration_20260823_170000 from './20260823_170000';
import * as migration_20260823_211500 from './20260823_211500';
import * as migration_20260824_120000 from './20260824_120000';
import * as migration_20260824_130000 from './20260824_130000';

export const migrations = [
  {
    up: migration_20260823_101153.up,
    down: migration_20260823_101153.down,
    name: '20260823_101153'
  },
  {
    up: migration_20260823_130000.up,
    down: migration_20260823_130000.down,
    name: '20260823_130000'
  },
  {
    up: migration_20260823_150000.up,
    down: migration_20260823_150000.down,
    name: '20260823_150000'
  },
  {
    up: migration_20260823_160000.up,
    down: migration_20260823_160000.down,
    name: '20260823_160000'
  },
  {
    up: migration_20260823_170000.up,
    down: migration_20260823_170000.down,
    name: '20260823_170000'
  },
  {
    up: migration_20260823_211500.up,
    down: migration_20260823_211500.down,
    name: '20260823_211500'
  },
  {
    up: migration_20260824_120000.up,
    down: migration_20260824_120000.down,
    name: '20260824_120000'
  },
  {
    up: migration_20260824_130000.up,
    down: migration_20260824_130000.down,
    name: '20260824_130000'
  },
];
