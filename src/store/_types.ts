import { ValidatorAddressT, StakePosition, UnstakePosition } from '@radixdlt/application'

export declare type Position = Readonly<{
  address: string;
  validator: ValidatorAddressT;
  stakes: Array<StakePosition>;
  unstakes: Array<UnstakePosition>;
}>;
