import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Wallet } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement actual authentication with backend
    console.log("Auth attempt:", { email, isLogin });
    navigate("/dashboard");
  };

  return (
    <div className="min-h-dvh flex items-center justify-center bg-background p-3 sm:p-4">
      <Card className="w-full max-w-md shadow-elevated">
        <CardHeader className="space-y-3 sm:space-y-4 text-center">
          <div className="mx-auto w-14 h-14 sm:w-16 sm:h-16 bg-gradient-primary rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
            <Wallet className="w-7 h-7 sm:w-8 sm:h-8 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-xl sm:text-2xl font-bold">
              {isLogin ? "Welcome back" : "Get started"}
            </CardTitle>
            <CardDescription className="text-sm">
              {isLogin
                ? "Sign in to continue tracking your finances"
                : "Start your 7-day free trial"}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full bg-gradient-primary">
              {isLogin ? "Sign in" : "Start free trial"}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              className="w-full"
              onClick={() => navigate("/dashboard")}
            >
              Try Demo
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-primary hover:underline font-medium"
              >
                {isLogin ? "Sign up" : "Sign in"}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
