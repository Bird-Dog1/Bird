import type { ReactNode } from "react";

import { EmptyState } from "@/components/app/empty-state";

type InventoryEmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

export function InventoryEmptyState({
  title,
  description,
  action,
}: InventoryEmptyStateProps) {
  return <EmptyState action={action} description={description} title={title} />;
}
