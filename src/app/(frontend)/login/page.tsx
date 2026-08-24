import type { Metadata } from "next";
import LoginClient from "./login-client";

export const metadata: Metadata = {
  title: "Вход — Moranti",
  robots: { index: false, follow: true },
};

export default function LoginPage() {
  return <LoginClient />;
}
