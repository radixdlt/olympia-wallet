import { Message } from '@radixdlt/application'

export const decodeMessage = (message: string): string | false => {
  const FAILED_MSG = '<Failed to interpret message>'

  // Check format
  if (!/^(00|01|30)[0-9a-fA-F]+$/.test(message)) return FAILED_MSG

  try {
    if (Message.isHexEncoded(message)) {
      const decoded = Message.plaintextToString(
        Buffer.from(message, 'hex'),
        0
      )

      return Message.isPlaintext(decoded)
        ? Message.plaintextToString(Buffer.from(decoded, 'hex'))
        : decoded
    }

    return Message.isPlaintext(message)
      ? Message.plaintextToString(Buffer.from(message, 'hex'))
      : false
  } catch (error) {
    return FAILED_MSG
  }
}

export const isEncrypted = (message: string): boolean => {
  if (!/^(00|01|30)[0-9a-fA-F]+$/.test(message)) return false
  return !Message.isPlaintext(message)
}
