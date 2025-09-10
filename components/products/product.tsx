import { getStripeProductById, getStripePricesOfProduct } from "@/lib/payments/stripe";
import { getChaptersByProductId } from "@/lib/db/queries/chapter";
import { ProductDisplay } from "./productDisplay";
import { hasAccess } from "@/lib/db/queries/access";
import { getUser } from "@/lib/db/queries";

export async function Product({ stripeProductId }: { stripeProductId: string }) {
    const user = await getUser();

    const product = await getStripeProductById(stripeProductId);

    if (!product) {
        return <div>Product not found</div>;
    }

    const prices = await getStripePricesOfProduct(stripeProductId, true);

    const chapters = await getChaptersByProductId(stripeProductId);

    const access = user !== null && (await hasAccess(user.id, product.id));

    return <ProductDisplay product={{
        stripeProduct: product, prices, chapters, bonuses: [{
            title: "Advanced boilerplate to launch your project in days",
            value: 249
        }]
    }} hasAccess={access} isAdmin={user !== null && user.role === "admin"} />;
}