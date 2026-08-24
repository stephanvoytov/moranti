import type { Metadata } from "next";
import AccountClient from "./account-client";

export const metadata: Metadata = {
  title: "Личный кабинет — Moranti",
  robots: { index: false, follow: true },
};

export default function AccountPage() {
  return <AccountClient />;
}
