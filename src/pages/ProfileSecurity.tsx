import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DashboardNav } from "@/components/DashboardNav";
import { NavigationTabs } from "@/components/NavigationTabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { User, KeyRound, Shield, Trash2, LogOut } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { z } from "zod";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const profileSchema = z.object({
  fullName: z.string().trim().min(2).max(100),
  username: z.string().trim().min(3).max(50)
    .regex(/^[a-z0-9_]+$/, { message: "Username must be lowercase letters, numbers, or underscore only" }),
  phone: z.string().trim().optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string()
    .min(10, { message: "Password must be at least 10 characters" })
    .max(72)
    .regex(/[A-Z]/, { message: "Must contain uppercase letter" })
    .regex(/[a-z]/, { message: "Must contain lowercase letter" })
    .regex(/[0-9]/, { message: "Must contain number" })
    .regex(/[^A-Za-z0-9]/, { message: "Must contain special character" }),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const ProfileSecurity = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Profile form state
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");

  // Password form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }
      setUser(user);

      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
        setFullName(profileData.full_name || '');
        setUsername(profileData.username || '');
        setPhone(profileData.phone || '');
      }
    };

    getUser();
  }, [navigate]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validated = profileSchema.parse({ fullName, username, phone: phone || undefined });
      setIsLoading(true);

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: validated.fullName,
          username: validated.username,
          phone: validated.phone || null,
        })
        .eq('id', user.id);

      if (error) {
        if (error.message.includes('unique')) {
          toast.error("Username or phone already taken");
        } else {
          toast.error(error.message);
        }
        return;
      }

      await supabase.rpc('log_audit_event', {
        p_action: 'profile_updated'
      });

      toast.success("Profile updated successfully!");
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

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validated = passwordSchema.parse({ currentPassword, newPassword, confirmPassword });
      setIsLoading(true);

      // Verify current password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: validated.currentPassword,
      });

      if (signInError) {
        toast.error("Current password is incorrect");
        return;
      }

      // Update password
      const { error } = await supabase.auth.updateUser({
        password: validated.newPassword
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      await supabase.rpc('log_audit_event', {
        p_action: 'password_changed'
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password changed successfully!");
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

  const handleLogoutAll = async () => {
    try {
      await supabase.auth.signOut({ scope: 'global' });
      await supabase.rpc('log_audit_event', {
        p_action: 'logout_all_devices'
      });
      toast.success("Logged out from all devices");
      navigate("/auth");
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase.rpc('delete_user_account');
      
      if (error) {
        toast.error("Failed to delete account: " + error.message);
        return;
      }
      
      toast.success("Account deleted successfully");
      // User will be automatically signed out after account deletion
      navigate("/auth");
    } catch (error) {
      toast.error("An error occurred while deleting your account");
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-dvh bg-background w-full max-w-full overflow-x-hidden pb-[calc(env(safe-area-inset-bottom)+16px)]">
      <DashboardNav />
      <NavigationTabs />
      <main className="w-full max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
        <h1 className="text-2xl font-bold">{t("profileSecurity") || "Profile & Security"}</h1>

        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Profile Information
            </CardTitle>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email (Cannot be changed)</Label>
                <Input
                  id="email"
                  type="email"
                  value={user.email}
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase())}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={isLoading}
                  placeholder="+1234567890"
                />
              </div>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <KeyRound className="w-5 h-5" />
              Change Password
            </CardTitle>
            <CardDescription>Update your password</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground">
                  Min 10 chars, include uppercase, lowercase, number, and symbol
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Updating..." : "Update Password"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Security Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Security
            </CardTitle>
            <CardDescription>Manage your account security</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Sessions</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Logout from all devices to revoke all active sessions
              </p>
              <Button variant="outline" onClick={handleLogoutAll}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout All Devices
              </Button>
            </div>

            <Separator />

            <div>
              <h3 className="text-sm font-medium mb-2 text-destructive">Danger Zone</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Permanently delete your account and all associated data
              </p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your
                      account and remove all your data from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteAccount}>
                      Delete Account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ProfileSecurity;
