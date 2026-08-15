import { createFileRoute } from "@tanstack/react-router";
import { InvestmentCard } from "@/components/DiamondInvestmentCard";
import type { CardVariant } from "@/components/investment-card-themes";

const VARIANTS: CardVariant[] = ["silver", "gold", "diamond", "platinum"];

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Investment Card Collection — Silver, Gold, Diamond, Platinum" },
      {
        name: "description",
        content:
          "Explore a premium 3D investment card collection in four materials: silver, gold, diamond and platinum. Drag any card to rotate it in real 3D.",
      },
      {
        property: "og:title",
        content: "Investment Card Collection — Silver, Gold, Diamond, Platinum",
      },
      {
        property: "og:description",
        content:
          "A premium 3D investment card collection in four luxury materials, with drag-to-rotate interaction.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function Index() {
  return (
    <div
      className="min-h-screen w-full overflow-x-hidden px-6 py-16"
      style={{
        background:
          "radial-gradient(80% 60% at 50% 20%, #0a1a2e 0%, #05070d 60%, #020306 100%)",
      }}
    >
      <h1 className="mx-auto mb-14 max-w-3xl text-center text-2xl font-semibold tracking-[0.28em] text-slate-200 uppercase">
        Investment Card Collection
      </h1>
      <div className="mx-auto grid w-full max-w-[1800px] justify-items-center gap-16 sm:gap-20 md:grid-cols-2 xl:grid-cols-4">
        {VARIANTS.map((variant) => (
          <InvestmentCard key={variant} variant={variant} />
        ))}
      </div>
    </div>
  );
}
