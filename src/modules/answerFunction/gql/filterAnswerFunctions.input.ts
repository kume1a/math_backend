import { Field, ID, InputType } from '@nestjs/graphql';

import { NumberType } from '../../../entities';
import { LastIdPageParamsObject } from '../../../shared/gql';

@InputType()
export class FilterAnswerFunctionsInput extends LastIdPageParamsObject {
  @Field(() => NumberType, { nullable: true })
  numberType: NumberType | null;

  @Field(() => ID, { nullable: true })
  mathSubFieldId: string | null;
}
