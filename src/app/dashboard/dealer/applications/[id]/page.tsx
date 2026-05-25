import Link from "next/link";
import { convertApplicationToRental, updateApplicationStatus } from "@/app/dashboard/dealer/actions";
import { MessageBanner } from "@/components/app/message-banner";
import { StatusBadge } from "@/components/app/status-badge";
import { TextareaField, TextField } from "@/components/forms/form-field";
import { SubmitButton } from "@/components/forms/submit-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth/guards";
import { formatDate, vehicleTitle } from "@/lib/bird-dog/format";
import type { ApplicationWithRelations } from "@/lib/bird-dog/types";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createSignedStorageUrl } from "@/lib/supabase/storage";

export const metadata = { title: "Application detail" };
export default async function DealerApplicationDetail({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string; message?: string }> }) {
  const { id } = await params;
  const query = await searchParams;
  await requireRole(["dealer", "admin"]);
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.from("rental_applications").select("*, vehicles (id, vin, year, make, model, trim, monthly_price, deposit, city, state), dealerships (id, name, phone), profiles (id, email, full_name, phone), application_documents (id, application_id, document_type, file_url, created_at)").eq("id", id).maybeSingle();

  if (error || !data) return <Card><CardContent className="space-y-4 p-6"><p className="text-muted-foreground">{error?.message ?? "Application not found or access denied."}</p><Button asChild><Link href="/dashboard/dealer/applications">Back to applications</Link></Button></CardContent></Card>;

  const app = data as ApplicationWithRelations;
  const docs = await Promise.all(app.application_documents.map(async (doc) => ({ ...doc, signed_url: await createSignedStorageUrl(supabase, "application-documents", doc.file_url) })));
  const today = new Date().toISOString().slice(0, 10);
  const customerName = app.profiles?.full_name ?? getApplicationField(app.customer_notes, "Full name") ?? "Not provided";
  const customerEmail = getApplicationField(app.customer_notes, "Email") ?? app.profiles?.email ?? "Not provided";
  const customerPhone = getApplicationField(app.customer_notes, "Phone") ?? app.profiles?.phone ?? "Not provided";

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.32em] text-primary">Application review</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em]">{app.vehicles ? vehicleTitle(app.vehicles) : "Vehicle unavailable"}</h1>
        <div className="mt-3"><StatusBadge value={app.status} /></div>
      </div>
      <MessageBanner error={query.error} message={query.message} />
      <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <Card className="border-white/15">
          <CardHeader><CardTitle>Customer application</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <Info label="Customer" value={customerName} />
              <Info label="Email" value={customerEmail} />
              <Info label="Phone" value={customerPhone} />
              <Info label="Submitted" value={formatDate(app.created_at)} />
              <Info label="Vehicle ID" value={app.vehicle_id} />
              <Info label="Dealership" value={app.dealerships?.name ?? "Not provided"} />
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-xs text-muted-foreground">Application details</p>
              <pre className="mt-2 whitespace-pre-wrap font-sans text-sm leading-6 text-foreground">{app.customer_notes ?? "No application details provided."}</pre>
            </div>
            <div className="grid gap-3">
              <p className="text-sm font-medium">Optional documents</p>
              {docs.length === 0 ? (
                <p className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-muted-foreground">No license or insurance images are attached.</p>
              ) : docs.map((doc) => (
                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] p-4" key={doc.id}>
                  <span className="capitalize">{doc.document_type}</span>
                  {doc.signed_url ? <Button asChild size="sm" variant="outline"><a href={doc.signed_url} rel="noreferrer" target="_blank">Open</a></Button> : <span className="text-sm text-muted-foreground">Unavailable</span>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <div className="space-y-6">
          <Card className="border-white/15">
            <CardHeader><CardTitle>Decision</CardTitle></CardHeader>
            <CardContent>
              <form action={updateApplicationStatus} className="space-y-5">
                <input name="application_id" type="hidden" value={app.id} />
                <TextareaField defaultValue={app.dealer_notes ?? ""} label="Dealer notes" name="dealer_notes" rows={4} />
                <div className="grid gap-3 sm:grid-cols-2">
                  <DecisionButton label="Mark pending" status="submitted" />
                  <DecisionButton label="Under review" status="under_review" />
                  <DecisionButton label="Approve" status="approved" />
                  <DecisionButton label="Deny" status="denied" />
                </div>
              </form>
            </CardContent>
          </Card>
          <Card className="border-white/15">
            <CardHeader><CardTitle>Convert to active rental</CardTitle></CardHeader>
            <CardContent>
              <form action={convertApplicationToRental} className="space-y-5">
                <input name="application_id" type="hidden" value={app.id} />
                <TextField defaultValue={today} label="Start date" name="start_date" required type="date" />
                <TextField label="End date" name="end_date" type="date" />
                <TextField defaultValue={app.vehicles?.monthly_price ?? ""} label="Monthly rate" name="monthly_rate" required step="0.01" type="number" />
                <TextField defaultValue={app.vehicles?.deposit ?? ""} label="Deposit" name="deposit" step="0.01" type="number" />
                <SubmitButton className="w-full" pendingLabel="Creating rental...">Create active rental</SubmitButton>
              </form>
              <p className="mt-3 text-xs leading-5 text-muted-foreground">This creates a rental, marks the application approved, and marks the vehicle rented.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
function Info({ label, value }: { label: string; value: string }) { return <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 font-medium">{value}</p></div>; }
function DecisionButton({ label, status }: { label: string; status: string }) { return <SubmitButton name="status" pendingLabel="Saving..." value={status} variant="outline">{label}</SubmitButton>; }

function getApplicationField(notes: string | null, label: string) {
  return notes
    ?.split("\n")
    .find((line) => line.startsWith(`${label}: `))
    ?.slice(label.length + 2)
    .trim() || null;
}
