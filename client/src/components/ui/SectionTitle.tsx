import React from "react";
import { cn } from "@/lib/utils";

interface SectionTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  className?: string;
  title: string;
  subtitle?: string;
  centered?: boolean;
}

export const SectionTitle: React.FC<SectionTitleProps> = ({
  className,
  title,
  subtitle,
  centered = true,
}) => {
  return (
    <section
      className={cn(centered ? "text-center" : "text-left", "m-12", className)}
    >
      <h2 className="heading-2 font-bold">{title}</h2>
      {subtitle && (
        <p className="text-muted-foreground mt-3 max-w-2xl mx-auto paragraph">
          {subtitle}
        </p>
      )}
      <div
        className={cn("h-1 w-24 bg-primary mt-4", centered ? "mx-auto" : "")}
      ></div>
    </section>
  );
};
