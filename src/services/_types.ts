import { AccountAddressT, ValidatorAddressT, StakePosition, UnstakePosition } from '@radixdlt/application'

export declare type Position = Readonly<{
  address: string;
  validator: ValidatorAddressT;
  stakes: Array<StakePosition>;
  unstakes: Array<UnstakePosition>;
}>;

export declare type HardwareAddress = { address: AccountAddressT; index: number; };
export declare type EncodedHardwareAddress = { address: string; index: number; };
export declare type HardwareDevice = { name: string; addresses: HardwareAddress[]; };
export declare type EncodedHardwareDevice = { name: string; addresses: EncodedHardwareAddress[]; };
