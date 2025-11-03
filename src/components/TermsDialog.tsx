import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLanguage } from "@/contexts/LanguageContext";
import { TERMS_AND_CONDITIONS } from "@/constants/termsAndConditions";

interface TermsDialogProps {
  children: React.ReactNode;
}

export const TermsDialog = ({ children }: TermsDialogProps) => {
  const { language } = useLanguage();
  const terms = TERMS_AND_CONDITIONS[language];

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">{terms.title}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="whitespace-pre-wrap text-sm leading-relaxed">
            {terms.content}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
