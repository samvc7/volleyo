export const addDateRangeToUrl = (url: string, from?: string, to?: string) => {
  if (!from || !to) return url
  return `${url}?from=${from}&to=${to}`
}
