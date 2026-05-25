import type { ReactNode } from "react";

import { Card, CardContent } from "@/components/ui/card";

type EmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <Card className="border-dashed border-white/15">
      <CardContent className="space-y-5 p-8 text-center sm:p-10">
        <div className="mx-auto h-12 w-12 rounded-full border border-white/10 bg-white/[0.05]" />
        <div>
          <h2 className="text-2xl font-semibold tracking-[-0.03em]">{title}</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        </div>
        {action ? <div className="flex justify-center">{action}</div> : null}
      </CardContent>
    </Card>
  );
}
