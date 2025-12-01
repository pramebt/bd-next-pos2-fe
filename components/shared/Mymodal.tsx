"use client";

import { ReactNode, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface ModalProps {
    id: string;
    title: string;
    modalSize?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
    children: ReactNode;
    trigger?: ReactNode;
    description?: string;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    showCloseButton?: boolean;
}

const Modal: React.FC<ModalProps> = ({
    id,
    title,
    modalSize = "md",
    children,
    trigger,
    description,
    open: controlledOpen,
    onOpenChange,
    showCloseButton = true,
}) => {
    const [internalOpen, setInternalOpen] = useState(false);
    const isControlled = controlledOpen !== undefined;
    const open = isControlled ? controlledOpen : internalOpen;
    const setOpen = isControlled ? onOpenChange : setInternalOpen;

    const sizeClasses = {
        sm: "sm:max-w-sm",
        md: "sm:max-w-md",
        lg: "sm:max-w-lg",
        xl: "sm:max-w-xl",
        "2xl": "sm:max-w-2xl",
        full: "sm:max-w-[95vw]",
    };

    const content = (
        <Dialog open={open} onOpenChange={setOpen}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent
                className={cn(sizeClasses[modalSize])}
                showCloseButton={showCloseButton}
                id={id}
            >
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    {description && (
                        <DialogDescription>{description}</DialogDescription>
                    )}
                </DialogHeader>
                <div className="py-4">{children}</div>
                {/* Hidden close button for backward compatibility */}
                <DialogClose
                    id={`${id}_btnClose`}
                    className="hidden"
                />
            </DialogContent>
        </Dialog>
    );

    // If no trigger is provided, return just the Dialog (for programmatic control)
    if (!trigger) {
        return content;
    }

    return content;
};

export default Modal;
