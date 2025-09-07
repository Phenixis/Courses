import { getStripeProductById } from "@/lib/payments/stripe";
import { getChaptersByProductId } from "@/lib/db/queries/chapter";
import { checkoutAction } from "@/lib/payments/actions";
import { AspectRatio } from "../ui/aspect-ratio";
import { Chapter } from "@/lib/db/schema/chapter";

export async function Product({ stripeProductId }: { stripeProductId: string }) {
    const product = await getStripeProductById(stripeProductId);

    if (!product) {
        return <div>Product not found</div>;
    }

    const chapters = await getChaptersByProductId(stripeProductId);

    return 
}

export async function ProductDisplay({
    product
}, {
    product: {
        stripeProduct: Stripe.Product,
        chapters: Chapter[],
        bonuses: string[]
    }
}) {
    return (
        <article className="shadow border rounded mb-4 p-4 flex items-stretch min-h-[200px]">
            <figure className="w-1/5 mr-2 flex-shrink-0">
                <AspectRatio ratio={21/29.7} className="w-full h-full">
                    <img src={product?.images[0] || "/path/to/image.jpg"} alt="Product Image" className="w-full h-full border-2 rounded bg-slate-200" />
                </AspectRatio>
                <figcaption className="sr-only text-center mt-2">{product?.name}</figcaption>
            </figure>
            <div className="flex flex-col justify-between w-full p-4 flex-grow">
                <header>
                    <h2 className="text-3xl font-semibold">{product?.name.toUpperCase()}</h2>
                    <h3 className="text-xl font-light">{product?.description}</h3>
                </header>
                <section className="py-4 flex-grow flex justify-between">
                    <article>
                        <h4 className="font-semibold mb-2">What you'll learn</h4>
                        <ul>
                            {product.chapters.map(chapter => (
                                <li key={chapter.id} className="mb-1">• {chapter.title}</li>
                            ))}
                        </ul>
                    </article>
                    <article>
                        <h4 className="font-semibold mb-2">Free Bonuses</h4>
                        <ul>
                            <li>Advanced boilerplate to launch your project in days - value <span className="font-bold">249€</span></li>
                        </ul>
                    </article>
                </section>
                <footer className="flex justify-end">
                    {product?.default_price && typeof product.default_price === "object" && "unit_amount" in product.default_price && typeof product.default_price.unit_amount === "number" ? (
                        <form action={checkoutAction}>
                            <input type="hidden" name="priceId" value={product.default_price.id} />
                            <button className="w-32 bg-blue-500 text-white px-4 py-2 rounded-full font-bold">
                                {(product.default_price.unit_amount / 100) + "€"}
                            </button>
                        </form>
                    ) : "Free"}
                </footer>
            </div>
        </article >
    )
}