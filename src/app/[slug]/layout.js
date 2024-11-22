// shared layout for [slug] route (i.e. an individual event setup)

import { StageContextProvider } from "@/components/StageContext";

export async function generateMetadata({ params }) {
    const { slug } = await params
}

export default async function Layout({ children, params }) {
    const { slug } = await params;
    return (
        <>
            <StageContextProvider slug={slug} >
                <main>{children}</main>
            </StageContextProvider>
        </>
    )
}