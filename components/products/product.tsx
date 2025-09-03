import { getStripeProducts } from "@/lib/payments/stripe";

export interface ProductProps {
    id: string;
    title: string;
    subtitle: string;
    description: string;
    stripe_product_id: string;
}

export default async function Product({ product }: { product: ProductProps }) {
    const { id, title, subtitle, description, stripe_product_id } = product;

    const products = await getStripeProducts();

    return (
        <article className="shadow border rounded mb-4 p-4 flex items-stretch min-h-[200px]">
            <figure className="w-1/5 mr-2 flex-shrink-0">
                <img src={products.find(p => p.id === stripe_product_id)?.imageUrl || "/path/to/image.jpg"} alt="Product Image" className="w-full border-2 rounded" />
                <figcaption className="text-center mt-2">{title}</figcaption>
            </figure>
            <div className="flex flex-col justify-between w-full p-4 flex-grow">
                <header>
                    <h2 className="text-xl font-semibold">{title}</h2>
                    <h3 className="text-lg font-medium">{subtitle}</h3>
                </header>
                <p className="text-gray-600">{description}</p>
                <button className="w-32 bg-blue-500 text-white px-4 py-2 rounded">Add to Cart</button>
            </div>
        </article>
    )
}