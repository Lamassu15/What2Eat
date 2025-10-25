import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Bot, CookingPot, List } from "lucide-react";
import { features } from "@/data/feature";
import { Link } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { JSX } from "react";
import { SectionTitle } from "@/components/ui/SectionTitle";

const iconMap: Record<string, JSX.Element> = {
  CookingPot: <CookingPot />,
  Bot: <Bot />,
  List: <List />,
};

const Home = () => {
  return (
    <div className="w-full h-full flex flex-col items-center bg-background">
      {/* Hero Content */}
      <div className="relative z-10 mt-20 mb-20 flex flex-col items-center justify-center text-center">
        <div className="max-w-4xl mx-auto animate-slide-up">
          <Badge
            variant="secondary"
            className="mb-4 bg-secondary text-secondary-foreground"
          >
            Welcome to What2Eat
          </Badge>

          <h1 className="heading-1 font-bold mb-6 leading-tight text-foreground">
            Your Personal
            <span className="block bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
              AI Recipe Generator
            </span>
          </h1>

          <p className="paragraph mb-8 max-w-2xl mx-auto leading-relaxed text-muted-foreground">
            Discover, create, and organize your culinary adventures. From family
            recipes to new discoveries, keep them all in one beautiful place.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="default">
              <Link to="/chat">
                Generate Recipes
                <ArrowRight />
              </Link>
            </Button>

            <Button asChild size="lg" variant="outline">
              <Link to="/Register">
                Create Account
                <ArrowRight />
              </Link>
            </Button>
          </div>
        </div>
      </div>
      <hr className="my-12 w-full h-px border-t-0 bg-transparent bg-gradient-to-r from-transparent via-neutral-500 to-transparent opacity-25 dark:via-neutral-400"></hr>
      {/* Features Section */}
      <section className="relative z-10  bg-background">
        <div className="max-w-5xl mx-auto">
          <SectionTitle
            title="Features"
            subtitle="Create a recipe by a click"
          ></SectionTitle>
          <div className="grid grid-cols-1 lg:grid-cols-3  gap-8">
            {features.map((feature) => (
              <Card
                key={feature.title}
                className="bg-card text-card-foreground shadow-lg"
              >
                <CardHeader className="flex flex-col items-center">
                  {iconMap[feature.icon] && (
                    <span className="mb-4">{iconMap[feature.icon]}</span>
                  )}
                  <CardTitle className="text-xl font-semibold text-center mb-2">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center text-muted-foreground text-base">
                  {feature.description}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
