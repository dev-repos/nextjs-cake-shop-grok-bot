import { jsonLdString } from "@/lib/structured-data";

/** Renders schema.org structured data. The content is built from our own catalogue, never user input. */
export function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(data) }} />;
}
