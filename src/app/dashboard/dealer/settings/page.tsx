import Link from "next/link";

import { updateDealershipProfile } from "@/app/dashboard/actions";
import { DealerPageHeader, EmptyState, StatusMessage } from "@/components/dealer/dealer-shell";
import { TextField } from "@/components/forms/form-field";
import { FormSection } from "@/components/forms/form-section";
import { SubmitButton } from "@/components/forms/submit-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { dealershipQuery, getDealerContext } from "@/lib/dealer/dashboard";

type SettingsPageProps = {
  searchParams: Promise<{
    dealership?: string;
    error?: string;
    message?: string;
  }>;
};

export const metadata = {
  title: "Dealership settings",
};

export default async function DealerSettingsPage({ searchParams }: SettingsPageProps) {
  const params = await searchParams;
  const { dealerships, dealership } = await getDealerContext(params.dealership);

  return (
    <div className="space-y-6">
      <DealerPageHeader
        description="Edit dealership profile information shown across Bird Dog."
        title="Dealership settings"
      />
      <StatusMessage error={params.error} message={params.message} />
      {!dealership ? (
        <EmptyState
          description="No dealership assignment was found for this account."
          title="No dealership assigned"
        />
      ) : (
        <>
          {dealerships.length > 1 ? (
            <Card>
              <CardHeader>
                <CardTitle>Dealerships</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {dealerships.map((item) => (
                  <Button
                    asChild
                    key={item.id}
                    size="sm"
                    variant={item.id === dealership.id ? "default" : "outline"}
                  >
                    <Link href={`/dashboard/dealer/settings${dealershipQuery(item)}`}>
                      {item.name}
                    </Link>
                  </Button>
                ))}
              </CardContent>
            </Card>
          ) : null}
          <FormSection
            description="Only profile fields are editable by dealers; approval and suspension status stay admin-controlled."
            title={dealership.name}
          >
            <form action={updateDealershipProfile} className="grid gap-5">
              <input name="dealership_id" type="hidden" value={dealership.id} />
              <div className="grid gap-4 md:grid-cols-2">
                <TextField
                  defaultValue={dealership.name}
                  label="Dealership name"
                  name="name"
                  required
                />
                <TextField
                  defaultValue={dealership.phone ?? ""}
                  label="Phone"
                  name="phone"
                />
                <TextField
                  className="md:col-span-2"
                  defaultValue={dealership.address ?? ""}
                  label="Address"
                  name="address"
                />
                <TextField
                  defaultValue={dealership.city}
                  label="City"
                  name="city"
                  required
                />
                <TextField
                  defaultValue={dealership.state}
                  label="State"
                  maxLength={2}
                  name="state"
                  required
                />
                <TextField defaultValue={dealership.zip ?? ""} label="ZIP" name="zip" />
                <TextField
                  defaultValue={dealership.website ?? ""}
                  label="Website"
                  name="website"
                  type="url"
                />
              </div>
              <SubmitButton pendingLabel="Saving settings...">Save settings</SubmitButton>
            </form>
          </FormSection>
        </>
      )}
    </div>
  );
}
