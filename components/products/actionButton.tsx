import { PersonalizedPrice } from "@/lib/db/schema";
import { checkoutAction } from "@/lib/payments/actions";
import { SubmitButton } from "./submitButton";
import Link from "next/link";

function formatPrice(
    amount: number,
    currency: string
): string {
    if (currency.toLowerCase() === 'eur') {
        return `${(amount / 100).toFixed(2)}€`;
    } else if (currency.toLowerCase() === 'usd') {
        return `$${(amount / 100).toFixed(2)}`;
    } else {
        return `${(amount / 100).toFixed(2)} ${currency.toUpperCase()}`;
    }
}

export function ActionButton({
    product_id,
    price,
    isChosenCurrency,
    hasAccess,
    skeleton = false
}: {
    product_id?: string,
    price?: PersonalizedPrice,
    isChosenCurrency?: boolean,
    hasAccess?: boolean,
    skeleton: boolean
}) {
    return skeleton === true ? (
        <SubmitButton title="Loading..." skeleton />
    ) : price === undefined || price.unit_amount === null || hasAccess ? (
        <Link href={`/courses/${product_id}`} className="w-fit">
            <SubmitButton title="Access the course" />
        </Link>
    ) : price.unit_amount ? (
        <form className="flex flex-col justify-end items-end" action={checkoutAction}>
            <input type="hidden" name="priceId" value={price?.id} />
            <SubmitButton title={price ? formatPrice(price.unit_amount, price.currency) + (isChosenCurrency ? "" : "*") : "Get Started"} />
            {!isChosenCurrency && (
                <p className="text-xs italic mb-1 text-gray-500 text-wrap w-2/3">* Will be charged in {price.currency.toUpperCase()}, no price found in selected currency.</p>
            )}
        </form>
    ) : (
        <SubmitButton title="Free" />
    )
}