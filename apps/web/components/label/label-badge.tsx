"use client";

import { Label, LABEL_COLORS } from "@/types";

interface LabelBadgeProps {
  label: Label;
  /** Tam metin göster (default: sadece renk şeridi) */
  showName?: boolean;
  size?: "sm" | "md";
}

export function LabelBadge({ label, showName = false, size = "sm" }: LabelBadgeProps) {
  const colorDef = LABEL_COLORS.find((c) => c.value === label.color);
  const bgClass = colorDef?.class ?? "bg-gray-400";

  if (showName) {
    const lightClass = colorDef?.lightClass ?? "bg-gray-100";
    const textClass = colorDef?.textClass ?? "text-gray-700";
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${lightClass} ${textClass}`}
        title={label.name}
      >
        <span className={`h-2 w-2 rounded-full ${bgClass}`} />
        {label.name}
      </span>
    );
  }

  // Minimal: sadece renkli şerit (Trello tarzı)
  const height = size === "sm" ? "h-2" : "h-3";
  return (
    <span
      className={`inline-block rounded ${bgClass} ${height} min-w-[2rem] max-w-[3rem] w-full`}
      title={label.name}
    />
  );
}
