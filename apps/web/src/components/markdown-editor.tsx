"use client";

import { TextareaHTMLAttributes, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type Props = {
  label?: string;
  value: string;
  onChange: (value: string) => void;
} & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "value" | "onChange">;

export function MarkdownEditor({ label = "Corpo (markdown)", value, onChange, ...rest }: Props) {
  const ref = useRef<HTMLTextAreaElement>(null);

  function wrap(before: string, after = before) {
    const el = ref.current;
    if (!el) {
      onChange(`${before}${value}${after}`);
      return;
    }
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = value.slice(start, end) || "texto";
    const next = value.slice(0, start) + before + selected + after + value.slice(end);
    onChange(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + before.length, start + before.length + selected.length);
    });
  }

  function linePrefix(prefix: string) {
    const el = ref.current;
    if (!el) {
      onChange(`${prefix}${value}`);
      return;
    }
    const start = el.selectionStart;
    const lineStart = value.lastIndexOf("\n", start - 1) + 1;
    const next = value.slice(0, lineStart) + prefix + value.slice(lineStart);
    onChange(next);
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-1">
        <Button type="button" size="sm" variant="outline" onClick={() => wrap("**")}>
          Negrito
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={() => wrap("*")}>
          Itálico
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={() => linePrefix("## ")}>
          Título
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={() => linePrefix("- ")}>
          Lista
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => wrap("[", "](https://)")}
        >
          Link
        </Button>
      </div>
      <Textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[180px] font-mono text-sm"
        {...rest}
      />
      <p className="text-xs text-ink/45">
        Markdown simples: **negrito**, *itálico*, ## título, - lista, [texto](url)
      </p>
    </div>
  );
}
