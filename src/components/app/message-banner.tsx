type MessageBannerProps = {
  error?: string;
  message?: string;
};

export function MessageBanner({ error, message }: MessageBannerProps) {
  if (!error && !message) {
    return null;
  }

  return (
    <div
      className={
        error
          ? "rounded-2xl border border-destructive/35 bg-destructive/10 p-4 text-sm leading-6 text-destructive-foreground shadow-lg shadow-black/20"
          : "rounded-2xl border border-accent/25 bg-white/[0.05] p-4 text-sm leading-6 text-accent shadow-lg shadow-black/20"
      }
    >
      {error ?? message}
    </div>
  );
}
