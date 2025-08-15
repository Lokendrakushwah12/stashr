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
import { CloverIcon, ClubIcon, CoffeeBeanIcon, CoinIcon, TrashIcon } from "@phosphor-icons/react";

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
                    <DialogDescription>
                        {description}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 w-full bg-white relative dark:bg-black p-4 rounded-xl flex flex-col justify-center items-center">
                    <TrashIcon weight="duotone" className="h-16 w-16 text-destructive my-8" />
                    <CloverIcon weight="duotone" className="h-7 w-7 absolute top-[35%] left-[65%] rotate-[162deg] text-muted-foreground/50" />
                    <ClubIcon weight="duotone" className="h-7 w-7 absolute top-[45%] right-[65%] rotate-[162deg] text-muted-foreground/50" />
                    <CoffeeBeanIcon weight="duotone" className="h-6 w-6 absolute top-[15%] right-[60%] rotate-[162deg] text-muted-foreground/50" />
                    <CoinIcon weight="duotone" className="h-6 w-6 absolute top-[15%] left-[60%] rotate-[162deg] text-muted-foreground/50" />
                    <DialogFooter className="gap-2 flex justify-end md:items-end w-full">
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
                        >
                            {isLoading ? "Deleting..." : confirmText}
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ConfirmationDialog;
