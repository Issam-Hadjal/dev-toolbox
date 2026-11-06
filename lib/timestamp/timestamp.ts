/**
 * Pure conversion logic for the timestamp converter tool.
 *
 * Nothing here touches React or the browser: the tool's page only wires these
 * functions to its form. The interface speaks French, so every error message
 * below is in French. Code, identifiers and file names stay in English.
 */

export type TimestampUnit = "secondes" | "millisecondes";

export interface TimestampDate {
  /** Unit the input was read as: seconds below the threshold, milliseconds from it. */
  unit: TimestampUnit;
  /** The instant in ISO 8601 UTC, as returned by `Date.prototype.toISOString()`. */
  isoUtc: string;
  /** The same instant in Paris time, formatted via `Intl.DateTimeFormat`. */
  paris: string;
}

export interface TimestampValue {
  seconds: number;
  milliseconds: number;
}

/**
 * Absolute values strictly below this threshold are read as seconds; from it
 * (and above) as milliseconds.
 */
const SECONDS_THRESHOLD = 100_000_000_000;

/** A decimal integer, optionally signed, with no exponent or decimal point. */
const INTEGER_RE = /^[+-]?\d+$/;

const PARIS_FORMATTER = new Intl.DateTimeFormat("fr-FR", {
  timeZone: "Europe/Paris",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
  timeZoneName: "short",
});

/** A date and time with a mandatory timezone: `Z` or `±hh:mm`. */
const ISO_RE =
  /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?(Z|[+-]\d{2}:\d{2})$/i;

/** A date (with or without time) missing any timezone, for its own error. */
const DATETIME_WITHOUT_TZ_RE =
  /^\d{4}-\d{2}-\d{2}(?:[T ]\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?)?$/i;

const NOT_AN_INTEGER = "L'entrée n'est pas un entier valide.";
const OUT_OF_RANGE = "L'horodatage est hors de la plage de dates valides.";
const MISSING_TIMEZONE = "La date doit comporter un fuseau horaire (Z ou ±hh:mm).";
const INVALID_DATE = "La date n'est pas une date ISO 8601 valide avec fuseau.";

const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

function isLeapYear(year: number): boolean {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

function daysInMonth(year: number, month: number): number {
  if (month === 2 && isLeapYear(year)) {
    return 29;
  }
  return DAYS_IN_MONTH[month - 1];
}

/**
 * Converts an integer timestamp to a date.
 *
 * The input is an integer, possibly negative. When its absolute value is
 * strictly below 100 000 000 000 it is read in seconds, otherwise in
 * milliseconds; `unit` reports which one was retained.
 */
export function timestampToDate(input: string): TimestampDate {
  const value = input.trim();
  if (!INTEGER_RE.test(value)) {
    throw new Error(NOT_AN_INTEGER);
  }

  const parsed = Number(value);
  const unit: TimestampUnit =
    Math.abs(parsed) < SECONDS_THRESHOLD ? "secondes" : "millisecondes";
  const milliseconds = unit === "secondes" ? parsed * 1000 : parsed;

  const date = new Date(milliseconds);
  if (Number.isNaN(date.getTime())) {
    throw new Error(OUT_OF_RANGE);
  }

  return {
    unit,
    isoUtc: date.toISOString(),
    paris: PARIS_FORMATTER.format(date),
  };
}

/**
 * Converts an ISO 8601 date with a timezone (`Z` or `±hh:mm`) to a timestamp.
 *
 * Returns the timestamp in seconds (`Math.floor(ms / 1000)`) and in
 * milliseconds. A date without a timezone, or an invalid date, is rejected
 * with a French error message.
 */
export function dateToTimestamp(input: string): TimestampValue {
  const value = input.trim();
  const match = ISO_RE.exec(value);
  if (match === null) {
    if (DATETIME_WITHOUT_TZ_RE.test(value)) {
      throw new Error(MISSING_TIMEZONE);
    }
    throw new Error(INVALID_DATE);
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);
  const second = match[6] === undefined ? 0 : Number(match[6]);
  const fraction = match[7] ?? "";
  const timezone = match[8].toUpperCase();

  const calendarInvalid =
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > daysInMonth(year, month) ||
    hour > 23 ||
    minute > 59 ||
    second > 59;
  if (calendarInvalid) {
    throw new Error(INVALID_DATE);
  }

  let offsetMinutes = 0;
  if (timezone !== "Z") {
    const sign = timezone[0] === "-" ? -1 : 1;
    const offsetHour = Number(timezone.slice(1, 3));
    const offsetMinute = Number(timezone.slice(4, 6));
    if (offsetHour > 23 || offsetMinute > 59) {
      throw new Error(INVALID_DATE);
    }
    offsetMinutes = sign * (offsetHour * 60 + offsetMinute);
  }

  const fractionMillis = Number(fraction.padEnd(3, "0"));

  const date = new Date(0);
  date.setUTCFullYear(year, month - 1, day);
  date.setUTCHours(hour, minute, second, fractionMillis);

  const milliseconds = date.getTime() - offsetMinutes * 60_000;
  const seconds = Math.floor(milliseconds / 1000);

  return { seconds, milliseconds };
}
