import { Quote } from './quote.model';
import { Symbol } from './symbol.model';
import type { QuoteEvidence } from '../data/market-data/market-data.types';

export type Profile = Partial<Symbol> &
  Partial<Quote> & {
    companyName?: string;
    industry?: string;
    website?: string;
    description?: string;
    ceo?: string;
    sector?: string;
    country?: string;
    fullTimeEmployees?: string;
    phone?: string;
    address?: string;
    image?: string;
    quoteEvidence?: QuoteEvidence;
    quoteMessage?: string;
  };
