"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, X, Image as ImageIcon, GripVertical } from "lucide-react";
import { uploadImageAction } from "../../actions";

export function ImageUploader({ name, defaultValue }: { name: string; defaultValue?: string }) {
  const [url, setUrl] = useState(defaultValue || "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(file: File) {
    setUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);

    const result = await uploadImageAction(formData);
    setUploading(false);

    if (result.error) {
      setError(result.error);
    } else if (result.url) {
      setUrl(result.url);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleUpload(file);
  }

  return (
    <div>
      <input type="hidden" name={name} value={url} />

      {url ? (
        <div className="relative rounded-xl overflow-hidden border border-[#C9A88C]/20">
          <img src={url} alt="封面" className="w-full h-40 object-cover" />
          <button
            type="button"
            onClick={() => setUrl("")}
            className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-full cursor-pointer border-none"
          >
            <X size={14} className="text-white" />
          </button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="border-2 border-dashed border-[#C9A88C]/30 rounded-xl p-8 text-center cursor-pointer hover:border-[#C9A88C]/60 transition-colors"
        >
          {uploading ? (
            <p className="text-sm text-[#A08060]">上传中...</p>
          ) : (
            <>
              <Upload size={24} className="mx-auto mb-2 text-[#C9A88C]" />
              <p className="text-sm text-[#A08060]">点击或拖拽上传图片</p>
              <p className="text-xs text-[#C9A88C] mt-1">支持 JPG、PNG、WebP</p>
            </>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}

export function MultiImageUploader({ name, defaultValue }: { name: string; defaultValue?: string[] }) {
  const [urls, setUrls] = useState<string[]>(defaultValue || []);
  const [uploading, setUploading] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(file: File) {
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    const result = await uploadImageAction(formData);
    setUploading(false);
    if (result.url) {
      setUrls((prev) => [...prev, result.url!]);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  }

  function removePhoto(index: number) {
    setUrls((prev) => prev.filter((_, i) => i !== index));
  }

  const handleDragStart = useCallback((index: number) => {
    setDragIndex(index);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === dropIndex) {
      setDragIndex(null);
      setDragOverIndex(null);
      return;
    }

    setUrls((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(dragIndex, 1);
      updated.splice(dropIndex, 0, moved);
      return updated;
    });

    setDragIndex(null);
    setDragOverIndex(null);
  }, [dragIndex]);

  const handleDragEnd = useCallback(() => {
    setDragIndex(null);
    setDragOverIndex(null);
  }, []);

  return (
    <div>
      <input type="hidden" name={name} value={JSON.stringify(urls)} />

      <div className="grid grid-cols-3 gap-3 mb-3">
        {urls.map((u, i) => (
          <div
            key={`${u}-${i}`}
            draggable
            onDragStart={() => handleDragStart(i)}
            onDragOver={(e) => handleDragOver(e, i)}
            onDrop={(e) => handleDrop(e, i)}
            onDragEnd={handleDragEnd}
            className={`relative rounded-lg overflow-hidden aspect-[4/3] group cursor-grab active:cursor-grabbing transition-all ${
              dragIndex === i ? "opacity-40 scale-95" : ""
            } ${dragOverIndex === i && dragIndex !== i ? "ring-2 ring-[#5C3D2E]/40 scale-105" : ""}`}
          >
            <img src={u} alt="" className="w-full h-full object-cover" />

            {/* Drag handle overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <GripVertical size={20} className="text-white opacity-0 group-hover:opacity-80 transition-opacity drop-shadow-lg" />
            </div>

            {/* Index badge */}
            <span className="absolute top-1.5 left-1.5 w-5 h-5 rounded-full bg-black/50 text-white text-[0.6rem] font-bold flex items-center justify-center">
              {i + 1}
            </span>

            {/* Remove button */}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); removePhoto(i); }}
              className="absolute top-1 right-1 p-1 bg-black/50 rounded-full cursor-pointer border-none opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={12} className="text-white" />
            </button>
          </div>
        ))}

        <div
          onClick={() => inputRef.current?.click()}
          className="aspect-[4/3] border-2 border-dashed border-[#C9A88C]/30 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-[#C9A88C]/60 transition-colors"
        >
          {uploading ? (
            <p className="text-xs text-[#A08060]">上传中...</p>
          ) : (
            <>
              <ImageIcon size={20} className="text-[#C9A88C] mb-1" />
              <p className="text-[0.65rem] text-[#A08060]">添加照片</p>
            </>
          )}
        </div>
      </div>

      {urls.length > 1 && (
        <p className="text-[0.65rem] text-[#C9A88C]">拖拽照片可调整顺序</p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
