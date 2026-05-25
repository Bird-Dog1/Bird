import Link from "next/link";

import { signIn, signUp } from "@/app/actions/auth";
import { TextField, SelectField } from "@/components/forms/form-field";
import { SubmitButton } from "@/components/forms/submit-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type AuthFormProps = {
  mode: "login" | "signup";
  error?: string;
  message?: string;
  next?: string;
};

export function AuthForm({ mode, error, message, next }: AuthFormProps) {
  const isSignup = mode === "signup";

  return (
    <Card className="mx-auto w-full max-w-md border-white/15 bg-card/90">
      <CardHeader className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-muted-foreground">
          Bird Dog access
        </p>
        <CardTitle className="text-3xl">{isSignup ? "Create your account" : "Welcome back"}</CardTitle>
        <CardDescription>
          {isSignup
            ? "Start as a customer or dealer using Supabase Auth."
            : "Sign in to continue to your Bird Dog dashboard."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="mb-4 rounded-2xl border border-destructive/35 bg-destructive/10 p-4 text-sm leading-6 text-destructive-foreground">
            {error}
          </div>
        ) : null}
        {message ? (
          <div className="mb-4 rounded-2xl border border-accent/25 bg-white/[0.05] p-4 text-sm leading-6 text-accent">
            {message}
          </div>
        ) : null}
        <form action={isSignup ? signUp : signIn} className="space-y-5">
          {isSignup ? (
            <>
              <TextField
                autoComplete="name"
                label="Full name"
                name="full_name"
                required
              />
              <SelectField label="Account type" name="role" required>
                <option value="customer">Customer</option>
                <option value="dealer">Dealer</option>
              </SelectField>
            </>
          ) : null}
          <TextField
            autoComplete="email"
            label="Email"
            name="email"
            required
            type="email"
          />
          <TextField
            autoComplete={isSignup ? "new-password" : "current-password"}
            label="Password"
            minLength={8}
            name="password"
            required
            type="password"
          />
          {!isSignup ? <input name="next" type="hidden" value={next ?? "/dashboard"} /> : null}
          <SubmitButton className="w-full" pendingLabel={isSignup ? "Creating..." : "Signing in..."}>
            {isSignup ? "Create account" : "Sign in"}
          </SubmitButton>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          {isSignup ? "Already have an account?" : "Need an account?"}{" "}
          <Link className="font-medium text-primary hover:text-white hover:underline" href={isSignup ? "/login" : "/signup"}>
            {isSignup ? "Sign in" : "Create one"}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
