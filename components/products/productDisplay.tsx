"use client"

import { type PersonalizedPrice } from "@/lib/db/schema";
import { AspectRatio } from "../ui/aspect-ratio";
import { Chapter } from "@/lib/db/schema/chapter";
import { Skeleton } from "../ui/skeleton";
import { useSearchParams } from "next/navigation";
import type { BasicProduct } from "@/lib/payments/stripe";
import { ActionButton } from "./actionButton";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import Link from "next/link";
import { formatToSnakeCase } from "@/lib/utils";

export function ProductDisplay({
    product,
    hasAccess,
    isAdmin
}: {
    product?: {
        stripeProduct: BasicProduct,
        prices: PersonalizedPrice[],
        chapters: Chapter[],
        bonuses: { title: string, value: number }[]
    },
    hasAccess?: boolean,
    isAdmin?: boolean
}) {
    const searchParams = useSearchParams();
    const currency = searchParams.get("currency") || "eur";

    const priceInPrices = product ? product.prices.find(price => price.currency.toLowerCase() === currency.toLowerCase()) : null;
    const priceToUse = priceInPrices || (product ? product.prices.find(price => price.id === product.stripeProduct.defaultPriceId) : null);
    const isChosenCurrency = priceToUse === priceInPrices;

    return (
        <article className="shadow border rounded mb-4 p-4 flex items-stretch min-h-[200px] ">
            <figure className="w-1/5 mr-2">
                <AspectRatio ratio={21 / 29.7} className="w-full h-full">
                    {
                        product ? (
                            <img src={product.stripeProduct.imageUrl || "/path/to/image.jpg"} alt="Product Image" className="w-full h-full border-2 rounded bg-slate-200 dark:bg-slate-700" />
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
                        {
                            product !== undefined ? (
                                <h2 className="text-3xl font-light">
                                    {product.stripeProduct.name}
                                </h2>
                            ) : (
                                <Skeleton className="h-8 w-2/3 mb-2" />
                            )
                        }
                        {
                            hasAccess && (
                                <Badge>Bought</Badge>
                            )
                        }
                        {
                            isAdmin && product?.stripeProduct.name && (
                                <Link href={`/courses/${formatToSnakeCase(product?.stripeProduct.name)}/edit`}>
                                    <Button variant="outline" className="flex-end">
                                        Edit
                                    </Button>
                                </Link>
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
                                Array.from({ length: 5 }).map((_, index) => (
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
                                    Array.from({ length: 5 }).map((_, index) => (
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
                                skeleton={false}
                                product={{
                                    name: product.stripeProduct.name,
                                    price: priceToUse || undefined,
                                    isChosenCurrency: isChosenCurrency,
                                    hasAccess: hasAccess!
                                }}
                            />
                        )
                    }
                </footer>
            </div>
        </article >
    )
}