import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Wallet, TrendingUp, Shield, Zap, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Lightning Fast Entry",
      description: "Log transactions in under 10 seconds",
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Smart Insights",
      description: "Real-time spending analysis and alerts",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Secure & Private",
      description: "Your financial data stays protected",
    },
  ];

  const benefits = [
    "Track income and expenses effortlessly",
    "Manage multiple accounts and payment methods",
    "Custom monthly cycles (20th-19th)",
    "Smart spending alerts and daily budgets",
    "Simple one-time payment",
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card shadow-card">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-lg">
                <Wallet className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">EzKash</h1>
                <p className="text-xs text-muted-foreground">Track every dinar</p>
              </div>
            </div>
            <Button onClick={() => navigate("/auth")} className="bg-gradient-primary">
              Get Started
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-5xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
                Take Control of Your Finances
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                The fastest, most intuitive way to track spending and stay on budget.
                Designed for people who value their time and money.
              </p>
              <Button
                onClick={() => navigate("/auth")}
                size="lg"
                className="bg-gradient-primary text-lg h-14 px-8"
              >
                Get Started
              </Button>
              <p className="text-sm text-muted-foreground mt-4">
                No credit card required • One-time payment of 20 KWD
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-20">
              {features.map((feature, index) => (
                <Card key={index} className="shadow-card hover:shadow-elevated transition-shadow">
                  <CardContent className="pt-6">
                    <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center mb-4 text-primary-foreground">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="shadow-elevated bg-gradient-primary text-primary-foreground">
              <CardContent className="py-12 px-8">
                <div className="max-w-2xl mx-auto">
                  <h3 className="text-3xl font-bold mb-6 text-center">
                    Everything you need to manage money
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {benefits.map((benefit, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary-foreground/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-4 h-4" />
                        </div>
                        <p className="text-primary-foreground/90">{benefit}</p>
                      </div>
                    ))}
                  </div>
                  <div className="text-center mt-8">
                    <Button
                      onClick={() => navigate("/auth")}
                      variant="secondary"
                      size="lg"
                      className="text-lg h-12 px-8"
                    >
                      Get Started Now
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8 px-4">
        <div className="container mx-auto text-center text-muted-foreground text-sm">
          <p>© 2025 EzKash. Take control of your finances.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
