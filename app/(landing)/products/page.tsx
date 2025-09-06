import Product from '@/components/products/product';

export default function ProductsPage() {
    return (
        <main className="max-w-7xl w-full mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6">
                Products
            </h1>
            <section className="">
                <Product stripeProductId="prod_Sz70bFdPcvk1BE" />
            </section>
        </main>
    );
}