import type { Metadata } from "next";
import RegisterClient from "./register-client";

export const metadata: Metadata = {
  title: "Регистрация — Moranti",
  robots: { index: false, follow: true },
};

export default function RegisterPage() {
  return <RegisterClient />;
}
