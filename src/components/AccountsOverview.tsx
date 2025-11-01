import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Wallet, CreditCard, PiggyBank, Shield, Pencil, Trash2, Plus, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";

export interface Account {
  id: string;
  name: string;
  balance: number;
  iconType: string;
  color: string;
  isSpendable: boolean;
}

const getIcon = (iconType: string) => {
  const icons: Record<string, React.ReactNode> = {
    wallet: <Wallet className="w-5 h-5" />,
    creditCard: <CreditCard className="w-5 h-5" />,
    piggyBank: <PiggyBank className="w-5 h-5" />,
    shield: <Shield className="w-5 h-5" />,
  };
  return icons[iconType] || <Wallet className="w-5 h-5" />;
};

export const AccountsOverview = () => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", balance: "" });
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAccount, setNewAccount] = useState({
    name: "",
    balance: "",
    iconType: "wallet",
    color: "text-primary",
    isSpendable: true,
  });

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      if (data) {
        setAccounts(data.map(a => ({
          id: a.id,
          name: a.name,
          balance: Number(a.balance),
          iconType: a.icon_type,
          color: a.color,
          isSpendable: a.is_spendable
        })));
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const spendableBalance = accounts
    .filter(account => account.isSpendable)
    .reduce((sum, account) => sum + account.balance, 0);

  const handleEdit = (account: Account) => {
    setEditingId(account.id);
    setEditForm({ name: account.name, balance: account.balance.toString() });
  };

  const handleSaveEdit = async (id: string) => {
    const balance = parseFloat(editForm.balance);
    if (!editForm.name.trim() || isNaN(balance) || balance < 0) {
      toast({
        title: t("invalidInput"),
        description: t("pleaseEnterValid"),
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('accounts')
        .update({
          name: editForm.name.trim(),
          balance
        })
        .eq('id', id);

      if (error) throw error;

      setAccounts(accounts.map(acc => 
        acc.id === id 
          ? { ...acc, name: editForm.name.trim(), balance }
          : acc
      ));
      setEditingId(null);
      toast({
        title: t("accountUpdated"),
        description: t("accountDetailsSaved"),
      });
    } catch (error) {
      console.error('Error updating account:', error);
      toast({
        title: "Error",
        description: "Failed to update account",
        variant: "destructive",
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({ name: "", balance: "" });
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('accounts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setAccounts(accounts.filter(acc => acc.id !== id));
      toast({
        title: t("accountDeleted"),
        description: t("accountRemoved"),
      });
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        title: "Error",
        description: "Failed to delete account",
        variant: "destructive",
      });
    }
  };

  const handleToggleSpendable = async (id: string) => {
    const account = accounts.find(acc => acc.id === id);
    if (!account) return;

    try {
      const { error } = await supabase
        .from('accounts')
        .update({ is_spendable: !account.isSpendable })
        .eq('id', id);

      if (error) throw error;

      setAccounts(accounts.map(acc =>
        acc.id === id ? { ...acc, isSpendable: !acc.isSpendable } : acc
      ));
    } catch (error) {
      console.error('Error toggling spendable:', error);
      toast({
        title: "Error",
        description: "Failed to update account",
        variant: "destructive",
      });
    }
  };

  const handleAddAccount = async () => {
    const balance = parseFloat(newAccount.balance);
    if (!newAccount.name.trim() || isNaN(balance) || balance < 0) {
      toast({
        title: t("invalidInput"),
        description: t("pleaseEnterValid"),
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase
        .from('accounts')
        .insert({
          user_id: user.id,
          name: newAccount.name.trim(),
          balance,
          icon_type: newAccount.iconType,
          color: newAccount.color,
          is_spendable: newAccount.isSpendable
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const account: Account = {
          id: data.id,
          name: data.name,
          balance: Number(data.balance),
          iconType: data.icon_type,
          color: data.color,
          isSpendable: data.is_spendable
        };

        setAccounts([...accounts, account]);
        setNewAccount({
          name: "",
          balance: "",
          iconType: "wallet",
          color: "text-primary",
          isSpendable: true,
        });
        setShowAddForm(false);
        toast({
          title: t("accountAdded"),
          description: t("newAccountCreated"),
        });
      }
    } catch (error) {
      console.error('Error adding account:', error);
      toast({
        title: "Error",
        description: "Failed to add account",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="shadow-card xl:sticky xl:top-20">
      <CardHeader className="p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg sm:text-2xl">{t("accounts")}</CardTitle>
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            size="sm"
            variant={showAddForm ? "outline" : "default"}
          >
            {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            <span className="ml-2">{showAddForm ? t("cancel") : t("add")}</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
        {loading ? (
          <p className="text-center text-muted-foreground py-8">Loading...</p>
        ) : (
          <>
            <div className="p-3 sm:p-4 rounded-xl bg-gradient-primary text-primary-foreground">
              <p className="text-xs sm:text-sm opacity-90 mb-1">{t("totalSpendable")}</p>
              <p className="text-2xl sm:text-3xl font-bold">{spendableBalance.toFixed(3)} {t("kwd")}</p>
              <p className="text-[10px] sm:text-xs opacity-75 mt-1">{t("fromActiveAccounts")}</p>
            </div>

        {showAddForm && (
          <Card className="p-3 sm:p-4 bg-muted/30">
            <div className="space-y-3">
              <div>
                <Label htmlFor="new-account-name" className="text-xs">{t("accountName")}</Label>
                <Input
                  id="new-account-name"
                  value={newAccount.name}
                  onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                  placeholder={t("accountName")}
                  className="h-9"
                />
              </div>
              <div>
                <Label htmlFor="new-account-balance" className="text-xs">{t("balance")} ({t("kwd")})</Label>
                <Input
                  id="new-account-balance"
                  type="text"
                  inputMode="decimal"
                  value={newAccount.balance}
                  onChange={(e) => setNewAccount({ ...newAccount, balance: e.target.value })}
                  placeholder="0.000"
                  className="h-9"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="new-account-spendable" className="text-xs">{t("includeInTotal")}</Label>
                <Switch
                  id="new-account-spendable"
                  checked={newAccount.isSpendable}
                  onCheckedChange={(checked) => setNewAccount({ ...newAccount, isSpendable: checked })}
                />
              </div>
              <Button onClick={handleAddAccount} className="w-full" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                {t("createAccount")}
              </Button>
            </div>
          </Card>
        )}

        <div className="space-y-2 sm:space-y-3">
          {accounts.map((account) => (
            <div
              key={account.id}
              className="p-2.5 sm:p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
            >
              {editingId === account.id ? (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor={`edit-name-${account.id}`} className="text-xs">{t("name")}</Label>
                    <Input
                      id={`edit-name-${account.id}`}
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="h-8"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`edit-balance-${account.id}`} className="text-xs">{t("balance")} ({t("kwd")})</Label>
                    <Input
                      id={`edit-balance-${account.id}`}
                      type="text"
                      inputMode="decimal"
                      value={editForm.balance}
                      onChange={(e) => setEditForm({ ...editForm, balance: e.target.value })}
                      className="h-8"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => handleSaveEdit(account.id)} size="sm" className="flex-1">
                      <Check className="w-4 h-4 mr-1" />
                      {t("save")}
                    </Button>
                    <Button onClick={handleCancelEdit} size="sm" variant="outline" className="flex-1">
                      <X className="w-4 h-4 mr-1" />
                      {t("cancel")}
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className={`${account.color}`}>{getIcon(account.iconType)}</div>
                      <div>
                        <p className="font-medium text-xs sm:text-sm">{account.name}</p>
                        {account.isSpendable && (
                          <p className="text-[10px] text-muted-foreground">{t("spendable")}</p>
                        )}
                      </div>
                    </div>
                    <p className="font-semibold text-sm sm:text-base">{account.balance.toFixed(3)}</p>
                  </div>
                  <div className="flex items-center justify-between gap-2 pt-2 border-t">
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`spendable-${account.id}`} className="text-xs">{t("spendable")}</Label>
                      <Switch
                        id={`spendable-${account.id}`}
                        checked={account.isSpendable}
                        onCheckedChange={() => handleToggleSpendable(account.id)}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleEdit(account)}
                        size="sm"
                        variant="ghost"
                        className="h-8 px-2"
                      >
                        <Pencil className="w-3 h-3" />
                      </Button>
                      <Button
                        onClick={() => handleDelete(account.id)}
                        size="sm"
                        variant="ghost"
                        className="h-8 px-2 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
