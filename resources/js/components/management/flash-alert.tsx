import { useEffect } from "react";
import { router, usePage } from "@inertiajs/react";
import { Toaster, toast } from "sonner";

import type { Flash, PageProps } from "@/types";

function notifyFlash(flash: Flash | null | undefined) {
    if (flash?.success) {
        toast.success("Berhasil", { description: flash.success });
    }

    if (flash?.error) {
        toast.error("Gagal", { description: flash.error });
    }
}

function notifyErrors(errors: Record<string, string | string[]> | undefined) {
    const messages = Object.values(errors ?? {})
        .flat()
        .filter(Boolean);

    if (messages.length === 0) {
        return;
    }

    toast.error("Terjadi kesalahan", {
        description: String(messages[0]),
    });
}

export function FlashAlert() {
    const { flash, errors } = usePage<PageProps>().props;

    useEffect(() => {
        notifyFlash(flash);
        notifyErrors(errors);

        const offSuccess = router.on("success", (event) => {
            const page = event.detail.page.props as PageProps;
            notifyFlash(page.flash);
        });

        const offError = router.on("error", (event) => {
            notifyErrors(event.detail.errors);
        });

        const offException = router.on("exception", (event) => {
            toast.error("Aksi gagal", {
                description:
                    event.detail.exception.message ||
                    "Terjadi kesalahan saat menghubungi server.",
            });
        });

        return () => {
            offSuccess();
            offError();
            offException();
        };
        // Show leftover flash once after a full-page redirect; later visits use router events.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <Toaster
            position="top-right"
            richColors
            closeButton
            expand
            duration={4500}
            offset={{ top: 72, right: 16 }}
            toastOptions={{
                classNames: {
                    toast: "max-w-sm",
                },
            }}
        />
    );
}
