"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ImagePlus, Trash2, Loader2, RefreshCw } from "lucide-react";
import { uploadImage } from "@/lib/admin-api";
import { Label } from "@/components/ui/label";
import { cn, mediaUrl } from "@/lib/utils";

type Props = {
  label?: string;
  folder?: string;
  value?: string | null;
  onChange: (key: string | null) => void;
  optional?: boolean;
  /** Fixed preview frame: square for logos, wide for hero/cover. */
  preview?: "square" | "wide" | "auto";
  hint?: string;
  className?: string;
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
  preview = "auto",
  hint,
  className,
}: Props) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewName, setPreviewName] = useState<string | null>(null);
  const [previewSize, setPreviewSize] = useState<string | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [remoteBroken, setRemoteBroken] = useState(false);

  const displayUrl = localPreview || (!remoteBroken ? mediaUrl(value) : null);
  const meta = previewName ?? (value ? value.split("/").pop() : null);

  useEffect(() => {
    setRemoteBroken(false);
  }, [value]);

  useEffect(() => {
    return () => {
      if (localPreview) URL.revokeObjectURL(localPreview);
    };
  }, [localPreview]);

  async function onFile(file: File | undefined) {
    setRemoteBroken(false);
    if (!file) return;
    setError("");
    setPreviewName(file.name);
    setPreviewSize(`${(file.size / 1024).toFixed(1)} KB`);
    if (localPreview) URL.revokeObjectURL(localPreview);
    const objectUrl = URL.createObjectURL(file);
    setLocalPreview(objectUrl);
    setUploading(true);
    try {
      const { key } = await uploadImage(file, folder);
      onChange(key);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Falha no upload");
      URL.revokeObjectURL(objectUrl);
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
    if (localPreview) URL.revokeObjectURL(localPreview);
    setLocalPreview(null);
    setPreviewName(null);
    setPreviewSize(null);
    setError("");
    setRemoteBroken(false);
    onChange(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  const frameClass =
    preview === "square"
      ? "aspect-square w-full max-w-[9.5rem]"
      : preview === "wide"
        ? "aspect-[16/9] w-full"
        : "min-h-[7.5rem] w-full";

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={inputId} className="text-sm text-ink/80">
        {label}
        {optional ? <span className="ml-1 font-normal text-ink/40">opcional</span> : null}
      </Label>

      {!displayUrl ? (
        <label
          htmlFor={inputId}
          className={cn(
            "group flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed border-ink/20 bg-ink/[0.02] px-4 text-center transition hover:border-accent/60 hover:bg-accent/[0.03]",
            frameClass,
            preview === "auto" && "py-10",
          )}
        >
          <ImagePlus className="h-7 w-7 text-ink/35 transition group-hover:text-accent-strong" />
          <span className="text-sm text-ink/65">Escolher imagem</span>
          <span className="text-[11px] text-ink/40">JPG · PNG · WEBP</span>
        </label>
      ) : (
        <div className="overflow-hidden rounded-md border border-ink/12 bg-[#faf8f4]">
          <div
            className={cn(
              "relative flex items-center justify-center bg-ink/[0.04]",
              frameClass,
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={displayUrl}
              alt={previewName ?? "Preview"}
              className={cn(
                "object-contain",
                preview === "auto" ? "max-h-44 max-w-full p-3" : "h-full w-full p-3",
              )}
              onError={() => {
                if (!localPreview) setRemoteBroken(true);
              }}
            />
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-[#faf8f4]/80">
                <Loader2 className="h-6 w-6 animate-spin text-accent-strong" />
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 border-t border-ink/8 px-2.5 py-2">
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs text-ink/70">{meta}</p>
              {previewSize ? <p className="text-[11px] text-ink/40">{previewSize}</p> : null}
            </div>
            <button
              type="button"
              className="inline-flex h-8 items-center gap-1.5 rounded px-2 text-xs text-ink/65 transition hover:bg-ink/5 hover:text-ink disabled:opacity-50"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Trocar
            </button>
            <button
              type="button"
              className="inline-flex h-8 w-8 items-center justify-center rounded text-ink/45 transition hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
              onClick={clear}
              disabled={uploading}
              aria-label="Remover imagem"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
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

      {hint ? <p className="text-[11px] leading-relaxed text-ink/45">{hint}</p> : null}
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
    </div>
  );
}
