import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Settings, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

interface CategoryManagerProps {
  categories: string[];
  onCategoriesChange: (categories: string[]) => void;
}

export const CategoryManager = ({ categories, onCategoriesChange }: CategoryManagerProps) => {
  const [newCategory, setNewCategory] = useState("");
  const [emoji, setEmoji] = useState("");

  const handleAddCategory = () => {
    if (!newCategory.trim()) {
      toast.error("Please enter a category name");
      return;
    }

    const categoryWithEmoji = emoji ? `${emoji} ${newCategory}` : `📌 ${newCategory}`;
    
    if (categories.includes(categoryWithEmoji)) {
      toast.error("Category already exists");
      return;
    }

    onCategoriesChange([...categories, categoryWithEmoji]);
    setNewCategory("");
    setEmoji("");
    toast.success("Category added successfully!");
  };

  const handleRemoveCategory = (category: string) => {
    if (categories.length <= 1) {
      toast.error("You must have at least one category");
      return;
    }

    onCategoriesChange(categories.filter(c => c !== category));
    toast.success("Category removed successfully!");
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings className="w-4 h-4" />
          Manage Categories
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>Manage Categories</SheetTitle>
          <SheetDescription>
            Add or remove expense categories
          </SheetDescription>
        </SheetHeader>
        
        <ScrollArea className="flex-1 mt-6 pr-4">
          <div className="space-y-6">
            {/* Add new category */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="emoji">Emoji (Optional)</Label>
                <Input
                  id="emoji"
                  placeholder="🎯"
                  value={emoji}
                  onChange={(e) => setEmoji(e.target.value)}
                  maxLength={2}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Category Name</Label>
                <Input
                  id="category"
                  placeholder="Enter category name"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleAddCategory();
                    }
                  }}
                />
              </div>
              
              <Button onClick={handleAddCategory} className="w-full gap-2">
                <Plus className="w-4 h-4" />
                Add Category
              </Button>
            </div>

            {/* Category list */}
            <div className="space-y-2">
              <Label>Current Categories</Label>
              <div className="space-y-2">
                {categories.map((category) => (
                  <div
                    key={category}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card"
                  >
                    <span className="text-sm">{category}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveCategory(category)}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
