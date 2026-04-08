import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";

export default function LoginRedirectPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  // Redirect to /sign-in, preserving any callback URL
  const callbackUrl = searchParams.callbackUrl;
  if (callbackUrl && typeof callbackUrl === "string") {
    redirect(`/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }
  redirect("/sign-in");
}
