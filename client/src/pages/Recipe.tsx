import { useParams } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRecipeById } from "../context/RecipeContext";
import { SectionTitle } from "@/components/ui/SectionTitle";
import {
  Timer,
  CookingPot,
  Soup,
  CalendarDays,
  AlertCircleIcon,
} from "lucide-react";
import { TbShare2 } from "react-icons/tb";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const Recipe = () => {
  const { id } = useParams<{ id: string }>();
  const recipeId = id ? parseInt(id, 10) : NaN;
  const { data: recipe, isLoading, error } = useRecipeById(recipeId);
  const handleCopyLink = () => {
    const BASE_URL = window.location.origin;
    const recipeUrl = `${BASE_URL}/recipes/${recipeId}`;

    navigator.clipboard
      .writeText(recipeUrl)
      .then(() => {
        toast.success("Link copied! Share with a friend.", {
          description: recipeUrl,
        });
      })
      .catch(() => {
        toast.error("Failed to copy link address.");
      });
  };

  // 🌀 Loading skeleton
  if (isLoading) {
    return (
      <div className="w-full flex items-center justify-center">
        <div className="w-full max-w-4xl space-y-6">
          <Skeleton className="h-64 w-full rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-1/3" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-40 w-full md:col-span-2" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ⚠️ Error state
  if (error) {
    return (
      <div className="w-full p-6 flex justify-center items-center">
        <div className="w-full max-w-lg">
          <Alert variant="default">
            <AlertCircleIcon />
            <AlertTitle>Error loading recipe.</AlertTitle>
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  // ❌ Recipe not found
  if (!recipe) {
    return (
      <div className="w-full p-6 flex justify-center items-center">
        <div className="w-full max-w-lg">
          <Alert variant="destructive">
            <AlertCircleIcon />
            <AlertTitle>Recipe Not Found</AlertTitle>
            <AlertDescription>
              This recipe may have been removed or is private.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  // ✅ Recipe details
  return (
    <>
      <section className="flex flex-col items-center w-full">
        <SectionTitle title="Recipe Details" subtitle={recipe.title} />
        <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT SIDEBAR */}
          <aside className="lg:col-span-1 flex flex-col gap-6">
            {/* Info Card */}
            <Card>
              <CardContent className="flex flex-col gap-4">
                <div className="flex flex-col items-center text-center">
                  <h1 className="uppercase text-2xl font-bold dark:bg-gradient-to-r dark:from-lime-400 dark:to-indigo-600 dark:bg-clip-text dark:text-transparent bg-gradient-to-r from-slate-900 to-slate-500 bg-clip-text text-transparent">
                    {recipe.title}
                  </h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    {recipe.category}
                  </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div className="flex flex-col items-center bg-background rounded-md p-3 shadow-sm">
                    <Timer className="h-5 w-5 text-primary mb-1" />
                    <span className="text-xs text-muted-foreground">
                      Prep Time
                    </span>
                    <span className="font-semibold">
                      {recipe.preparationTime ?? "-"}
                    </span>
                  </div>

                  <div className="flex flex-col items-center bg-background rounded-md p-3 shadow-sm">
                    <CookingPot className="h-5 w-5 text-primary mb-1" />
                    <span className="text-xs text-muted-foreground">
                      Cook Time
                    </span>
                    <span className="font-semibold">
                      {recipe.cookingTime ?? "-"}
                    </span>
                  </div>

                  <div className="flex flex-col items-center bg-background rounded-md p-3 shadow-sm">
                    <Soup className="h-5 w-5 text-primary mb-1" />
                    <span className="text-xs text-muted-foreground">
                      Servings
                    </span>
                    <span className="font-semibold">
                      {recipe.servings ?? "-"}
                    </span>
                  </div>

                  <div className="flex flex-col items-center bg-background rounded-md p-3 shadow-sm">
                    <CalendarDays className="h-5 w-5 text-primary mb-1" />
                    <span className="text-xs text-muted-foreground">
                      Created
                    </span>
                    <span className="font-semibold">
                      {recipe.createdAt
                        ? new Date(recipe.createdAt).toLocaleDateString()
                        : "-"}
                    </span>
                  </div>
                </div>
                <Button variant="outline" onClick={handleCopyLink}>
                  Share recipe
                  <TbShare2 />
                </Button>
              </CardContent>
            </Card>

            {/* Ingredients */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex flex-col items-center">
                  🥗 Ingredients
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  {recipe.ingredients && recipe.ingredients.length > 0 ? (
                    recipe.ingredients.map((ing) => (
                      <li
                        key={ing.id}
                        className="flex items-center justify-between bg-background rounded-md px-3 py-2 shadow-sm"
                      >
                        <span>{ing.name}</span>
                        <span className="text-muted-foreground text-xs">
                          {ing.quantity}
                          {ing.unit ? ` ${ing.unit}` : ""}
                        </span>
                      </li>
                    ))
                  ) : (
                    <li className="text-sm text-muted-foreground">
                      No ingredients listed.
                    </li>
                  )}
                </ul>
              </CardContent>
            </Card>
          </aside>

          {/* MAIN CONTENT */}
          <Card className="lg:col-span-2">
            <CardContent>
              <h2 className="text-lg font-semibold mb-3">📝 Description</h2>
              <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                {recipe.description ?? "No description provided."}
              </p>

              <div className="mt-3">
                <h3 className="text-lg font-semibold mb-3">🍳 Instructions</h3>
                <ol className="space-y-2">
                  {recipe.instructions && recipe.instructions.length > 0 ? (
                    recipe.instructions
                      .slice()
                      .sort((a, b) => a.stepNumber - b.stepNumber)
                      .map((ins) => (
                        <li
                          key={ins.id}
                          className="flex gap-3 items-start bg-background rounded-md p-3 shadow-sm"
                        >
                          <span className="flex items-center justify-center aspect-square min-w-[24px] rounded-full bg-primary text-primary-foreground text-xs font-bold">
                            {ins.stepNumber}
                          </span>

                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {ins.description}
                          </p>
                        </li>
                      ))
                  ) : (
                    <li className="text-sm text-muted-foreground">
                      No instructions provided.
                    </li>
                  )}
                </ol>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
};

export default Recipe;
