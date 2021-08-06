export const createRRIUrl = function (rriString: string): string {
  return `${process.env.VUE_APP_EXPLORER}/#/tokens/${rriString}`
}
