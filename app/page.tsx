import Link from "next/link";
import { tools } from "@/lib/tools";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">Dev Toolbox</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        Des outils de développeur qui tournent entièrement dans le navigateur :
        aucune donnée ne quitte la page.
      </p>
      {tools.length === 0 ? (
        <p className="mt-10 text-zinc-500">Aucun outil pour l’instant.</p>
      ) : (
        <ul className="mt-10 grid gap-4 sm:grid-cols-2">
          {tools.map((tool) => (
            <li key={tool.slug}>
              <Link
                href={`/tools/${tool.slug}`}
                className="block h-full rounded-lg border border-zinc-200 p-4 transition-colors hover:border-zinc-400 dark:border-zinc-800 dark:hover:border-zinc-600"
              >
                <h2 className="font-medium">{tool.title}</h2>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  {tool.description}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
