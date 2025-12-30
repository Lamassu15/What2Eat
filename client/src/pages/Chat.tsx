import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useRecipes } from "@/context/RecipeContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Send,
  Sparkles,
  Loader,
  Soup,
  CookingPot,
  ChartBarStacked,
  Timer,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

const Chat = () => {
  const [ingredients, setIngredients] = useState("");
  // use the generate mutation from the shared recipes context
  const { generate } = useRecipes();
  const recipe = generate.data;
  const isGenerating = generate.isPending;
  const error = generate.error;

  const generateRecipeHandler = async () => {
    if (!ingredients.trim() || isGenerating) return;

    await toast.promise(generate.mutateAsync({ ingredients }), {
      loading: "Generating recipe...",
      success: "Recipe generated",
      error: (err) =>
        err instanceof Error ? err.message : "Something went wrong",
    });
  };

  const { user } = useAuth();

  if (!user) return <p>Loading user info...</p>;

  return (
    <Card className="flex flex-col flex-1 w-full max-h-screen max-w-7xl mx-auto">
      <CardHeader className="flex items-center gap-3">
        <Avatar className="w-10 h-10">
          <AvatarFallback>AI</AvatarFallback>
        </Avatar>
        <div>
          <CardTitle className="text-lg text-accent">
            Recipe AI Assistant
          </CardTitle>
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Generate recipes from ingredients.
          </div>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="flex flex-col flex-1 min-h-0">
        {!recipe && !isGenerating && (
          <div className="flex flex-col gap-6 items-center justify-center h-full min-h-[300px]">
            <h1 className="heading-5 text-center text-accent-foreground">
              Hello{" "}
              <strong className="text-gradient">
                {user.firstName} {user.lastName}
              </strong>
              , Ready to generate some delicious recipes?
            </h1>
          </div>
        )}
        <ScrollArea className="flex-1 h-full">
          {recipe && (
            <div className="flex flex-col gap-6 items-center ">
              {/* Title */}
              <h1 className="heading-1 text-center bg-gradient-to-r from-lime-400 to-indigo-600 bg-clip-text text-transparent">
                {recipe.title}
              </h1>
              {/* Description */}
              <p className="text-muted-foreground text-center max-w-xl">
                {recipe.description}
              </p>
              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full">
                <div className="flex flex-col items-center bg-background rounded-md p-3 shadow-sm">
                  <Timer className="h-5 w-5 text-primary mb-1" />
                  <span className="text-xs text-muted-foreground">
                    Preparation Time
                  </span>
                  <span className="font-semibold">
                    {recipe.preparationTime}
                  </span>
                </div>

                <div className="flex flex-col items-center bg-background rounded-md p-3 shadow-sm">
                  <CookingPot className="h-5 w-5 text-primary mb-1" />
                  <span className="text-xs text-muted-foreground">
                    Cook Time
                  </span>
                  <span className="font-semibold">{recipe.cookingTime}</span>
                </div>

                <div className="flex flex-col items-center bg-background rounded-md p-3 shadow-sm">
                  <Soup className="h-5 w-5 text-primary mb-1" />
                  <span className="text-xs text-muted-foreground">
                    Servings
                  </span>
                  <span className="font-semibold">{recipe.servings}</span>
                </div>

                <div className="flex flex-col items-center bg-background rounded-md p-3 shadow-sm">
                  <ChartBarStacked className="h-5 w-5 text-primary mb-1" />
                  <span className="text-xs text-muted-foreground">
                    Category
                  </span>
                  <span className="font-semibold">{recipe.category}</span>
                </div>
              </div>
              {/* Ingredients */}
              <div className="w-full bg-muted/20 rounded-md p-5 shadow-sm">
                <h3 className="font-semibold mb-3 text-lg flex items-center gap-2">
                  🥗 Ingredients
                </h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  {(recipe.ingredients || []).map((ing, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-2 bg-background rounded-md px-3 py-2 shadow-sm"
                    >
                      <span className="text-primary font-medium">
                        {ing.quantity}
                      </span>
                      {ing.unit && (
                        <span className="text-muted-foreground">
                          {ing.unit}
                        </span>
                      )}
                      <span>{ing.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
              {/* Instructions */}
              <div className="w-full bg-muted/20 rounded-md p-5 shadow-sm">
                <h3 className="font-semibold mb-3 text-lg flex items-center gap-2">
                  🍳 Instructions
                </h3>
                <ol className="space-y-2">
                  {(recipe.instructions || []).map((step) => (
                    <li
                      key={step.stepNumber}
                      className="flex gap-3 items-start bg-background rounded-md p-3 shadow-sm"
                    >
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        {step.stepNumber}
                      </span>
                      <p className="text-sm">{step.description}</p>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          )}
        </ScrollArea>
      </CardContent>
      <Separator />
      <CardFooter className="flex flex-col gap-3">
        <div className="relative w-full">
          <Textarea
            placeholder="Write ingredients, e.g. 'Tomato, Egg, Butter & Salt' or a dish like 'Carbonara, Smashed burger'."
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            className="pr-12 resize-none w-full overflow-x-hidden text-xs"
            rows={3}
          />
          <Button
            size="icon"
            className="absolute bottom-4 right-2 h-8 w-8"
            onClick={generateRecipeHandler}
            disabled={isGenerating || ingredients.trim().length === 0}
          >
            {isGenerating ? (
              <Loader className="animate-spin h-4 w-4" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        {error && (
          <p className="text-destructive text-sm">
            {error instanceof Error ? error.message : "Error"}
          </p>
        )}
      </CardFooter>
    </Card>
  );
};

export default Chat;
