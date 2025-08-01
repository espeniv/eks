import { useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

export function FileUpload() {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    const { data, error } = await supabase.storage
      .from("post-images")
      .upload(`public/${Date.now()}_${file.name}`, file);

    setUploading(false);

    if (error) {
      alert("Upload failed");
    } else {
      alert("Upload successful");
    }
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="border px-4 py-2 rounded"
      >
        {uploading ? "Uploading..." : "Upload Image"}
      </button>
    </div>
  );
}
