export const createRRIUrl = function (rriString: string): string {
  return `${process.env.VUE_APP_EXPLORER}/#/tokens/${rriString}`
}

// Currently we're validating Validator URL by seeing if the first substring
// is https:// or http:// . We may expand on how we validate URL later on.
// If the Validator URL is NOT exploitable, we return true.
export const checkValidatorUrlExploitable = function (url: string | null): boolean {
  if (!url) {
    return false
  }
  const urlFormattedToCheck = url.toLowerCase()
  return urlFormattedToCheck.search('https://') === 0 || urlFormattedToCheck.search('http://') === 0
}
