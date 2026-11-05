"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { dateToTimestamp, timestampToDate } from "@/lib/timestamp";
import type { TimestampDate, TimestampValue } from "@/lib/timestamp";

/** Fallback message: lib/timestamp.ts throws `Error` with a French message. */
function messageOf(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Une erreur inattendue s'est produite.";
}

const inputClass =
  "mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 font-mono text-sm " +
  "dark:border-zinc-700 dark:bg-zinc-900";

const submitClass =
  "rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors " +
  "hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300";

const secondaryClass =
  "rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium transition-colors " +
  "hover:border-zinc-400 dark:border-zinc-700 dark:hover:border-zinc-600";

export default function TimestampConverter() {
  const [timestampInput, setTimestampInput] = useState("");
  const [timestampResult, setTimestampResult] = useState<TimestampDate | null>(
    null,
  );
  const [timestampError, setTimestampError] = useState<string | null>(null);

  const [dateInput, setDateInput] = useState("");
  const [dateResult, setDateResult] = useState<TimestampValue | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);

  /** Converts a timestamp value and stores its result or its French error. */
  function applyTimestamp(value: string) {
    try {
      setTimestampResult(timestampToDate(value));
      setTimestampError(null);
    } catch (error) {
      setTimestampResult(null);
      setTimestampError(messageOf(error));
    }
  }

  function convertTimestamp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    applyTimestamp(timestampInput);
  }

  function fillWithNow() {
    const now = Date.now();
    setTimestampInput(String(now));
    applyTimestamp(String(now));
  }

  function convertDate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      setDateResult(dateToTimestamp(dateInput));
      setDateError(null);
    } catch (error) {
      setDateResult(null);
      setDateError(messageOf(error));
    }
  }

  return (
    <div className="mt-10 grid gap-8">
      <section
        aria-labelledby="timestamp-section-title"
        role="region"
        className="rounded-lg border border-zinc-200 p-6 dark:border-zinc-800"
      >
        <h2 id="timestamp-section-title" className="text-lg font-medium">
          Horodatage → date
        </h2>
        <form onSubmit={convertTimestamp} className="mt-4 space-y-4">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label htmlFor="timestamp" className="block text-sm font-medium">
                Horodatage
              </label>
              <input
                id="timestamp"
                type="text"
                inputMode="numeric"
                value={timestampInput}
                onChange={(event) => {
                  setTimestampInput(event.target.value);
                  setTimestampResult(null);
                  setTimestampError(null);
                }}
                placeholder="0"
                className={inputClass}
              />
            </div>
            <button type="button" onClick={fillWithNow} className={secondaryClass}>
              Maintenant
            </button>
          </div>
          <button type="submit" className={submitClass}>
            Convertir
          </button>
          {timestampError !== null && (
            <p role="alert" className="text-sm text-red-600 dark:text-red-400">
              {timestampError}
            </p>
          )}
          {timestampResult !== null && (
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
              <dt className="text-zinc-500">Unité</dt>
              <dd>{timestampResult.unit}</dd>
              <dt className="text-zinc-500">Date (UTC)</dt>
              <dd className="font-mono">{timestampResult.isoUtc}</dd>
              <dt className="text-zinc-500">Date (Paris)</dt>
              <dd className="font-mono">{timestampResult.paris}</dd>
            </dl>
          )}
        </form>
      </section>

      <section
        aria-labelledby="date-section-title"
        role="region"
        className="rounded-lg border border-zinc-200 p-6 dark:border-zinc-800"
      >
        <h2 id="date-section-title" className="text-lg font-medium">
          Date → horodatage
        </h2>
        <form onSubmit={convertDate} className="mt-4 space-y-4">
          <div>
            <label htmlFor="date" className="block text-sm font-medium">
              Date (ISO 8601, avec fuseau)
            </label>
            <input
              id="date"
              type="text"
              value={dateInput}
              onChange={(event) => {
                setDateInput(event.target.value);
                setDateResult(null);
                setDateError(null);
              }}
              placeholder="2024-01-01T12:00:00Z"
              className={inputClass}
            />
          </div>
          <button type="submit" className={submitClass}>
            Convertir
          </button>
          {dateError !== null && (
            <p role="alert" className="text-sm text-red-600 dark:text-red-400">
              {dateError}
            </p>
          )}
          {dateResult !== null && (
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
              <dt className="text-zinc-500">Secondes</dt>
              <dd className="font-mono">{dateResult.seconds}</dd>
              <dt className="text-zinc-500">Millisecondes</dt>
              <dd className="font-mono">{dateResult.milliseconds}</dd>
            </dl>
          )}
        </form>
      </section>
    </div>
  );
}
