import { PersonalizedPrice } from "@/lib/db/schema";
import { checkoutAction } from "@/lib/payments/actions";
import { SubmitButton } from "./submitButton";
import Link from "next/link";
import { formatToSnakeCase } from "@/lib/utils";

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

type ActionButtonProps = {
    skeleton: boolean
    product?: {
        name: string
        isChosenCurrency: boolean
        hasAccess: boolean
        price?: PersonalizedPrice
    }
}

export function ActionButton({
    skeleton = false,
    product
}: ActionButtonProps) {
    return skeleton === true ? (
        <SubmitButton title="Loading..." skeleton />
    ) : product ? (
        product.price === undefined || product.price.unit_amount === null || product.hasAccess ? (
            <Link href={`/courses/${formatToSnakeCase(product.name)}`} className="w-fit">
                <SubmitButton title="Access the course" />
            </Link>
        ) : product.price.unit_amount ? (
            <form className="flex flex-col justify-end items-end" action={checkoutAction}>
                <input type="hidden" name="priceId" value={product.price.id} />
                <SubmitButton title={product.price ? formatPrice(product.price.unit_amount, product.price.currency) + (product.isChosenCurrency ? "" : "*") : "Get Started"} />
                {!product.isChosenCurrency && (
                    <p className="text-xs italic mb-1 text-gray-500 text-wrap w-2/3">* Will be charged in {product.price.currency.toUpperCase()}, no price found in selected currency.</p>
                )}
            </form>
        ) : (
            <SubmitButton title="Free" />
        )
    ) : (
        <div>
            Erreur : produit non disponible.
        </div>
    )
}