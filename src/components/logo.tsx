"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

export function Logo({
  size = 32,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <Image
      src="/logo.png"
      alt="Cheverly Police Department"
      width={size}
      height={size}
      priority
      className={cn("select-none", className)}
      draggable={false}
    />
  );
}
