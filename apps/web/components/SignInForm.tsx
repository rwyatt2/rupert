"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { copy } from "@/lib/copy";
import { useAuth, useSignIn, useSignUp } from "@clerk/nextjs";
import { clerkErrorText, firstHookError } from "@/lib/auth-errors";
import { finishSession } from "@/lib/finish-session";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";

function GoogleIcon() {
  return (
    <svg className="size-4" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="currentColor"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="currentColor"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="currentColor"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg className="size-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2.2c-3.3.7-4-1.4-4-1.4-.5-1.4-1.3-1.8-1.3-1.8-1.1-.8.1-.8.1-.8 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-6 0-1.3.5-2.4 1.2-3.3-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C17.3 1.6 18.3 1.9 18.3 1.9c.6 1.6.2 2.8.1 3.1.8.9 1.2 2 1.2 3.3 0 4.6-2.8 5.6-5.5 6 .4.3.8 1 .8 2v3c0 .3.2.7.8.6A12 12 0 0 0 12 .3z" />
    </svg>
  );
}

export function SignInForm() {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const { signIn, errors: signInErrors, fetchStatus: signInStatus } = useSignIn();
  const { signUp, errors: signUpErrors, fetchStatus: signUpStatus } = useSignUp();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [flow, setFlow] = useState<"signin" | "signup">("signin");
  const [error, setError] = useState<string | null>(null);

  const busy = signInStatus === "fetching" || signUpStatus === "fetching";

  useEffect(() => {
    if (isSignedIn) router.replace("/");
  }, [isSignedIn, router]);

  const oauth = async (strategy: "oauth_google" | "oauth_github") => {
    setError(null);
    const { error: oauthError } = await signIn.sso({
      strategy,
      redirectUrl: "/",
      redirectCallbackUrl: "/sign-in/sso-callback",
    });
    if (oauthError) setError(clerkErrorText(oauthError));
  };

  const sendCode = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    const identifier = email.trim();
    if (!identifier) {
      setError(copy.auth.errorEmailRequired);
      return;
    }

    const sent = await signIn.emailCode.sendCode({ emailAddress: identifier });
    if (!sent.error) {
      setFlow("signin");
      setStep("code");
      return;
    }

    if (sent.error.code === "form_identifier_not_found") {
      const created = await signUp.create({ emailAddress: identifier });
      if (created.error) {
        setError(clerkErrorText(created.error) ?? firstHookError(signUpErrors));
        return;
      }
      const signupSent = await signUp.verifications.sendEmailCode();
      if (signupSent.error) {
        setError(clerkErrorText(signupSent.error) ?? firstHookError(signUpErrors));
        return;
      }
      setFlow("signup");
      setStep("code");
      return;
    }

    setError(clerkErrorText(sent.error) ?? firstHookError(signInErrors));
  };

  const verifyCode = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    const trimmed = code.trim();
    if (!trimmed) {
      setError(copy.auth.errorCodeRequired);
      return;
    }

    if (flow === "signup") {
      const verified = await signUp.verifications.verifyEmailCode({ code: trimmed });
      if (verified.error) {
        setError(clerkErrorText(verified.error) ?? firstHookError(signUpErrors));
        return;
      }
      const finishError = await finishSession((params) => signUp.finalize(params), router);
      if (finishError) setError(finishError);
      return;
    }

    const verified = await signIn.emailCode.verifyCode({ code: trimmed });
    if (verified.error) {
      setError(clerkErrorText(verified.error) ?? firstHookError(signInErrors));
      return;
    }
    const finishError = await finishSession((params) => signIn.finalize(params), router);
    if (finishError) setError(finishError);
  };

  const resend = async () => {
    setError(null);
    if (flow === "signup") {
      const result = await signUp.verifications.sendEmailCode();
      if (result.error) setError(clerkErrorText(result.error));
      return;
    }
    const result = await signIn.emailCode.sendCode();
    if (result.error) setError(clerkErrorText(result.error));
  };

  return (
    <div className="w-full max-w-sm space-y-6 px-4 sm:px-0" data-testid="sign-in-form">
      <div className="space-y-2 text-center">
        <Link
          href="/"
          className="caption-mono inline-block text-muted-foreground hover-interact hover:text-foreground"
        >
          {copy.brand.name}
        </Link>
        <h1 className="h2 tracking-tight">{copy.auth.title}</h1>
        <p className="description text-muted-foreground">{copy.auth.subtitle}</p>
      </div>

      {step === "email" ? (
        <>
          <div className="space-y-2">
            <Button
              type="button"
              variant="secondary"
              size="lg"
              className="normal-case tracking-normal font-medium"
              disabled={busy}
              onClick={() => void oauth("oauth_google")}
            >
              <GoogleIcon />
              {copy.auth.google}
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="lg"
              className="normal-case tracking-normal font-medium"
              disabled={busy}
              onClick={() => void oauth("oauth_github")}
            >
              <GitHubIcon />
              {copy.auth.github}
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <span className="h-px flex-1 bg-border" />
            <span className="caption-mono text-muted-foreground">{copy.auth.emailDivider}</span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={(event) => void sendCode(event)} className="space-y-4">
            <label className="block space-y-2">
              <span className="h5 text-foreground">{copy.auth.emailLabel}</span>
              <Input
                type="email"
                autoComplete="email"
                placeholder={copy.auth.emailPlaceholder}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>
            <Button type="submit" size="lg" className="normal-case tracking-normal font-semibold" disabled={busy}>
              {copy.auth.sendCode}
            </Button>
          </form>
        </>
      ) : (
        <form onSubmit={(event) => void verifyCode(event)} className="space-y-4">
          <p className="description text-muted-foreground">{copy.auth.codeSent(email)}</p>
          <label className="block space-y-2">
            <span className="h5 text-foreground">{copy.auth.codeLabel}</span>
            <Input
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder={copy.auth.codePlaceholder}
              value={code}
              onChange={(event) => setCode(event.target.value)}
            />
          </label>
          <Button type="submit" size="lg" className="normal-case tracking-normal font-semibold" disabled={busy}>
            {copy.auth.continue}
          </Button>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              className="h6 text-muted-foreground hover-interact hover:text-foreground"
              onClick={() => {
                setStep("email");
                setCode("");
                setError(null);
                void signIn.reset();
              }}
            >
              {copy.auth.differentEmail}
            </button>
            <button
              type="button"
              className="h6 text-muted-foreground hover-interact hover:text-foreground disabled:opacity-50"
              disabled={busy}
              onClick={() => void resend()}
            >
              {copy.auth.resendCode}
            </button>
          </div>
        </form>
      )}

      {error && <p className="text-center description text-destructive">{error}</p>}

      <p className="text-center h6 text-muted-foreground">
        {copy.auth.termsPrefix}{" "}
        <Link href="/terms" className="underline decoration-border underline-offset-2 hover-interact hover:text-foreground">
          {copy.auth.termsLink}
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="underline decoration-border underline-offset-2 hover-interact hover:text-foreground">
          {copy.auth.privacyLink}
        </Link>
        .
      </p>

      <div id="clerk-captcha" />
    </div>
  );
}
