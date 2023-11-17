import { Injectable } from '@nestjs/common';
import { Interval, SchedulerRegistry } from '@nestjs/schedule';

import { EnvService } from '@config/env';
import { TicketState } from '@entities/entityEnums';
import { SelectableTicket } from '@entities/ticket.entity';
import {
  TransactionProvider,
  TransactionRunner,
  groupByToMap,
} from '@shared/util';
import { TimeoutNameFactory } from '@shared/util/timeoutName.factory';

import { TicketRepository } from '../repository/ticket.repository';
import { CreateMatchUseCase } from '../useCase/createMatch.usecase';
import { FinishMatchUseCase } from '../useCase/finishMatch.usecase';

@Injectable()
export class MatchmakingScheduler {
  constructor(
    private readonly ticketRepository: TicketRepository,
    private readonly createMatchUseCase: CreateMatchUseCase,
    private readonly finishMatchUseCase: FinishMatchUseCase,
    private readonly transactionRunner: TransactionRunner,
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly envService: EnvService,
  ) {}

  @Interval(8000)
  async handleTickets(): Promise<void> {
    const processingTickets = await this.ticketRepository.getAll({
      state: TicketState.PROCESSING,
    });

    const ticketsGroupedByMatchFieldId = groupByToMap(
      processingTickets,
      (ticket) => ticket.mathFieldId,
    );

    await this.transactionRunner.runTransaction(async (txProvider) => {
      for (const [mathFieldId, tickets] of ticketsGroupedByMatchFieldId) {
        for (let i = 0; i < tickets.length - 1; i += 2) {
          await this.createMatch({
            ticketA: tickets[i],
            ticketB: tickets[i + 1],
            txProvider,
            mathFieldId,
          });
        }
      }
    });
  }

  private async createMatch({
    ticketA,
    ticketB,
    txProvider,
    mathFieldId,
  }: {
    ticketA: SelectableTicket;
    ticketB: SelectableTicket;
    txProvider: TransactionProvider;
    mathFieldId: string;
  }) {
    const matchCreatedAt = new Date();
    const matchStartAt = new Date(
      matchCreatedAt.getTime() + this.envService.get('MATCH_START_DELAY'),
    );
    const matchEndAt = new Date(
      matchStartAt.getTime() + this.envService.get('MATCH_LIFETIME_MILLIS'),
    );

    const match = await this.createMatchUseCase.call(
      {
        mathFieldId,
        createdAt: matchCreatedAt,
        startAt: matchStartAt,
        endAt: matchEndAt,
      },
      txProvider,
    );

    await Promise.all([
      this.ticketRepository.updateById(
        ticketA.id,
        {
          state: TicketState.COMPLETED,
          matchId: match.id,
        },
        txProvider.get(),
      ),
      this.ticketRepository.updateById(
        ticketB.id,
        {
          state: TicketState.COMPLETED,
          matchId: match.id,
        },
        txProvider.get(),
      ),
    ]);

    const timePassed = Date.now() - match.createdAt.getTime();
    const matchTimeout =
      this.envService.get('MATCH_START_DELAY') +
      this.envService.get('MATCH_LIFETIME_MILLIS') -
      timePassed;

    const timeout = setTimeout(
      () => this.finishMatchUseCase.call(match.id, txProvider),
      matchTimeout,
    );

    this.schedulerRegistry.addTimeout(
      TimeoutNameFactory.finishMatchTimeoutName(match.id),
      timeout,
    );
  }
}
