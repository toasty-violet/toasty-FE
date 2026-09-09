import { AccountCard } from "@/components/cards/AccountCard";
import { SupportCard } from "@/components/cards/SupportCard";

import { SalesSummaryCard } from "./_components/SalesSummaryCard";
import { ShippingFeeCard } from "./_components/ShippingFeeCard";
import { StoreProfileCard } from "./_components/StoreProfileCard";

export default function ShopPage() {
  return (
    <div className="bg-bg-neutral-weak flex flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-28 overflow-y-auto px-20 pt-20 pb-56">
        <StoreProfileCard />
        <SalesSummaryCard />
        <ShippingFeeCard />
        <AccountCard />
        <SupportCard />
      </div>
    </div>
  );
}
