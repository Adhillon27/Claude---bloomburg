export type FunctionCode = 'DES' | 'GP' | 'TOP' | 'WEI' | 'HELP' | 'OB' | 'OPT' | 'ECO' | 'ALRT'

const FUNCTION_CODES: FunctionCode[] = ['DES', 'GP', 'TOP', 'WEI', 'HELP', 'OB', 'OPT', 'ECO', 'ALRT']

export interface ParsedCommand {
  symbol?: string
  code?: FunctionCode
  raw: string
}

/**
 * Loosely mimics Bloomberg's "<SECURITY> <FUNCTION> <GO>" grammar:
 *   "AAPL"                -> symbol only
 *   "AAPL US Equity"      -> symbol only (trailing security-type words dropped)
 *   "AAPL DES"            -> symbol + function
 *   "DES" / "TOP" / "HELP"-> function only, applies to current context
 */
export function parseCommand(input: string, knownSymbols: string[]): ParsedCommand {
  const raw = input.trim()
  const tokens = raw.toUpperCase().split(/\s+/).filter(Boolean)
  const known = new Set(knownSymbols)

  let symbol: string | undefined
  let code: FunctionCode | undefined

  for (const token of tokens) {
    if (FUNCTION_CODES.includes(token as FunctionCode)) {
      code = token as FunctionCode
    } else if (known.has(token)) {
      symbol = token
    } else if (!symbol && /^[A-Z.]{1,6}$/.test(token) && token !== 'US' && token !== 'EQUITY') {
      // unrecognized-but-ticker-shaped token: accept optimistically
      symbol = token
    }
  }

  return { symbol, code, raw }
}
