import { Quote } from './quote.model';
import { Symbol } from './symbol.model';

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
  };
