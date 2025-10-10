import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Wallet, TrendingUp, Shield, Zap, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const Index = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const features = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: t("lightningFastEntry"),
      description: t("logTransactions"),
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: t("smartInsights"),
      description: t("realtimeSpending"),
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: t("securePrivate"),
      description: t("dataStaysProtected"),
    },
  ];

  const benefits = [
    t("trackIncomeExpenses"),
    t("manageMultipleAccounts"),
    t("customMonthlyCycles"),
    t("smartSpendingAlerts"),
    t("simplePayment"),
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
                <p className="text-xs text-muted-foreground">{t("trackEveryDinar")}</p>
              </div>
            </div>
            <Button onClick={() => navigate("/auth")} className="bg-gradient-primary">
              {t("getStarted")}
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-5xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
                {t("takeControlFinances")}
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                {t("fastestIntuitive")}
              </p>
              
              <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto mt-12">
                <Card className="shadow-card hover:shadow-elevated transition-shadow">
                  <CardContent className="pt-6 pb-6">
                    <h3 className="text-xl font-semibold mb-3">{t("newUser")}</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      {t("startTrackingFinances")}
                    </p>
                    <Button
                      onClick={() => navigate("/auth?mode=signup")}
                      className="w-full bg-gradient-primary"
                      size="lg"
                    >
                      {t("getStarted")}
                    </Button>
                  </CardContent>
                </Card>

                <Card className="shadow-card hover:shadow-elevated transition-shadow">
                  <CardContent className="pt-6 pb-6">
                    <h3 className="text-xl font-semibold mb-3">{t("existingUser")}</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      {t("welcomeBackSignIn")}
                    </p>
                    <Button
                      onClick={() => navigate("/auth?mode=signin")}
                      variant="outline"
                      className="w-full"
                      size="lg"
                    >
                      {t("signIn")}
                    </Button>
                  </CardContent>
                </Card>
              </div>
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
                    {t("everythingYouNeed")}
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
                      {t("getStartedNow")}
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
          <p>© 2025 EzKash. {t("copyright")}</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
