import { toast } from "sonner";
import { Artifact } from "@/components/create-artifact";
import { CopyIcon, RedoIcon, UndoIcon } from "@/components/icons";
import { ImageEditor } from "@/components/image-editor";

export const imageArtifact = new Artifact({
  kind: "image",
  description: "Useful for image generation",
  onStreamPart: ({ streamPart, setArtifact }) => {
    if (streamPart.type === "data-imageDelta") {
      let imageContent: string;
      const imageData = streamPart.data as any;
      
      // Check if it's an object with URL property (from blob upload)
      if (imageData && typeof imageData === 'object' && typeof imageData.url === 'string') {
        imageContent = imageData.url;
      } else {
        // Fallback to base64 string
        imageContent = typeof imageData === 'string' ? imageData : '';
      }
      
      setArtifact((draftArtifact) => ({
        ...draftArtifact,
        content: imageContent,
        isVisible: true,
        status: "streaming",
      }));
    }
  },
  content: ImageEditor,
  actions: [
    {
      icon: <UndoIcon size={18} />,
      description: "View Previous version",
      onClick: ({ handleVersionChange }) => {
        handleVersionChange("prev");
      },
      isDisabled: ({ currentVersionIndex }) => {
        if (currentVersionIndex === 0) {
          return true;
        }

        return false;
      },
    },
    {
      icon: <RedoIcon size={18} />,
      description: "View Next version",
      onClick: ({ handleVersionChange }) => {
        handleVersionChange("next");
      },
      isDisabled: ({ isCurrentVersion }) => {
        if (isCurrentVersion) {
          return true;
        }

        return false;
      },
    },
    {
      icon: <CopyIcon size={18} />,
      description: "Copy image to clipboard",
      onClick: async ({ content }) => {
        if (typeof content !== "string") {
          toast.error("Invalid image content");
          return;
        }

        let img: HTMLImageElement;
        
        if (content.startsWith("http")) {
          // Fetch image from URL
          img = new Image();
          img.crossOrigin = "anonymous";
          img.src = content;
          
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = () => reject(new Error("Failed to load image"));
          });
        } else {
          // Handle base64 fallback
          img = new Image();
          img.src = `data:image/png;base64,${content}`;
          
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = () => reject(new Error("Failed to load image"));
          });
        }

        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          canvas.toBlob((blob) => {
            if (blob) {
              navigator.clipboard.write([
                new ClipboardItem({ "image/png": blob }),
              ]).then(() => {
                toast.success("Copied image to clipboard!");
              }).catch(() => {
                toast.error("Failed to copy image");
              });
            }
          }, "image/png");
        } else {
          toast.error("Failed to create canvas");
        }
      },
    },
  ],
  toolbar: [],
});
