import { ValidatorAddressT, StakePosition, UnstakePosition } from '@radixdlt/application'

export declare type Position = Readonly<{
  validator: ValidatorAddressT;
  stakes: Array<StakePosition>;
  unstakes: Array<UnstakePosition>;
}>;
