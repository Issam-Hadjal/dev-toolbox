import { describe, expect, it } from "vitest";
import { dateToTimestamp, timestampToDate } from "@/lib/timestamp/timestamp";

describe("timestampToDate", () => {
  it("reads the input in seconds when its absolute value is below 100 000 000 000", () => {
    expect(timestampToDate("0")).toMatchObject({ unit: "secondes" });
    expect(timestampToDate("1")).toMatchObject({ unit: "secondes" });
    expect(timestampToDate("-1")).toMatchObject({ unit: "secondes" });
    expect(timestampToDate("99999999999")).toMatchObject({ unit: "secondes" });
    expect(timestampToDate("-99999999999")).toMatchObject({ unit: "secondes" });
  });

  it("reads the input in milliseconds from 100 000 000 000 upward", () => {
    expect(timestampToDate("100000000000")).toMatchObject({ unit: "millisecondes" });
    expect(timestampToDate("-100000000000")).toMatchObject({ unit: "millisecondes" });
    expect(timestampToDate("100000000001")).toMatchObject({ unit: "millisecondes" });
  });

  it("returns the ISO 8601 UTC date of the instant", () => {
    expect(timestampToDate("0").isoUtc).toBe("1970-01-01T00:00:00.000Z");
    expect(timestampToDate("1").isoUtc).toBe("1970-01-01T00:00:01.000Z");
    expect(timestampToDate("-1").isoUtc).toBe("1969-12-31T23:59:59.000Z");
    expect(timestampToDate("100000000000").isoUtc).toBe(
      new Date(100_000_000_000).toISOString(),
    );
  });

  it("expresses the same instant in Paris time, winter or summer", () => {
    expect(timestampToDate("0").paris).toBe("01/01/1970 01:00:00 UTC+1");
    const summer = String(Date.UTC(2024, 6, 1, 10, 0, 0));
    expect(timestampToDate(summer).paris).toBe("01/07/2024 12:00:00 UTC+2");
  });

  it("rejects anything that is not a valid integer", () => {
    for (const input of ["", "abc", "1.5", "1e10", "0x10", "NaN", "Infinity", "1 000", "+"]) {
      expect(() => timestampToDate(input)).toThrowError(/entier valide/);
    }
  });

  it("rejects an integer outside the range of valid dates instead of crashing", () => {
    expect(() => timestampToDate("99999999999999999999999999")).toThrowError(
      /hors de la plage/,
    );
  });
});

describe("dateToTimestamp", () => {
  it("returns the timestamp in seconds and milliseconds for Z", () => {
    expect(dateToTimestamp("1970-01-01T00:00:00Z")).toEqual({
      seconds: 0,
      milliseconds: 0,
    });
    expect(dateToTimestamp("2024-01-01T12:00:00Z")).toEqual({
      seconds: Math.floor(Date.UTC(2024, 0, 1, 12, 0, 0) / 1000),
      milliseconds: Date.UTC(2024, 0, 1, 12, 0, 0),
    });
  });

  it("applies a positive offset", () => {
    expect(dateToTimestamp("2024-01-01T12:00:00+02:00").milliseconds).toBe(
      new Date("2024-01-01T12:00:00+02:00").getTime(),
    );
  });

  it("applies a negative offset", () => {
    expect(dateToTimestamp("2024-01-01T12:00:00-05:30").milliseconds).toBe(
      new Date("2024-01-01T12:00:00-05:30").getTime(),
    );
  });

  it("keeps fractional seconds", () => {
    expect(dateToTimestamp("1970-01-01T00:00:00.123Z").milliseconds).toBe(123);
    expect(dateToTimestamp("1970-01-01T00:00:00.5Z").milliseconds).toBe(500);
  });

  it("floors the seconds for a negative instant", () => {
    expect(dateToTimestamp("1969-12-31T23:59:59.500Z")).toEqual({
      seconds: -1,
      milliseconds: -500,
    });
  });

  it("accepts a leap day of a leap year", () => {
    expect(() => dateToTimestamp("2024-02-29T00:00:00Z")).not.toThrow();
  });

  it("rejects a date without a timezone", () => {
    for (const input of ["2024-01-01T12:00:00", "2024-01-01", "2024-01-01T12:00"]) {
      expect(() => dateToTimestamp(input)).toThrowError(/fuseau horaire/);
    }
  });

  it("rejects invalid dates and times", () => {
    for (const input of [
      "2024-02-30T00:00:00Z",
      "2023-02-29T00:00:00Z",
      "2024-13-01T00:00:00Z",
      "2024-01-32T00:00:00Z",
      "2024-01-01T25:00:00Z",
      "2024-01-01T12:60:00Z",
      "2024-01-01T12:00:60Z",
      "2024-01-01T12:00:00+25:00",
      "2024-01-01T12:00:00+02:60",
      "not-a-date",
      "",
    ]) {
      expect(() => dateToTimestamp(input)).toThrowError(/date ISO 8601/);
    }
  });
});
