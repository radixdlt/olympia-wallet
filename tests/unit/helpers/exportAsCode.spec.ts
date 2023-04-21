import { accountToExportPayload, exportAsCode, sanitizeName } from '@/helpers/exportAsCode'
import { expect } from 'chai'
import testCases from './import_olympia_wallet_parse_test.json'

describe('accountToExportPayload', () => {
  it('should export as strings', () => {
    const result = accountToExportPayload('H', 'ApjEDv8Q5Hv5P4ka3yqvFLx2COUd+lA1pLc4svbLdZ/E', 0, 'Main account.')
    expect(result).to.equal('H^ApjEDv8Q5Hv5P4ka3yqvFLx2COUd+lA1pLc4svbLdZ/E^0^Main account.}')
  })
})

describe('sanitizeName', () => {
  it('should limit, replace and add end of name character', () => {
    expect(sanitizeName('Main account.')).to.equal('Main account.}')
    expect(sanitizeName('Olympia is a small town in Eli')).to.equal('Olympia is a small town in Eli}')
  })
})

describe('exportAsCode', () => {
  it('correctly exports all accounts and adds headers to payloads', () => {
    testCases.forEach(({ olympiaWallet: { accounts, mnemonic }, payloadSizeThreshold, numberOfPayloads, payloads }) => {
      const data = testAccountsToExports(accounts)
      const mnemonicLength = mnemonic.split(' ').length
      const result = exportAsCode(data, payloadSizeThreshold, mnemonicLength)
      expect(result.length).to.equal(numberOfPayloads)
      expect(result).to.deep.equal(payloads)
    })
  })
})

const testAccountsToExports = (accounts: any) => accounts.map((acc: any) => accountToExportPayload(acc.accountType, acc.pubKey, acc.addressIndex, acc?.name || ''))
