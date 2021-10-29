export const createRRIUrl = function (rriString: string): string {
  return `${process.env.VUE_APP_EXPLORER}/#/tokens/${rriString}`
}

// Currently we're validating Validator URL by first  having JS URL Constructor catch
// any errors and then seeing if the first substring is https:// or http://. We may
// expand on how we validate URL later on. If the Validator URL is NOT exploitable,
// we return true.
export const checkValidatorUrlExploitable = function (url: string | null): boolean {
  if (!url) {
    return false
  }
  const urlFormattedToCheck = url.toLowerCase()
  // If there are issues creating a URL via JS URL Constructor, we will return as false.
  // This should catch any case not RFC3987 compliant.
  try {
    const urlConstructedByJs = new URL(urlFormattedToCheck)
  } catch {
    return false
  }

  return urlFormattedToCheck.indexOf('https://') === 0 || urlFormattedToCheck.indexOf('http://') === 0
}
