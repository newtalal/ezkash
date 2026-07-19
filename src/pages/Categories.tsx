import { useEffect, useState } from "react";
import { DashboardNav } from "@/components/DashboardNav";
import { NavigationTabs } from "@/components/NavigationTabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2, Tag, Check, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { CategoryBudgetsCard } from "@/components/CategoryBudgetsCard";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Category {
  id: string;
  name: string;
}

const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [emoji, setEmoji] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [toDelete, setToDelete] = useState<Category | null>(null);

  const fetchCategories = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("categories")
      .select("id, name")
      .eq("user_id", user.id)
      .order("name");
    if (data) setCategories(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAdd = async () => {
    if (!newName.trim()) return toast.error("Enter a category name");
    const name = emoji ? `${emoji} ${newName.trim()}` : `📌 ${newName.trim()}`;
    if (categories.some((c) => c.name === name))
      return toast.error("Category already exists");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase
      .from("categories")
      .insert({ user_id: user.id, name });
    if (error) return toast.error("Failed to add category");
    setNewName("");
    setEmoji("");
    toast.success("Category added");
    fetchCategories();
  };

  const handleRename = async (cat: Category) => {
    const name = editingValue.trim();
    if (!name) return toast.error("Name required");
    if (name === cat.name) {
      setEditingId(null);
      return;
    }
    if (categories.some((c) => c.name === name && c.id !== cat.id))
      return toast.error("Category already exists");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Update category
    const { error } = await supabase
      .from("categories")
      .update({ name })
      .eq("id", cat.id);
    if (error) return toast.error("Failed to rename");

    // Cascade rename to transactions
    await supabase
      .from("transactions")
      .update({ category: name })
      .eq("user_id", user.id)
      .eq("category", cat.name);

    setEditingId(null);
    setEditingValue("");
    toast.success("Category renamed");
    fetchCategories();
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    if (categories.length <= 1) {
      toast.error("You must have at least one category");
      setToDelete(null);
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Move transactions to "📌 Other"
    const fallback = "📌 Other";
    const hasFallback = categories.some((c) => c.name === fallback);
    if (!hasFallback) {
      await supabase.from("categories").insert({ user_id: user.id, name: fallback });
    }
    await supabase
      .from("transactions")
      .update({ category: fallback })
      .eq("user_id", user.id)
      .eq("category", toDelete.name);

    const { error } = await supabase.from("categories").delete().eq("id", toDelete.id);
    if (error) return toast.error("Failed to delete");
    toast.success("Category deleted");
    setToDelete(null);
    fetchCategories();
  };

  return (
    <div className="min-h-dvh bg-background">
      <DashboardNav />
      <NavigationTabs />
      <main className="w-full max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Tag className="w-5 h-5 text-primary" />
              Manage Categories
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-[80px_1fr_auto] gap-2 items-end">
              <div className="space-y-1">
                <Label className="text-xs">Emoji</Label>
                <Input
                  placeholder="🎯"
                  value={emoji}
                  onChange={(e) => setEmoji(e.target.value)}
                  maxLength={2}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Name</Label>
                <Input
                  placeholder="Category name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                />
              </div>
              <Button onClick={handleAdd} className="gap-2">
                <Plus className="w-4 h-4" /> Add
              </Button>
            </div>

            {loading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : categories.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No categories yet.
              </p>
            ) : (
              <div className="space-y-2">
                {categories.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card gap-2"
                  >
                    {editingId === c.id ? (
                      <>
                        <Input
                          value={editingValue}
                          onChange={(e) => setEditingValue(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleRename(c)}
                          className="flex-1"
                          autoFocus
                        />
                        <Button size="icon" variant="ghost" onClick={() => handleRename(c)}>
                          <Check className="w-4 h-4 text-emerald-600" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => setEditingId(null)}>
                          <X className="w-4 h-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <span className="text-sm flex-1 truncate">{c.name}</span>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={() => {
                            setEditingId(c.id);
                            setEditingValue(c.name);
                          }}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => setToDelete(c)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <CategoryBudgetsCard categories={categories.map((c) => c.name)} />

        <AlertDialog open={!!toDelete} onOpenChange={(open) => !open && setToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete category?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{toDelete?.name}"? Any transactions using
                this category will be moved to "📌 Other".
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  );
};

export default Categories;