import { getStripeProductById, getStripePricesOfProduct } from "@/lib/payments/stripe";
import { getChaptersByProductId } from "@/lib/db/queries/chapter";
import { ProductDisplay } from "./productDisplay";

export async function Product({ stripeProductId }: { stripeProductId: string }) {
    const product = await getStripeProductById(stripeProductId);

    if (!product) {
        return <div>Product not found</div>;
    }

    const prices = await getStripePricesOfProduct(stripeProductId, true);

    const chapters = await getChaptersByProductId(stripeProductId);

    return <ProductDisplay product={{
        stripeProduct: product, prices, chapters, bonuses: [{
            title: "Advanced boilerplate to launch your project in days",
            value: 249
        }]
    }} />;
}