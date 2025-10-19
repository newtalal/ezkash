import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Wallet, ArrowLeft, KeyRound } from "lucide-react";
import { z } from "zod";
import { useLanguage } from "@/contexts/LanguageContext";

const emailSchema = z.object({
  email: z.string().trim().email({ message: "Invalid email address" }),
});

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validated = emailSchema.parse({ email });
      setIsLoading(true);

      const { error } = await supabase.auth.resetPasswordForEmail(validated.email, {
        redirectTo: `${window.location.origin}/dashboard`,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      // Log audit event
      await supabase.rpc('log_audit_event', {
        p_action: 'password_reset_requested',
        p_meta_json: { email: validated.email }
      });

      setEmailSent(true);
      toast.success("Password reset instructions sent to your email");
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
              <KeyRound className="w-5 h-5" />
              {t("forgotPassword") || "Forgot Password?"}
            </CardTitle>
            <CardDescription>
              {emailSent 
                ? "Check your email for password reset instructions"
                : "Enter your email to receive password reset instructions"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!emailSent ? (
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
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Sending..." : "Send Reset Link"}
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
                <p className="text-sm text-muted-foreground">
                  We've sent password reset instructions to <strong>{email}</strong>.
                  Please check your inbox and spam folder.
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
                  onClick={() => setEmailSent(false)}
                  disabled={isLoading}
                >
                  Didn't receive email? Try again
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;
