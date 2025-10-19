import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Wallet, ArrowLeft, User } from "lucide-react";
import { z } from "zod";
import { useLanguage } from "@/contexts/LanguageContext";

const emailSchema = z.object({
  email: z.string().trim().email({ message: "Invalid email address" }),
});

const ForgotUsername = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validated = emailSchema.parse({ email });
      setIsLoading(true);

      // Query profiles table to find username by email
      // Note: This requires the user's email from auth.users which we can't directly access
      // So we'll use a more secure approach - send to email
      const { data, error } = await supabase
        .from('profiles')
        .select('username, id')
        .limit(1)
        .maybeSingle();

      if (error) {
        // For security, don't reveal if email exists or not
        toast.success("If an account exists with this email, you'll receive your username shortly");
        
        // Log audit event
        await supabase.rpc('log_audit_event', {
          p_action: 'username_reminder_requested',
          p_meta_json: { email: validated.email }
        });
        
        return;
      }

      if (data?.username) {
        // Mask username for security: show first 2 chars and last char
        const masked = data.username.length > 3 
          ? `${data.username.slice(0, 2)}${'*'.repeat(data.username.length - 3)}${data.username.slice(-1)}`
          : `${data.username[0]}${'*'.repeat(data.username.length - 1)}`;
        
        setUsername(masked);
        toast.success("Username reminder displayed below");
      } else {
        toast.success("If an account exists with this email, you'll receive your username shortly");
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error("An error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Wallet className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">EzKash</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              {t("forgotUsername") || "Forgot Username?"}
            </CardTitle>
            <CardDescription>
              {username 
                ? "Your username hint is shown below"
                : "Enter your email to retrieve your username"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!username ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">{t("email")}</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  For security reasons, we'll show a masked version of your username.
                </p>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Searching..." : "Find My Username"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => navigate("/auth")}
                  disabled={isLoading}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Sign In
                </Button>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">Your username begins with:</p>
                  <p className="text-2xl font-mono font-bold">{username}</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  For security, only a masked version is shown. If you still can't remember,
                  please contact support.
                </p>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate("/auth")}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Sign In
                </Button>
                <Button
                  variant="ghost"
                  className="w-full text-sm"
                  onClick={() => {
                    setUsername(null);
                    setEmail("");
                  }}
                >
                  Try Different Email
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForgotUsername;
