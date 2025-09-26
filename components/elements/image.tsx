import type { Experimental_GeneratedImage } from "ai";
import { cn } from "@/lib/utils";

export type ImageProps = Experimental_GeneratedImage & {
  className?: string;
  alt?: string;
  url?: string;
};

export const Image = ({
  base64,
  uint8Array,
  mediaType,
  url,
  ...props
}: ImageProps) => {
  let src: string;
  let computedMediaType: string;

  if (url) {
    // Use edge converter for blob URLs to get webp preview
    src = `${url.split('?')[0]}?format=webp&size=large`;
    computedMediaType = "image/webp";
  } else {
    // Fallback to base64
    src = `data:${mediaType};base64,${base64}`;
    computedMediaType = mediaType || "image/png";
  }

  return (
    // biome-ignore lint/nursery/useImageSize: "Generated image without explicit size"
    // biome-ignore lint/performance/noImgElement: "Generated image without explicit size"
    <img
      {...props}
      alt={props.alt}
      className={cn(
        "h-auto max-w-full overflow-hidden rounded-md",
        props.className
      )}
      src={src}
    />
  );
};
