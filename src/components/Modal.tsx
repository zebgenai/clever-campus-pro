import { type ReactNode, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export function Modal({
  open, onClose, title, description, children, footer, size = "md",
}: {
  open: boolean; onClose: () => void; title: string; description?: string;
  children: ReactNode; footer?: ReactNode; size?: "sm" | "md" | "lg" | "xl";
}) {
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open, onClose]);

  const widths = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-2xl", xl: "max-w-4xl" };
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.2 }}
            className={`relative bg-card rounded-2xl shadow-lift border w-full ${widths[size]} max-h-[90vh] flex flex-col`}
          >
            <div className="flex items-start justify-between p-5 border-b">
              <div>
                <h3 className="text-lg font-semibold">{title}</h3>
                {description && <p className="text-sm text-muted-foreground mt-0.5">{description}</p>}
              </div>
              <button onClick={onClose} className="size-8 grid place-items-center rounded-lg hover:bg-muted">
                <X className="size-4" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto flex-1">{children}</div>
            {footer && <div className="p-4 border-t bg-muted/30 rounded-b-2xl flex justify-end gap-2">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export function ConfirmDialog({
  open, onClose, onConfirm, title, message, confirmText = "Delete", loading,
}: {
  open: boolean; onClose: () => void; onConfirm: () => void;
  title: string; message: string; confirmText?: string; loading?: boolean;
}) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm"
      footer={
        <>
          <button onClick={onClose} className="px-4 py-2 rounded-lg border hover:bg-muted text-sm">Cancel</button>
          <button
            disabled={loading}
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-destructive text-destructive-foreground text-sm font-medium hover:opacity-90 disabled:opacity-60 inline-flex items-center gap-2"
          >
            {loading && <span className="size-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />}
            {confirmText}
          </button>
        </>
      }
    >
      <p className="text-sm text-muted-foreground">{message}</p>
    </Modal>
  );
}
