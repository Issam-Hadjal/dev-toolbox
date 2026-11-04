export type Tool = {
  /** URL segment of the tool's page, in kebab-case: /tools/<slug> */
  slug: string;
  /** Name shown on the home page, in French */
  title: string;
  /** One sentence shown under the name, in French */
  description: string;
};

/** Every tool of the toolbox, in the order the home page lists them. */
export const tools: Tool[] = [
  {
    slug: "timestamp",
    title: "Convertisseur d'horodatage",
    description: "Convertit un horodatage en date et inversement.",
  },
];
