"use client"

import { type PersonalizedPrice } from "@/lib/db/schema";
import { checkoutAction } from "@/lib/payments/actions";
import { AspectRatio } from "../ui/aspect-ratio";
import { Chapter } from "@/lib/db/schema/chapter";
import { Skeleton } from "../ui/skeleton";
import { useSearchParams } from "next/navigation";
import type { BasicProduct } from "@/lib/payments/stripe";
import { SubmitButton } from "./submitButton";
import { ActionButton } from "./productButton";
import { Badge } from "../ui/badge";

function SubmitButtonOld({
    title,
    skeleton = false
}: {
    title: string,
    skeleton?: boolean
}) {
    return !skeleton ?
        (
            <button className="w-32 bg-blue-500 text-white px-4 py-2 rounded-full font-bold">
                {title}
            </button>
        ) : (
            <Skeleton className="h-10 w-32 rounded-full" />
        );
}

export function ProductDisplay({
    product,
    hasAccess
}: {
    product?: {
        stripeProduct: BasicProduct,
        prices: PersonalizedPrice[],
        chapters: Chapter[],
        bonuses: { title: string, value: number }[]
    },
    hasAccess: boolean
}) {
    const searchParams = useSearchParams();
    const currency = searchParams.get("currency") || "eur";

    const priceInPrices = product ? product.prices.find(price => price.currency.toLowerCase() === currency.toLowerCase()) : null;
    const priceToUse = priceInPrices || (product ? product.prices.find(price => price.id === product.stripeProduct.defaultPriceId) : null);
    const isChosenCurrency = priceToUse === priceInPrices;

    return (
        <article className="shadow border rounded mb-4 p-4 flex items-stretch min-h-[200px]">
            <figure className="w-1/5 mr-2 flex-shrink-0">
                <AspectRatio ratio={21 / 29.7} className="w-full h-full">
                    {
                        product ? (
                            <img src={product.stripeProduct.imageUrl || "/path/to/image.jpg"} alt="Product Image" className="w-full h-full border-2 rounded bg-slate-200" />
                        ) : (
                            <Skeleton className="w-full h-full border-2 rounded" />
                        )
                    }
                </AspectRatio>
                <figcaption className="sr-only text-center mt-2">{
                    product ? (
                        product.stripeProduct.name
                    ) : (
                        "Loading..."
                    )
                }</figcaption>
            </figure>
            <div className="flex flex-col justify-between w-full p-4 flex-grow">
                <header>
                    <div className="flex items-center gap-4">
                        <h2 className="text-3xl font-light">
                            {
                                product ? (
                                    product.stripeProduct.name
                                ) : (
                                    <Skeleton className="h-8 w-2/3 mb-2" />
                                )
                            }
                        </h2>
                        {
                            hasAccess && (
                                <Badge>Bought</Badge>
                            )
                        }
                    </div>
                    <h3 className="text-xl">
                        {product ? (
                            product.stripeProduct.description
                        ) : (
                            <Skeleton className="h-6 w-1/2 mb-2" />
                        )}
                    </h3>
                </header>
                <section className="py-4 flex-grow flex justify-between gap-8">
                    <article className="w-full flex-grow">
                        <h4 className="font-semibold mb-2">What you'll learn</h4>
                        <ul>
                            {product ? (
                                product.chapters.map(chapter => (
                                    <li key={chapter.id} className="mb-1">• {chapter.title}</li>
                                ))
                            ) : (
                                Array.from({ length: 7 }).map((_, index) => (
                                    <li key={index} className="mb-1">
                                        <Skeleton className="h-4 w-full mb-2" />
                                    </li>
                                ))
                            )}
                        </ul>
                    </article>
                    <article className="w-full flex-grow">
                        <h4 className="font-semibold mb-2">Free Bonuses</h4>
                        <ul>
                            {
                                product ? (
                                    product.bonuses.map((bonus, index) => (
                                        <li key={index} className="mb-1">{bonus.title} - value <span className="font-bold">{bonus.value}€</span></li>
                                    ))
                                ) : (
                                    Array.from({ length: 7 }).map((_, index) => (
                                        <li key={index} className="mb-1">
                                            <Skeleton className="h-4 w-full mb-2" />
                                        </li>
                                    ))
                                )
                            }
                        </ul>
                    </article>
                </section>
                <footer className="flex justify-end">
                    {
                        !product ? (
                            <ActionButton
                                skeleton
                            />
                        ) : (
                            <ActionButton
                                product_id={product.stripeProduct.id}
                                price={priceToUse || undefined}
                                isChosenCurrency={isChosenCurrency}
                                hasAccess={hasAccess}
                                skeleton={false}
                            />
                        )
                    }
                </footer>
            </div>
        </article >
    )
}