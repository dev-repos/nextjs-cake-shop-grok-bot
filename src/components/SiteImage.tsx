import Image from "next/image";
import prompts from "../../images/prompts.json";

type ImageEntry = (typeof prompts.images)[number];

/**
 * Renders one of the site photos listed in images/prompts.json with next/image.
 * The file, pixel size and alt text all come from that file so they stay in sync.
 */
export function SiteImage({
  id,
  sizes,
  preload = false,
  className = "",
}: {
  id: string;
  /** Responsive sizes hint, e.g. "(min-width: 768px) 50vw, 100vw". */
  sizes: string;
  /** Preload above-the-fold images such as the hero. */
  preload?: boolean;
  className?: string;
}) {
  const image = prompts.images.find((entry: ImageEntry) => entry.id === id);
  if (!image) {
    throw new Error(`Unknown image id "${id}". Add it to images/prompts.json.`);
  }

  return (
    <Image
      src={image.file.replace(/^public/, "")}
      alt={image.alt}
      width={image.width}
      height={image.height}
      sizes={sizes}
      preload={preload}
      className={`bg-cream-200 object-cover ${className}`}
    />
  );
}
