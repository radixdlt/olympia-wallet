const END__OF_HEADER = ']'
const INTRA_SEPARATOR = '^'
const INTER_SEPARATOR = '~'
const END_OF_ACCOUNT_NAME = '}'

const FORBIDDEN_CHARACTERS = [END__OF_HEADER, INTRA_SEPARATOR, INTER_SEPARATOR, END_OF_ACCOUNT_NAME]
const ACCOUNT_NAME_REPLACEMENT = '_'

type AccountType = 'H' | 'S'

export const accountToExportPayload = (accountType: AccountType, publicKey: string, addressIndex: number, name: string): string => {
  return [accountType, publicKey, addressIndex, sanitizeName(name)].join(INTRA_SEPARATOR)
}

export const exportAsCode = (accounts: string[], payloadSize: number, mnemonicLength: number): string[] => {
  const allAccounts = accounts.join(INTER_SEPARATOR)
  const payloadsWithoutHeaders = allAccounts.match(new RegExp(`.{1,${payloadSize}}`, 'g')) || []
  const payloadTotal = payloadsWithoutHeaders.length
  return payloadsWithoutHeaders.map((payload, index) => {
    return `${payloadTotal}${INTRA_SEPARATOR}${index}${INTRA_SEPARATOR}${mnemonicLength}${END__OF_HEADER}${payload}`
  })
}

export const compressPublicKeyToHex = (publicKey: string) : string => {
  return Buffer.from(publicKey, 'hex').toString('base64')
}

export const sanitizeName = (name: string): string => {
  const limitedName = name.substring(0, 30)
  const replacedName = FORBIDDEN_CHARACTERS.reduce((acc, forbidden) => acc.replace(forbidden, ACCOUNT_NAME_REPLACEMENT), limitedName)
  return `${replacedName}${END_OF_ACCOUNT_NAME}`
}
