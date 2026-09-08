import { cookies } from "next/headers";
import { getSettings } from "@/lib/data";
import {
  dictionaries,
  isLocale,
  LOCALE_COOKIE,
  type Dict,
  type Locale,
} from "@/lib/i18n";

export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const fromCookie = store.get(LOCALE_COOKIE)?.value;
  if (isLocale(fromCookie)) return fromCookie;
  try {
    const s = await getSettings();
    if (isLocale(s.default_locale)) return s.default_locale;
  } catch {
    /* noop */
  }
  return "es";
}

export async function getDict(): Promise<Dict> {
  const locale = await getLocale();
  return dictionaries[locale];
}
