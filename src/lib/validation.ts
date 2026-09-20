/**
 * What a field is checked against, and what it says when it fails.
 *
 * Under the field, in accent, as soon as there is something wrong to point
 * at — and never on a keystroke. Nothing is said about an empty field: the
 * step's own reason line covers "you have not answered"; this covers "that
 * answer is not right", which is the one people cannot see for themselves.
 *
 * The house ships worldwide, so a postal code is checked by the country it
 * is for and otherwise only asked to exist. A Canadian rule applied to a
 * London postcode is a form refusing a real address.
 */

export const isValidEmail = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());

export const emailError = (value: string) =>
  value.trim() && !isValidEmail(value)
    ? "An address with an @ and a domain, so the studio can write back."
    : "";

/** Loose on purpose: digits, at least seven of them, from anywhere. A
 *  courier needs a number that rings, not a number that matches a
 *  pattern. */
export const isValidPhone = (value: string) =>
  value.replace(/\D/g, "").length >= 7 && value.replace(/\D/g, "").length <= 15;

export const phoneError = (value: string) =>
  value.trim() && !isValidPhone(value)
    ? "A number the courier can reach on the day."
    : "";

const POSTAL: Record<string, RegExp> = {
  CA: /^[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z] ?\d[ABCEGHJ-NPRSTV-Z]\d$/i,
  US: /^\d{5}(-\d{4})?$/,
  GB: /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i,
  FR: /^\d{5}$/,
  DE: /^\d{5}$/,
  IT: /^\d{5}$/,
  ES: /^\d{5}$/,
  NL: /^\d{4} ?[A-Z]{2}$/i,
  AU: /^\d{4}$/,
  JP: /^\d{3}-?\d{4}$/,
};

export const isValidPostal = (value: string, country: string) => {
  const v = value.trim();
  if (!v) return false;
  const rule = POSTAL[country.toUpperCase()];
  return rule ? rule.test(v) : v.length >= 3;
};

export const postalError = (value: string, country: string) =>
  value.trim() && !isValidPostal(value, country)
    ? "That does not look like a postal code for this country."
    : "";

/** Where the house sends, in the order the store lists them. The first
 *  group is where most orders go; the rest is alphabetical. */
export const COUNTRIES: readonly { code: string; name: string; region?: string }[] = [
  { code: "US", name: "United States", region: "States and territories" },
  { code: "CA", name: "Canada", region: "Provinces" },
  { code: "GB", name: "United Kingdom" },
  { code: "AU", name: "Australia" },
  { code: "AT", name: "Austria" },
  { code: "BE", name: "Belgium" },
  { code: "DK", name: "Denmark" },
  { code: "FI", name: "Finland" },
  { code: "FR", name: "France" },
  { code: "DE", name: "Germany" },
  { code: "HK", name: "Hong Kong SAR" },
  { code: "IE", name: "Ireland" },
  { code: "IL", name: "Israel" },
  { code: "IT", name: "Italy" },
  { code: "JP", name: "Japan" },
  { code: "MX", name: "Mexico" },
  { code: "NL", name: "Netherlands" },
  { code: "NZ", name: "New Zealand" },
  { code: "NO", name: "Norway" },
  { code: "PT", name: "Portugal" },
  { code: "SG", name: "Singapore" },
  { code: "KR", name: "South Korea" },
  { code: "ES", name: "Spain" },
  { code: "SE", name: "Sweden" },
  { code: "CH", name: "Switzerland" },
  { code: "AE", name: "United Arab Emirates" },
];

/** The dialling code for each country the house sends to, in the same
 *  order and with the same codes as COUNTRIES above. Kept beside that
 *  list rather than derived: there is no rule that turns "AE" into "971",
 *  and a wrong guess here is a number the courier cannot ring. */
export const DIAL_CODES: Readonly<Record<string, string>> = {
  US: "+1",
  CA: "+1",
  GB: "+44",
  AU: "+61",
  AT: "+43",
  BE: "+32",
  DK: "+45",
  FI: "+358",
  FR: "+33",
  DE: "+49",
  HK: "+852",
  IE: "+353",
  IL: "+972",
  IT: "+39",
  JP: "+81",
  MX: "+52",
  NL: "+31",
  NZ: "+64",
  NO: "+47",
  PT: "+351",
  SG: "+65",
  KR: "+82",
  ES: "+34",
  SE: "+46",
  CH: "+41",
  AE: "+971",
};

export const dialCode = (code: string) => DIAL_CODES[code] ?? "";

export const countryName = (code: string) =>
  COUNTRIES.find((c) => c.code === code)?.name ?? code;

/** Delivery estimates by destination. Standard shipping is free everywhere
 *  the house sends; the variable is time, which is why it is said. */
export function transitFor(country: string) {
  switch (country) {
    case "US":
      return "3 to 5 working days";
    case "CA":
      return "4 to 7 working days";
    case "GB":
    case "IE":
    case "FR":
    case "DE":
    case "IT":
    case "ES":
    case "NL":
    case "BE":
    case "AT":
    case "CH":
    case "DK":
    case "FI":
    case "NO":
    case "SE":
    case "PT":
      return "5 to 9 working days";
    default:
      return "7 to 14 working days";
  }
}
