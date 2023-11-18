import { join } from 'path';

import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module, ValidationPipe } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { GraphQLModule } from '@nestjs/graphql';
import { ScheduleModule } from '@nestjs/schedule';
import { GraphQLFormattedError } from 'graphql';
import { PostgresDialect } from 'kysely';
import { KyselyModule } from 'nestjs-kysely';

import { createPostgresPool } from '@config/database';
import { EnvModule } from '@config/env';
import { validationExceptionFactory } from '@config/validation';
import { AccountVerificationModule } from '@modules/accountVerification';
import {
  GqlAuthPayloadInterceptor,
  GqlJwtAuthGuard,
  GqlVerifiedEmailValidatorGuard,
  JwtHelperModule,
  AuthenticationModule,
} from '@modules/authentication';
import { MatchmakingModule } from '@modules/matchmaking';
import { MathFieldModule } from '@modules/mathField/mathField.module';
import { ServerTimeModule } from '@modules/serverTime';
import { UserModule } from '@modules/user';
import { TransactionRunnerModule } from '@shared/util';

import { AppController } from './app.controller';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    EnvModule.forRoot(),

    KyselyModule.forRoot({
      dialect: new PostgresDialect({
        pool: createPostgresPool(),
      }),
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      sortSchema: true,
      autoSchemaFile: join(process.cwd(), 'gql/schema.gql'),
      formatError: (formattedError: GraphQLFormattedError) => ({
        message: formattedError.message,
      }),
    }),
    TransactionRunnerModule,

    JwtHelperModule,
    AccountVerificationModule,
    AuthenticationModule,
    UserModule,
    MatchmakingModule,
    ServerTimeModule,
    MathFieldModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        transform: true,
        exceptionFactory: validationExceptionFactory,
      }),
    },
    {
      provide: APP_GUARD,
      useClass: GqlJwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: GqlVerifiedEmailValidatorGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: GqlAuthPayloadInterceptor,
    },
  ],
})
export class AppModule {}
