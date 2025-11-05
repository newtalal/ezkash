import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Sparkles } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const EncouragementSettings = () => {
  const { t } = useLanguage();
  const [enabled, setEnabled] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_settings')
        .select('encouragement_enabled')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data && data.encouragement_enabled !== undefined) {
        setEnabled(data.encouragement_enabled);
      }
    } catch (error) {
      console.error('Error loading encouragement settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (checked: boolean) => {
    setEnabled(checked);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('user_settings')
        .update({ encouragement_enabled: checked })
        .eq('user_id', user.id);

      if (error) throw error;
      
      toast.success(checked ? t('encouragementEnabled') : t('encouragementDisabled'));
    } catch (error) {
      console.error('Error updating encouragement settings:', error);
      setEnabled(!checked); // Revert on error
      toast.error(t('failedToUpdateSettings'));
    }
  };

  if (loading) {
    return null;
  }

  return (
    <Card className="shadow-card">
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <Sparkles className="w-5 h-5 text-primary" />
          {t('encouragementMessages')}
        </CardTitle>
        <CardDescription className="text-sm">
          {t('encouragementDescription')}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0">
        <div className="flex items-center justify-between">
          <Label htmlFor="encouragement-toggle" className="cursor-pointer">
            {t('showEncouragementMessages')}
          </Label>
          <Switch
            id="encouragement-toggle"
            checked={enabled}
            onCheckedChange={handleToggle}
          />
        </div>
      </CardContent>
    </Card>
  );
};
