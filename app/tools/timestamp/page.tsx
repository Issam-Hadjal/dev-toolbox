import type { Metadata } from "next";
import TimestampConverter from "./timestamp-converter";

export const metadata: Metadata = {
  title: "Convertisseur d'horodatage",
};

export default function TimestampPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">
        Convertisseur d'horodatage
      </h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        Convertit un horodatage en date et inversement. Aucune donnée ne quitte
        la page.
      </p>
      <TimestampConverter />
    </main>
  );
}
