"use client";

import { StorefrontError } from "@/components/public/storefront-states";

export default function PublicError({ reset }: { reset: () => void }) {
  return <StorefrontError reset={reset} />;
}
