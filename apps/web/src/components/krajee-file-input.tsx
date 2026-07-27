"use client";

import { useId, useRef, useState } from "react";
import { ImagePlus, Trash2, Loader2 } from "lucide-react";
import { uploadImage } from "@/lib/admin-api";
import { Label } from "@/components/ui/label";
import { mediaUrl } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type Props = {
  label?: string;
  folder?: string;
  value?: string | null;
  onChange: (key: string | null) => void;
  optional?: boolean;
};

/**
 * Upload de imagem com preview (substitui Krajee — estável em Next.js/React).
 * Mantém a mesma API de props usada no admin.
 */
export function KrajeeFileInput({
  label = "Imagem (opcional)",
  folder = "uploads",
  value,
  onChange,
  optional = true,
}: Props) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewName, setPreviewName] = useState<string | null>(null);
  const [previewSize, setPreviewSize] = useState<string | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const displayUrl = localPreview || mediaUrl(value);

  async function onFile(file: File | undefined) {
    if (!file) return;
    setError("");
    setPreviewName(file.name);
    setPreviewSize(`${(file.size / 1024).toFixed(2)} KB`);
    const objectUrl = URL.createObjectURL(file);
    setLocalPreview(objectUrl);
    setUploading(true);
    try {
      const { key } = await uploadImage(file, folder);
      onChange(key);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Falha no upload");
      setLocalPreview(null);
      setPreviewName(null);
      setPreviewSize(null);
      onChange(null);
      if (inputRef.current) inputRef.current.value = "";
    } finally {
      setUploading(false);
    }
  }

  function clear() {
    setLocalPreview(null);
    setPreviewName(null);
    setPreviewSize(null);
    setError("");
    onChange(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={inputId}>
        {label}
        {optional ? <span className="ml-1 font-normal text-ink/45">— opcional</span> : null}
      </Label>

      {!displayUrl ? (
        <label
          htmlFor={inputId}
          className="flex cursor-pointer flex-col items-center justify-center gap-2 border border-dashed border-ink/25 bg-white px-4 py-10 text-center transition hover:border-accent"
        >
          <ImagePlus className="h-8 w-8 text-ink/40" />
          <span className="text-sm text-ink/70">
            {optional ? "Escolher imagem (opcional)…" : "Escolher imagem…"}
          </span>
          <span className="text-xs text-ink/45">JPG, PNG, WEBP ou GIF</span>
        </label>
      ) : (
        <div className="relative inline-block max-w-full border border-ink/15 bg-white p-3 shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={displayUrl}
            alt={previewName ?? "Preview"}
            className="max-h-48 max-w-full object-contain"
          />
          <div className="mt-2 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-xs text-ink/70">{previewName ?? value}</p>
              {previewSize && <p className="text-xs text-ink/45">({previewSize})</p>}
            </div>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={clear}
              disabled={uploading}
              aria-label="Remover imagem"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/70">
              <Loader2 className="h-6 w-6 animate-spin text-accent-strong" />
            </div>
          )}
        </div>
      )}

      <input
        id={inputId}
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="sr-only"
        disabled={uploading}
        onChange={(e) => void onFile(e.target.files?.[0])}
      />

      {displayUrl && (
        <button
          type="button"
          className="text-sm text-accent-strong underline"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          Trocar imagem
        </button>
      )}

      {error && <p className="text-sm text-red-700">{error}</p>}
    </div>
  );
}
