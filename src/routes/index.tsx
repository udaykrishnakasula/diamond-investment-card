import { createFileRoute } from "@tanstack/react-router";
import { DiamondInvestmentCard } from "@/components/DiamondInvestmentCard";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div
      className="flex min-h-screen items-center justify-center p-6"
      style={{
        background:
          "radial-gradient(80% 60% at 50% 20%, #0a1a2e 0%, #05070d 60%, #020306 100%)",
      }}
    >
      <DiamondInvestmentCard />
    </div>
  );
}
