"use client";
import { useEffect, useState } from "react";
import { Check, PencilLine, Trash2 } from "lucide-react";
import { useChartStore, useStarNote } from "@/store/useChartStore";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";

/**
 * Một đoạn luận giải có thể sửa: hiện bản người dùng đã sửa, nếu không thì dữ liệu mặc định.
 * Lưu vào store theo noteKey – dùng chung giữa Danh mục sao và chi tiết sao trên lá số.
 */
export function EditableNote({
  noteKey,
  defaultText,
  header,
  ariaLabel,
  placeholder,
  className,
  textClassName,
}: {
  noteKey: string;
  defaultText?: string;
  header: React.ReactNode;
  ariaLabel: string;
  placeholder?: string;
  className?: string;
  textClassName?: string;
}) {
  const custom = useStarNote(noteKey);
  const setNote = useChartStore((s) => s.setStarPalaceNote);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  useEffect(() => setEditing(false), [noteKey]);
  const shown = custom ?? defaultText;

  return (
    <div className={cn("rounded-lg border p-2.5", className)}>
      <div className="mb-1 flex items-center gap-1.5">
        {header}
        {custom && defaultText && <span className="text-[10px] text-muted-foreground">· đã sửa</span>}
        {!editing && (
          <button
            type="button"
            onClick={() => {
              setDraft(shown ?? "");
              setEditing(true);
            }}
            aria-label="Sửa ý nghĩa"
            title={shown ? "Sửa ý nghĩa" : "Thêm ý nghĩa"}
            className="ml-auto rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <PencilLine className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      {editing ? (
        <div className="space-y-2">
          <textarea
            aria-label={ariaLabel}
            className="min-h-[72px] w-full rounded-md border border-input bg-card p-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={placeholder}
            autoFocus
          />
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={() => { setNote(noteKey, draft === defaultText ? "" : draft); setEditing(false); }}>
              <Check /> Lưu
            </Button>
            <Button size="sm" variant="outline" onClick={() => setEditing(false)}>
              Huỷ
            </Button>
            {custom && (
              <Button size="sm" variant="ghost" className="ml-auto text-destructive" onClick={() => { setNote(noteKey, ""); setEditing(false); }}>
                <Trash2 /> {defaultText ? "Khôi phục mặc định" : "Xoá"}
              </Button>
            )}
          </div>
        </div>
      ) : shown ? (
        <p className={cn("whitespace-pre-wrap text-sm leading-snug", textClassName)}>{shown}</p>
      ) : (
        <p className="text-sm italic text-muted-foreground">Chưa có – bấm bút để thêm.</p>
      )}
    </div>
  );
}
