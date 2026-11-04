import type { SeedLessonMeta, SeedSource } from "./types";

// Content trust: where each lesson's important claims come from, when it was
// last reviewed, and (for tax) the year its rules apply to. Update reviewedAt
// whenever a lesson is checked again against its sources.

const NCFE: SeedSource = { label: "National Centre for Financial Education (NCFE)", url: "https://ncfe.org.in" };
const RBI: SeedSource = { label: "Reserve Bank of India", url: "https://www.rbi.org.in" };
const RBI_KEHTA_HAI: SeedSource = { label: "RBI Kehta Hai (RBI's awareness site)", url: "https://rbikehtahai.rbi.org.in" };
const NPCI: SeedSource = { label: "NPCI — UPI", url: "https://www.npci.org.in" };
const CYBERCRIME: SeedSource = { label: "National Cyber Crime Reporting Portal (helpline 1930)", url: "https://cybercrime.gov.in" };
const SANCHAR_SAATHI: SeedSource = { label: "Sanchar Saathi — report suspected fraud calls and messages", url: "https://sancharsaathi.gov.in" };
const DICGC: SeedSource = { label: "Deposit Insurance and Credit Guarantee Corporation (DICGC)", url: "https://www.dicgc.org.in" };
const CIBIL: SeedSource = { label: "TransUnion CIBIL", url: "https://www.cibil.com" };
const INCOME_TAX: SeedSource = { label: "Income Tax Department", url: "https://www.incometax.gov.in" };
const EPFO: SeedSource = { label: "Employees' Provident Fund Organisation (EPFO)", url: "https://www.epfindia.gov.in" };
const SEBI_INVESTOR: SeedSource = { label: "SEBI investor website", url: "https://investor.sebi.gov.in" };
const AMFI: SeedSource = { label: "Association of Mutual Funds in India (AMFI)", url: "https://www.amfiindia.com" };

const MOSPI: SeedSource = { label: "Ministry of Statistics (MoSPI) — Consumer Price Index", url: "https://www.mospi.gov.in" };
const NSE: SeedSource = { label: "National Stock Exchange (NSE)", url: "https://www.nseindia.com" };
const BSE: SeedSource = { label: "BSE", url: "https://www.bseindia.com" };

const REVIEWED = "2026-10-09";

export const LESSON_TRUST: Record<string, SeedLessonMeta> = {
  "budgeting-basics": { sources: [NCFE], reviewedAt: REVIEWED },
  "compound-interest": { sources: [NCFE, SEBI_INVESTOR], reviewedAt: REVIEWED },
  "saving-vs-spending": { sources: [NCFE], reviewedAt: REVIEWED },
  "upi-digital-payments": { sources: [NPCI, RBI, CYBERCRIME], reviewedAt: REVIEWED },
  "financial-scams": { sources: [CYBERCRIME, RBI_KEHTA_HAI, SANCHAR_SAATHI], reviewedAt: REVIEWED },
  "bank-accounts": { sources: [RBI, DICGC], reviewedAt: REVIEWED },
  "fd-rd": { sources: [DICGC, RBI, INCOME_TAX], reviewedAt: REVIEWED },
  "cibil-score": { sources: [CIBIL, RBI], reviewedAt: REVIEWED },
  "credit-cards-101": { sources: [RBI, RBI_KEHTA_HAI], reviewedAt: REVIEWED },
  "first-salary-tax": {
    sources: [INCOME_TAX, EPFO],
    reviewedAt: REVIEWED,
    appliesTo: "Tax year 2026-27 (1 April 2026 – 31 March 2027), under the Income-tax Act, 2025",
  },
  "stocks-mutual-funds-fds": { sources: [SEBI_INVESTOR, AMFI], reviewedAt: REVIEWED },
  "sip-starting-early": { sources: [AMFI, SEBI_INVESTOR], reviewedAt: REVIEWED },
  // Added 2026-11-04: Money IQ loans lesson and the InvestSmart track.
  "loans-emis": { sources: [RBI, RBI_KEHTA_HAI, CYBERCRIME], reviewedAt: "2026-11-04" },
  "inflation-purchasing-power": { sources: [RBI, MOSPI, NCFE], reviewedAt: "2026-11-04" },
  "how-stock-market-works": { sources: [SEBI_INVESTOR, NSE, BSE], reviewedAt: "2026-11-04" },
  "index-funds-long-term": { sources: [AMFI, SEBI_INVESTOR], reviewedAt: "2026-11-04" },
  "start-investing-checklist": { sources: [SEBI_INVESTOR, AMFI], reviewedAt: "2026-11-04" },
};
