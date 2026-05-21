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
          ? "rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive-foreground"
          : "rounded-xl border border-accent/40 bg-accent/10 p-3 text-sm text-accent"
      }
    >
      {error ?? message}
    </div>
  );
}
