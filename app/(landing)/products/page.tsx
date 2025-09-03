import Product from '@/components/products/product';

export default function ProductsPage() {
    return (
        <main className="max-w-7xl w-full mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6">
                Products
            </h1>
            <section className="">
                <Product product={{
                    id: "1",
                    title: "NextJS Course - Beginner",
                    subtitle: "Learn how to build performant and reactive websites",
                    description: "This comprehensive beginner-friendly Next.js course guides you through building modern, performant, and accessible web applications using React and Next.js. You'll learn the fundamentals of server-side rendering, routing with the /app directory, SEO optimization, and integrating Tailwind CSS for responsive design. The course covers best practices for state management with React hooks, secure environment variable usage, and deploying scalable apps. By the end, you'll be able to create production-ready websites that are fast, accessible, and optimized for search engines.",
                    stripe_product_id: "prod_Sz70bFdPcvk1BE"
                }} />
            </section>
        </main>
    );
}