import Link from "next/link";
import type { Route } from "next";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  formatInventoryStatus,
  INVENTORY_PRICE_RANGES,
  type InventoryFilterState,
  VEHICLE_STATUS_OPTIONS,
} from "@/lib/bird-dog/inventory";

type VehicleFiltersProps = {
  filters: InventoryFilterState;
  makeOptions: string[];
  locationOptions: string[];
  clearHref: Route;
};

export function VehicleFilters({
  filters,
  makeOptions,
  locationOptions,
  clearHref,
}: VehicleFiltersProps) {
  return (
    <form className="grid gap-4 rounded-[2rem] border border-white/10 bg-card/85 p-4 shadow-2xl shadow-black/25 backdrop-blur-xl md:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr_1fr_auto]">
      <FilterField
        label="Search"
        name="q"
        placeholder="Make, model, year, dealership, VIN, or location"
        value={filters.searchTerm}
      />
      <SelectFilter label="Make" name="make" value={filters.selectedMake}>
        <option value="all">All makes</option>
        {makeOptions.map((make) => (
          <option key={make} value={make}>
            {make}
          </option>
        ))}
      </SelectFilter>
      <SelectFilter label="Price" name="price_range" value={filters.selectedPriceRange}>
        {INVENTORY_PRICE_RANGES.map((range) => (
          <option key={range.value} value={range.value}>
            {range.label}
          </option>
        ))}
      </SelectFilter>
      <SelectFilter label="Location" name="location" value={filters.selectedLocation}>
        <option value="all">All locations</option>
        {locationOptions.map((location) => (
          <option key={location} value={location}>
            {location}
          </option>
        ))}
      </SelectFilter>
      <SelectFilter label="Status" name="status" value={filters.selectedStatus}>
        <option value="all">All statuses</option>
        {VEHICLE_STATUS_OPTIONS.map((status) => (
          <option key={status} value={status}>
            {formatInventoryStatus(status)}
          </option>
        ))}
      </SelectFilter>
      <div className="flex items-end gap-2">
        <Button className="flex-1" type="submit">
          Search
        </Button>
        <Button asChild variant="outline">
          <Link href={clearHref}>Clear</Link>
        </Button>
      </div>
    </form>
  );
}

function FilterField({
  label,
  name,
  value,
  placeholder,
}: {
  label: string;
  name: string;
  value?: string;
  placeholder?: string;
}) {
  return (
    <div className="space-y-2.5">
      <Label htmlFor={name}>{label}</Label>
      <Input
        defaultValue={value ?? ""}
        id={name}
        name={name}
        placeholder={placeholder}
      />
    </div>
  );
}

function SelectFilter({
  label,
  name,
  value,
  children,
}: {
  label: string;
  name: string;
  value: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2.5">
      <Label htmlFor={name}>{label}</Label>
      <select
        className="flex h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-foreground shadow-inner shadow-black/20 hover:border-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        defaultValue={value}
        id={name}
        name={name}
      >
        {children}
      </select>
    </div>
  );
}
