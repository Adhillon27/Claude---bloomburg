export interface UniverseEntry {
  symbol: string
  name: string
  exchange: string
  sector: string
  basePrice: number
}

// Static reference universe the mock data layer simulates against. A live
// data source would fetch this from the provider instead of hardcoding it.
export const UNIVERSE: UniverseEntry[] = [
  { symbol: 'AAPL', name: 'Apple Inc', exchange: 'US Equity', sector: 'Technology', basePrice: 227.5 },
  { symbol: 'MSFT', name: 'Microsoft Corp', exchange: 'US Equity', sector: 'Technology', basePrice: 421.3 },
  { symbol: 'GOOGL', name: 'Alphabet Inc-CL A', exchange: 'US Equity', sector: 'Technology', basePrice: 178.2 },
  { symbol: 'AMZN', name: 'Amazon.com Inc', exchange: 'US Equity', sector: 'Consumer Disc', basePrice: 186.4 },
  { symbol: 'NVDA', name: 'NVIDIA Corp', exchange: 'US Equity', sector: 'Semiconductors', basePrice: 131.8 },
  { symbol: 'TSLA', name: 'Tesla Inc', exchange: 'US Equity', sector: 'Consumer Disc', basePrice: 248.9 },
  { symbol: 'META', name: 'Meta Platforms Inc', exchange: 'US Equity', sector: 'Technology', basePrice: 563.2 },
  { symbol: 'NFLX', name: 'Netflix Inc', exchange: 'US Equity', sector: 'Media', basePrice: 712.6 },
  { symbol: 'AMD', name: 'Adv Micro Devices', exchange: 'US Equity', sector: 'Semiconductors', basePrice: 148.1 },
  { symbol: 'JPM', name: 'JPMorgan Chase & Co', exchange: 'US Equity', sector: 'Financials', basePrice: 214.7 },
  { symbol: 'BAC', name: 'Bank of America Corp', exchange: 'US Equity', sector: 'Financials', basePrice: 41.3 },
  { symbol: 'XOM', name: 'Exxon Mobil Corp', exchange: 'US Equity', sector: 'Energy', basePrice: 118.5 },
  { symbol: 'WMT', name: 'Walmart Inc', exchange: 'US Equity', sector: 'Consumer Staples', basePrice: 82.4 },
  { symbol: 'DIS', name: 'Walt Disney Co', exchange: 'US Equity', sector: 'Media', basePrice: 96.2 },
  { symbol: 'BA', name: 'Boeing Co', exchange: 'US Equity', sector: 'Industrials', basePrice: 178.9 },
  { symbol: 'INTC', name: 'Intel Corp', exchange: 'US Equity', sector: 'Semiconductors', basePrice: 22.6 },
  { symbol: 'CRM', name: 'Salesforce Inc', exchange: 'US Equity', sector: 'Technology', basePrice: 331.4 },
  { symbol: 'PYPL', name: 'PayPal Holdings', exchange: 'US Equity', sector: 'Financials', basePrice: 78.3 },
  { symbol: 'COIN', name: 'Coinbase Global Inc', exchange: 'US Equity', sector: 'Financials', basePrice: 289.7 },
  { symbol: 'PLTR', name: 'Palantir Technologies', exchange: 'US Equity', sector: 'Technology', basePrice: 41.9 },
]

export const DEFAULT_WATCHLIST = UNIVERSE.map((u) => u.symbol)
