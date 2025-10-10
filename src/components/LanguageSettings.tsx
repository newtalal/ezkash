import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useLanguage } from "@/contexts/LanguageContext";
import { Languages } from "lucide-react";

export const LanguageSettings = () => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Languages className="w-5 h-5" />
          {t("languageSettings")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <Label>{t("selectLanguage")}</Label>
          <RadioGroup
            value={language}
            onValueChange={(value) => setLanguage(value as "en" | "ar")}
          >
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <RadioGroupItem value="en" id="en" />
              <Label htmlFor="en" className="cursor-pointer">
                {t("english")}
              </Label>
            </div>
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <RadioGroupItem value="ar" id="ar" />
              <Label htmlFor="ar" className="cursor-pointer">
                {t("arabic")}
              </Label>
            </div>
          </RadioGroup>
        </div>
      </CardContent>
    </Card>
  );
};
