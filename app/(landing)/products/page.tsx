import { Product } from '@/components/products/product';
import { ProductDisplay } from '@/components/products/productDisplay';
import { Suspense } from 'react';
import { CurrencySelect } from '@/components/products/currencySelect';

export default async function ProductsPage() {

    return (
        <main className="max-w-7xl w-full flex-grow mx-auto p-4">
            <header className="flex items-center justify-between">
                <h1 className="text-3xl font-bold mb-6">
                    Products
                </h1>
                <CurrencySelect />
            </header>
            <section className="">
                <Suspense fallback={<ProductDisplay />}>
                    <Product stripeProductId="prod_Sz70bFdPcvk1BE" />
                </Suspense>
            </section>
        </main>
    );
}