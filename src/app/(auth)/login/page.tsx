import { AuthForm } from "@/components/forms/auth-form";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
    message?: string;
    next?: string;
  }>;
};

export const metadata = {
  title: "Sign in",
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  return (
    <main className="mx-auto flex min-h-[calc(100vh-12rem)] max-w-7xl items-center px-4 py-16 sm:px-6 lg:px-8">
      <AuthForm
        error={params.error}
        message={params.message}
        mode="login"
        next={params.next}
      />
    </main>
  );
}
