import {
  approveDealerApplication,
  convertDealerApplicationToRental,
  denyDealerApplication,
} from "@/app/dashboard/actions";
import {
  DealerPageHeader,
  EmptyState,
  Money,
  StatusBadge,
  StatusMessage,
} from "@/components/dealer/dealer-shell";
import { TextareaField, TextField } from "@/components/forms/form-field";
import { SubmitButton } from "@/components/forms/submit-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  createApplicationDocumentSignedUrls,
  requireDealerApplication,
  todayIsoDate,
} from "@/lib/dealer/dashboard";

type ApplicationDetailPageProps = {
  params: Promise<{
    applicationId: string;
  }>;
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
};

export const metadata = {
  title: "Application detail",
};

export default async function DealerApplicationDetailPage({
  params,
  searchParams,
}: ApplicationDetailPageProps) {
  const [{ applicationId }, query] = await Promise.all([params, searchParams]);
  const { supabase, application } = await requireDealerApplication(applicationId);
  const documents = await createApplicationDocumentSignedUrls(
    supabase,
    application.application_documents,
  );
  const vehicle = application.vehicles;
  const customer = application.profiles;

  return (
    <div className="space-y-6">
      <DealerPageHeader
        description="Review customer documents, approve or deny the application, and convert approved applications into rentals."
        title="Application detail"
      />
      <StatusMessage error={query.error} message={query.message} />
      <div className="grid gap-6 xl:grid-cols-[1fr_22rem]">
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div>
                <CardTitle>Application</CardTitle>
                <p className="mt-2 text-sm text-muted-foreground">
                  Submitted {new Date(application.created_at).toLocaleString()}
                </p>
              </div>
              <StatusBadge status={application.status} />
            </CardHeader>
            <CardContent className="grid gap-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-border bg-background/30 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Customer
                  </p>
                  <p className="mt-2 font-semibold">
                    {customer?.full_name ?? customer?.email ?? application.customer_id}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {customer?.email ?? "Email unavailable"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {customer?.phone ?? "Phone unavailable"}
                  </p>
                </div>
                <div className="rounded-2xl border border-border bg-background/30 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Vehicle
                  </p>
                  {vehicle ? (
                    <>
                      <p className="mt-2 font-semibold">
                        {vehicle.year} {vehicle.make} {vehicle.model}
                        {vehicle.trim ? ` ${vehicle.trim}` : ""}
                      </p>
                      <p className="text-sm text-muted-foreground">VIN {vehicle.vin}</p>
                      <p className="text-sm text-muted-foreground">
                        <Money value={vehicle.monthly_price} /> / month ·{" "}
                        <Money value={vehicle.deposit} /> deposit
                      </p>
                    </>
                  ) : (
                    <p className="mt-2 text-sm text-muted-foreground">
                      Vehicle details unavailable.
                    </p>
                  )}
                </div>
              </div>
              <div className="rounded-2xl border border-border bg-background/30 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Customer notes
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {application.customer_notes ?? "No customer notes provided."}
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-background/30 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Dealer notes
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {application.dealer_notes ?? "No dealer notes yet."}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Customer uploads</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              {documents.length === 0 ? (
                <EmptyState
                  description="License and insurance uploads attached by the customer will appear here."
                  title="No documents uploaded"
                />
              ) : (
                documents.map((document) => (
                  <div
                    className="flex flex-col gap-3 rounded-2xl border border-border bg-background/30 p-4 sm:flex-row sm:items-center sm:justify-between"
                    key={document.id}
                  >
                    <div>
                      <p className="font-semibold capitalize">
                        {document.document_type} upload
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Uploaded {new Date(document.created_at).toLocaleString()}
                      </p>
                    </div>
                    {document.signedUrl ? (
                      <Button asChild variant="outline">
                        <a href={document.signedUrl} rel="noreferrer" target="_blank">
                          View upload
                        </a>
                      </Button>
                    ) : (
                      <p className="text-sm text-muted-foreground">Preview unavailable</p>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Decision</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <form action={approveDealerApplication} className="grid gap-3">
                <input name="application_id" type="hidden" value={application.id} />
                <TextareaField
                  defaultValue={application.dealer_notes ?? ""}
                  label="Approval notes"
                  name="dealer_notes"
                />
                <SubmitButton pendingLabel="Approving...">Approve application</SubmitButton>
              </form>
              <form action={denyDealerApplication} className="grid gap-3">
                <input name="application_id" type="hidden" value={application.id} />
                <TextareaField
                  defaultValue={application.dealer_notes ?? ""}
                  label="Denial notes"
                  name="dealer_notes"
                />
                <SubmitButton pendingLabel="Denying..." variant="outline">
                  Deny application
                </SubmitButton>
              </form>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Convert to rental</CardTitle>
            </CardHeader>
            <CardContent>
              {application.status !== "approved" ? (
                <p className="text-sm text-muted-foreground">
                  Approve this application before creating an active rental.
                </p>
              ) : (
                <form action={convertDealerApplicationToRental} className="grid gap-4">
                  <input name="application_id" type="hidden" value={application.id} />
                  <TextField
                    defaultValue={todayIsoDate()}
                    label="Rental start date"
                    name="start_date"
                    required
                    type="date"
                  />
                  <SubmitButton pendingLabel="Creating rental...">
                    Create active rental
                  </SubmitButton>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
