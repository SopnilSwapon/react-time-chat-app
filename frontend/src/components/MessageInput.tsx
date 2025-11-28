import { Image, Send, X } from "lucide-react";
import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { toast } from "react-toastify";
import { useChatStore } from "../store/useChatStore";

export default function MessageInput() {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { sendMessage } = useChatStore((state) => state);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file?.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result;
      if (typeof result === "string") {
        setImagePreview(result);
      } else {
        setImagePreview(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSendMessage = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;
    try {
      await sendMessage({
        text: text.trim(),
        image: imagePreview!,
      });

      // Clear form
      setText("");
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.log("Failed to send message", error);
    }
  };

  return (
    <div className="p-4 w-full">
      {imagePreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
            />
            <button
              onClick={removeImage}
              className="absolute cursor-pointer -top-1 -right-1.5 w-5 h-5 rounded-full bg-base-300 flex text-center justify-center"
              type="button"
            >
              <X className="size-3 mt-1" />
            </button>
          </div>
        </div>
      )}
      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        <div className="flex-1  flex gap-2">
          <input
            type="text"
            className="w-full input input-bordered rounded-lg input-md"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            className="hidden pr-10 border border-red-600"
            onChange={handleImageChange}
          />
          <div className="flex items-center absolute z-50 right-10 gap-3">
            <button
              type="button"
              className={`flex cursor-pointer mt-1 btn-circle ${
                imagePreview ? "text-emerald-500" : "text-zinc-400"
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <Image className="size-5 md:size-5" />
            </button>
            <button
              type="submit"
              className="btn pt-0.5 mt-1 btn-sm btn-circle"
              disabled={!text.trim() && !imagePreview}
            >
              <Send className="size-4 md:size-5" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
