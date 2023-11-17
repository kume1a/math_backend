import { Injectable } from '@nestjs/common';
import { Transaction } from 'kysely';

import { KyselyDB } from '@config/database';
import { MatchState } from '@entities/entityEnums';
import { DB } from '@entities/entityTypes';
import { NewMatch, SelectableMatch } from '@entities/match.entiry';
import { InjectKysely } from '@packages/kyselyModule';

@Injectable()
export class MatchRepository {
  constructor(@InjectKysely() private readonly db: KyselyDB) {}

  async create(
    params: NewMatch,
    tx: Transaction<DB>,
  ): Promise<SelectableMatch> {
    return (tx ?? this.db)
      .insertInto('matches')
      .values(params)
      .returningAll()
      .executeTakeFirst();
  }

  async updateStateById(
    id: string,
    state: MatchState,
    tx?: Transaction<DB>,
  ): Promise<void> {
    await (tx ?? this.db)
      .updateTable('matches')
      .set({ state })
      .where('id', '=', id)
      .execute();
  }
}
