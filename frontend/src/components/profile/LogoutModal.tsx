"use client"
import { Dialog, DialogContent } from "@/components/ui/dialog";
export function LogoutModal({ open, onOpenChange, onConfirm }: { open: boolean, onOpenChange: (v: boolean) => void, onConfirm: () => void }) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md w-full flex flex-col items-center p-8">
                <div className="bg-error/90 rounded-full w-24 h-24 flex items-center justify-center mb-6 shadow-lg">
                    {/* SVG icon for logout */}
                    <svg width="48" height="48" fill="none" viewBox="0 0 48 48">
                        <circle cx="24" cy="24" r="24" fill="#DA5850" />
                        <path d="M20 16v-2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v20a2 2 0 0 1-2 2h-8a2 2 0 0 1-2-2v-2" stroke="#fff" strokeWidth="2" />
                        <path d="M28 24H12m0 0l4-4m-4 4l4 4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
                <div className="text-24 font-bold text-dark mb-6">Log out?</div>
                <button
                    className="w-full bg-error text-white text-18 font-semibold py-3 rounded-lg shadow mb-4 hover:bg-error/90 transition"
                    onClick={onConfirm}
                >
                    Yes
                </button>
                <button
                    className="text-18 text-dark font-medium"
                    onClick={() => onOpenChange(false)}
                >
                    Cancel
                </button>
            </DialogContent>
        </Dialog>
    );
}