import { Product } from '@/components/products/product';
import { ProductDisplay } from '@/components/products/productDisplay';
import { Suspense } from 'react';
import { CurrencySelect } from '@/components/products/currencySelect';
import { getStripeProducts } from '@/lib/payments/stripe';

export default async function ProductsPage() {
    const products = await getStripeProducts(true);

    return (
        <main className="max-w-7xl w-full flex-grow mx-auto p-4">
            <header className="flex items-center justify-between">
                <h1 className="text-3xl font-bold mb-6">
                    Products
                </h1>
                <CurrencySelect />
            </header>
            <section>
                {
                    products.length === 0 ? (
                        <p>No products found.</p>
                    ) : (
                        products.map(product => (
                            <Suspense key={product.id} fallback={<ProductDisplay />}>
                                <Product stripeProductId={product.id} />
                            </Suspense>
                        ))
                    )
                }
            </section>
        </main>
    );
}