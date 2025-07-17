"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppLogo } from "@/components/app-logo";
import { cn } from "@/lib/utils";

export default function Splash() {
  const router = useRouter();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => {
      router.push("/login");
    }, 2500);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <main className="flex h-screen w-full flex-col items-center justify-center bg-background">
      <div
        className={cn(
          "flex flex-col items-center gap-4 transition-opacity duration-1000",
          visible ? "opacity-100" : "opacity-0"
        )}
      >
        <AppLogo className="h-20 w-20 text-primary" />
        <h1 className="text-4xl font-bold text-primary font-headline">TestPaperGenius</h1>
        <p className="text-muted-foreground">Crafting tests, simplified.</p>
      </div>
    </main>
  );
}
