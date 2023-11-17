import { Module } from '@nestjs/common';

import { MatchmakingResolver } from './matchmaking.resolver';
import { MatchRepository } from './repository/match.repository';
import { TicketRepository } from './repository/ticket.repository';
import { MatchmakingScheduler } from './schedule/matchmakingScheduler';
import { CreateMatchUseCase } from './useCase/createMatch.usecase';
import { EnqueueTicketUseCase } from './useCase/enqueueTicket.usecase';
import { FinishMatchUseCase } from './useCase/finishMatch.usecase';

@Module({
  providers: [
    // repository
    TicketRepository,
    MatchRepository,
    // usecases
    EnqueueTicketUseCase,
    CreateMatchUseCase,
    FinishMatchUseCase,
    // resolver/scheduler
    MatchmakingResolver,
    MatchmakingScheduler,
  ],
})
export class MatchmakingModule {}
