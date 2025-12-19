"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CupPaper,
  DonutBitten,
  Mug,
  PaperBin,
  TrashBinTrash,
} from "@solar-icons/react-perf/category/style/BoldDuotone";

interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
  onConfirm: () => void;
  isLoading?: boolean;
}

const ConfirmationDialog = ({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "destructive",
  onConfirm,
  isLoading = false,
}: ConfirmationDialogProps) => {
  const handleConfirm = () => {
    onConfirm();
  };

  const handleClose = () => {
    if (!isLoading) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <DialogTitle className="w-full">{title}</DialogTitle>
          </div>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="relative flex w-full flex-col items-center justify-center space-y-4 rounded-xl bg-white p-4 dark:bg-black">
          <TrashBinTrash className="text-destructive my-8 h-16 w-16" />
          <DonutBitten className="text-muted-foreground/25 absolute top-[35%] left-[65%] h-7 w-7 rotate-162" />
          <CupPaper className="text-muted-foreground/25 absolute top-[45%] right-[65%] h-7 w-7 rotate-12" />
          <PaperBin className="text-muted-foreground/25 absolute top-[15%] right-[60%] h-6 w-6 rotate-162" />
          <Mug className="text-muted-foreground/25 absolute top-[15%] left-[60%] h-6 w-6 rotate-162" />
          <DialogFooter className="flex w-full justify-end gap-2 md:items-end">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              {cancelText}
            </Button>
            <Button
              variant={variant}
              onClick={handleConfirm}
              disabled={isLoading}
              isLoading={isLoading}
            >
              {confirmText}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmationDialog;
