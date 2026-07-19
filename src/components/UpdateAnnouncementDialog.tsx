import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

export const UpdateAnnouncementDialog = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("easycash_update_seen") !== "2.0") {
      setOpen(true);
    }
  }, []);

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      localStorage.setItem("easycash_update_seen", "2.0");
    }
  };

  const handleClose = () => {
    setOpen(false);
    localStorage.setItem("easycash_update_seen", "2.0");
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            Easy Cash 2.0
            <Badge variant="default">New</Badge>
          </DialogTitle>
          <DialogDescription>What&apos;s new in this update</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <p className="text-sm text-muted-foreground">
              New Warm theme option — switch it on in Settings → Appearance
            </p>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <p className="text-sm text-muted-foreground">
              Recent Transactions now fit your screen on mobile — no more side-scrolling
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleClose} className="w-full sm:w-auto">
            Got it
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
