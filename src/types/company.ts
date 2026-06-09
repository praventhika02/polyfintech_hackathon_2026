export type Company = {
  id: string;
  name: string;
  ticker: string;
  exchange?: string;
  country?: string;
  sector?: string;
  marketCap?: number;
  beta?: number;
};

export type CompanyProfile = Company & {
  description?: string;
  website?: string;
  headquarters?: string;
  lastAnalysedAt?: string;
};
