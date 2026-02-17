"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiPath } from "@/lib/api";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    fetch(apiPath("api/auth"), { method: "DELETE" })
      .then(() => router.replace("/login"))
      .catch(() => router.replace("/login"));
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#fafaf9" }}>
      <p className="text-stone-500 text-sm">Çıkış yapılıyor...</p>
    </div>
  );
}
