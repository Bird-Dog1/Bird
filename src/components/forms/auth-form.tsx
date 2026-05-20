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
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle>{isSignup ? "Create your account" : "Welcome back"}</CardTitle>
        <CardDescription>
          {isSignup
            ? "Start as a customer or dealer using Supabase Auth."
            : "Sign in to continue to your Bird Dog dashboard."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="mb-4 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive-foreground">
            {error}
          </div>
        ) : null}
        {message ? (
          <div className="mb-4 rounded-xl border border-accent/40 bg-accent/10 p-3 text-sm text-accent">
            {message}
          </div>
        ) : null}
        <form action={isSignup ? signUp : signIn} className="space-y-4">
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
          <input name="next" type="hidden" value={next ?? "/dashboard"} />
          <SubmitButton
            className="w-full"
            pendingLabel={isSignup ? "Creating..." : "Signing in..."}
          >
            {isSignup ? "Create account" : "Sign in"}
          </SubmitButton>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          {isSignup ? "Already have an account?" : "Need an account?"}{" "}
          <Link
            className="font-medium text-primary hover:underline"
            href={isSignup ? "/login" : "/signup"}
          >
            {isSignup ? "Sign in" : "Create one"}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
