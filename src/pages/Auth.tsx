import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Wallet, LogIn, UserPlus } from "lucide-react";
import { z } from "zod";
import { useLanguage } from "@/contexts/LanguageContext";

const signUpSchema = z.object({
  fullName: z.string().trim().min(2, { message: "Full name must be at least 2 characters" }).max(100),
  username: z.string().trim().min(3, { message: "Username must be at least 3 characters" }).max(50)
    .regex(/^[a-z0-9_]+$/, { message: "Username must be lowercase letters, numbers, or underscore only" })
    .refine((val) => !['admin', 'support', 'ezkash', 'root', 'system'].includes(val), {
      message: "This username is reserved"
    }),
  email: z.string().trim().email({ message: "Invalid email address" }).max(255),
  password: z.string()
    .min(10, { message: "Password must be at least 10 characters" })
    .max(72)
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
    .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
    .regex(/[0-9]/, { message: "Password must contain at least one number" })
    .regex(/[^A-Za-z0-9]/, { message: "Password must contain at least one special character" }),
  confirmPassword: z.string(),
  agreeTerms: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms and privacy policy"
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const signInSchema = z.object({
  email: z.string().trim().email({ message: "Invalid email address" }).max(255),
  password: z.string().min(1, { message: "Password is required" }),
});

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("signin");
  const [isLoading, setIsLoading] = useState(false);
  
  // Sign In State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  
  // Sign Up State
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);

  useEffect(() => {
    const mode = searchParams.get("mode");
    if (mode === "signup" || mode === "signin") {
      setActiveTab(mode);
    }
  }, [searchParams]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validated = signUpSchema.parse({ 
        fullName, 
        username, 
        email: signUpEmail, 
        password: signUpPassword, 
        confirmPassword,
        agreeTerms 
      });
      
      setIsLoading(true);

      const { error } = await supabase.auth.signUp({
        email: validated.email,
        password: validated.password,
        options: {
          data: {
            username: validated.username,
            full_name: validated.fullName,
          },
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) {
        if (error.message.includes("already registered")) {
          toast.error("This email is already registered. Please sign in instead.");
        } else if (error.message.includes("User already registered")) {
          toast.error("This email is already registered. Please sign in instead.");
        } else {
          toast.error(error.message);
        }
        return;
      }

      toast.success("Account created! Please check your email to verify your account.");
      
      // Log audit event
      await supabase.rpc('log_audit_event', {
        p_action: 'registration_initiated',
        p_meta_json: { email: validated.email }
      });
      
      navigate("/dashboard");
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error("An error occurred during sign up");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validated = signInSchema.parse({ email, password });
      setIsLoading(true);

      const { error, data } = await supabase.auth.signInWithPassword({
        email: validated.email,
        password: validated.password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          toast.error("Invalid email or password");
          // Log failed login attempt
          await supabase.rpc('log_audit_event', {
            p_action: 'login_failed',
            p_meta_json: { email: validated.email }
          });
        } else if (error.message.includes("Email not confirmed")) {
          toast.error("Please verify your email before signing in");
        } else {
          toast.error(error.message);
        }
        return;
      }

      // Update last login timestamp
      if (data.user) {
        await supabase.rpc('update_last_login');
      }

      toast.success("Signed in successfully!");
      navigate("/dashboard");
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error("An error occurred during sign in");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoMode = () => {
    toast.success("Using demo mode - your data will be saved locally");
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Wallet className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">EzKash</h1>
          <p className="text-muted-foreground">{t("trackExpensesManage")}</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">{t("signIn")}</TabsTrigger>
            <TabsTrigger value="signup">{t("signUp")}</TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LogIn className="w-5 h-5" />
                  {t("welcomeBack")}
                </CardTitle>
                <CardDescription>{t("signInToAccess")}</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">{t("email")}</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">{t("password")}</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="remember-me"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded border-input"
                      />
                      <Label htmlFor="remember-me" className="text-sm cursor-pointer">
                        {t("rememberMe") || "Remember me"}
                      </Label>
                    </div>
                    <Button
                      type="button"
                      variant="link"
                      className="p-0 h-auto text-sm"
                      onClick={() => navigate("/auth/forgot-password")}
                    >
                      {t("forgotPassword") || "Forgot Password?"}
                    </Button>
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? t("signingIn") : t("signIn")}
                  </Button>
                  <Button
                    type="button"
                    variant="link"
                    className="w-full text-sm"
                    onClick={() => navigate("/auth/forgot-username")}
                  >
                    {t("forgotUsername") || "Forgot Username?"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="signup">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5" />
                  {t("createAccount")}
                </CardTitle>
                <CardDescription>{t("signUpToSave")}</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-fullname">{t("fullName") || "Full Name"} *</Label>
                    <Input
                      id="signup-fullname"
                      type="text"
                      placeholder="John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-username">{t("username")} *</Label>
                    <Input
                      id="signup-username"
                      type="text"
                      placeholder="johndoe"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase())}
                      required
                      disabled={isLoading}
                    />
                    <p className="text-xs text-muted-foreground">
                      Lowercase letters, numbers, and underscore only
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">{t("email")} *</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="your@email.com"
                      value={signUpEmail}
                      onChange={(e) => setSignUpEmail(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">{t("password")} *</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={signUpPassword}
                      onChange={(e) => setSignUpPassword(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                    <p className="text-xs text-muted-foreground">
                      Min 10 chars, include uppercase, lowercase, number, and symbol
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm-password">{t("confirmPassword") || "Confirm Password"} *</Label>
                    <Input
                      id="signup-confirm-password"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="flex items-start space-x-2">
                    <input
                      type="checkbox"
                      id="agree-terms"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      required
                      className="rounded border-input mt-1"
                    />
                    <Label htmlFor="agree-terms" className="text-sm cursor-pointer">
                      {t("agreeTerms") || "I agree to Terms & Privacy"} *
                    </Label>
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? t("creatingAccount") : t("signUp")}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card>
          <CardContent className="pt-6">
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={handleDemoMode}
              disabled={isLoading}
            >
              {t("tryDemo")} ({t("noAccountRequired")})
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-2">
              {t("demoModeSaves")}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
