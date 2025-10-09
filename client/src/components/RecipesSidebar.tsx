import { NavLink } from "react-router";
import {
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./ui/sidebar";
import { useRecipes, type Recipe } from "@/context/RecipeContext";
import { LoaderCircle, EllipsisVertical, Trash2 } from "lucide-react";
import { MdOutlineFastfood } from "react-icons/md";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";

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
import { useState } from "react";

const RecipesSidebar = () => {
  const { isAuthenticated } = useAuth();
  const { recipes, isLoading, error, remove } = useRecipes();

  // track deletion state per-item via the mutation's status

  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  const truncateWords = (text: string, wordLimit: number) => {
    const words = text.split(" ");
    if (words.length > wordLimit) {
      return words.slice(0, wordLimit).join(" ") + "...";
    }
    return text;
  };

  return (
    <>
      {isAuthenticated() && (
        <SidebarGroupContent>
          <SidebarGroupLabel>Recipes</SidebarGroupLabel>
          {/* react-query provides isLoading; updates after mutations are indicated by reloads */}
          <ScrollArea className="h-[800px]">
            <SidebarMenu>
              {isLoading && (
                <div className="flex items-center gap-2 p-2 text-xs text-muted-foreground">
                  <LoaderCircle className="animate-spin h-4 w-4" />
                  isLoading recipes...
                </div>
              )}

              {error && !isLoading && (
                <div className="p-4 text-sm text-destructive">
                  {error.message}
                </div>
              )}

              {!isLoading && !error && recipes.length === 0 && (
                <div className="p-4 text-sm text-muted-foreground">
                  No recipes found.
                </div>
              )}

              {!isLoading &&
                !error &&
                recipes.length > 0 &&
                recipes.map((recipe: Recipe) => (
                  <SidebarMenuItem key={recipe.id}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={`/recipes/${recipe.id}`}
                        title={recipe.title}
                      >
                        <MdOutlineFastfood />
                        <span className="truncate">
                          {truncateWords(recipe.title, 3)}
                        </span>
                      </NavLink>
                    </SidebarMenuButton>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <SidebarMenuAction>
                          <EllipsisVertical />
                        </SidebarMenuAction>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent side="right" align="center">
                        <DropdownMenuItem
                          onClick={() => setSelectedRecipe(recipe)}
                          disabled={
                            (remove as { status?: string })?.status ===
                            "loading"
                          }
                        >
                          <Trash2 />
                          <span>Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </SidebarMenuItem>
                ))}
            </SidebarMenu>
          </ScrollArea>

          {/* AlertDialog */}
          {selectedRecipe && (
            <AlertDialog
              open={!!selectedRecipe}
              onOpenChange={(open) => {
                if (!open) setSelectedRecipe(null);
              }}
            >
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Recipe</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{selectedRecipe.title}"?
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={async () => {
                      if (!selectedRecipe) return;
                      const id = selectedRecipe.id;
                      // show toast while deleting and await mutation
                      try {
                        await toast.promise(remove.mutateAsync(id), {
                          loading: `Deleting recipe...`,
                          success: `Recipe deleted`,
                          error: (err: unknown) => {
                            return err instanceof Error
                              ? err.message
                              : String(err || "Failed to delete");
                          },
                        });
                      } catch {
                        // swallow - toast already showed the error
                      } finally {
                        setSelectedRecipe(null);
                      }
                    }}
                    disabled={
                      (remove as { status?: string })?.status === "loading"
                    }
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </SidebarGroupContent>
      )}
    </>
  );
};

export default RecipesSidebar;
