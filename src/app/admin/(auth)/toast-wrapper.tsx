"use client";

import { ToastProvider } from "@/lib/toast-context";

export default function AdminToastWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ToastProvider>{children}</ToastProvider>;
}
