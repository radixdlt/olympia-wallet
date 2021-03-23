export interface RadixServiceI {
  generateMnemonic(): Array<string>;
}

export default class RadixService implements RadixServiceI {
  generateMnemonic (): string[] {
    return [
      'special', 'cheap', 'poverty', 'alert', 'minute', 'behave', 'pride', 'step', 'radio', 'sugar', 'kidney', 'smoke'
    ]
  }
}
