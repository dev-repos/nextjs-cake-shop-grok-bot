import prompts from "../../images/prompts.json";

type ImageEntry = (typeof prompts.images)[number];

const ratioClass: Record<string, string> = {
  "4:5": "aspect-[4/5]",
  "1:1": "aspect-square",
  "3:2": "aspect-[3/2]",
};

/**
 * Temporary stand-in for a real photo. Every image used on the site is listed
 * in images/prompts.json; the real WebP files are generated in step 2 and this
 * component is then swapped for next/image using the same id, file and alt.
 */
export function ImagePlaceholder({
  id,
  className = "",
}: {
  id: string;
  className?: string;
}) {
  const image = prompts.images.find((entry: ImageEntry) => entry.id === id);
  if (!image) {
    throw new Error(`Unknown image id "${id}". Add it to images/prompts.json.`);
  }

  return (
    <div
      role="img"
      aria-label={image.alt}
      data-image-id={image.id}
      className={`relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-cream-200 via-raspberry-100 to-cream-300 ${
        ratioClass[image.aspectRatio] ?? "aspect-square"
      } ${className}`}
    >
      <svg
        viewBox="0 0 64 64"
        aria-hidden="true"
        className="h-1/3 max-h-28 w-auto text-cocoa-700/35"
        fill="currentColor"
      >
        <path d="M31 4c1.5 2.5 3 4.5 3 6.5a3 3 0 0 1-6 0C28 8.5 29.5 6.5 31 4Z" />
        <rect x="29.5" y="13" width="3" height="9" rx="1.5" />
        <path d="M12 30a6 6 0 0 1 6-6h28a6 6 0 0 1 6 6v6c-2.7 0-4 2.5-6.7 2.5S41.3 36 38.7 36s-4 2.5-6.7 2.5S27.3 36 24.7 36s-4 2.5-6.7 2.5S14.7 36 12 36v-6Z" />
        <path d="M8 44c3 0 4.6-2.8 8-2.8s4.8 2.8 8 2.8 4.8-2.8 8-2.8 4.8 2.8 8 2.8 4.8-2.8 8-2.8 5 2.8 8 2.8v10a4 4 0 0 1-4 4H12a4 4 0 0 1-4-4V44Z" />
      </svg>
      <span className="absolute bottom-2 left-2 rounded-full bg-cream-50/80 px-2.5 py-1 text-[11px] font-medium tracking-wide text-cocoa-700">
        Photo coming soon
      </span>
    </div>
  );
}
