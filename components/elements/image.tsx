import type { Experimental_GeneratedImage } from "ai";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export type ImageProps = Experimental_GeneratedImage & {
  className?: string;
  alt?: string;
  url?: string;
  showDownload?: boolean;
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

  const downloadImage = async (imageUrl: string, format: 'jpg' | 'png' | 'webp') => {
    try {
      const response = await fetch(
        `/api/convert-image?url=${encodeURIComponent(imageUrl)}&format=${format}&download=true`
      );

      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`);
      }

      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `generated-image.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);

      // Use toast if available
      if (typeof window !== 'undefined' && (window as any)['toast']) {
        (window as any)['toast'].success(`Downloaded as ${format.toUpperCase()}`);
      }
    } catch (error) {
      console.error("Download error:", error);
      if (typeof window !== 'undefined' && (window as any)['toast']) {
        (window as any)['toast'].error("Failed to download image");
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      {/* biome-ignore lint/nursery/useImageSize: "Generated image without explicit size" */}
      {/* biome-ignore lint/performance/noImgElement: "Generated image without explicit size" */}
      <img
        {...props}
        alt={props.alt}
        className={cn(
          "h-auto max-w-4xl w-full overflow-hidden rounded-md object-contain",
          props.className
        )}
        src={src}
      />
      
      {url && props.showDownload !== false && (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => downloadImage(url, 'jpg')}
            className="text-xs h-6 px-2"
          >
            <Download className="h-3 w-3 mr-1" />
            JPG
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => downloadImage(url, 'png')}
            className="text-xs h-6 px-2"
          >
            <Download className="h-3 w-3 mr-1" />
            PNG
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => downloadImage(url, 'webp')}
            className="text-xs h-6 px-2"
          >
            <Download className="h-3 w-3 mr-1" />
            WEBP
          </Button>
        </div>
      )}
    </div>
  );
};
