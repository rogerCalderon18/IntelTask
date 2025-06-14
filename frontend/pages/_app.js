import "@/styles/globals.css";
import { HeroUIProvider } from "@heroui/react";
import { SessionProvider } from "next-auth/react";
import Layout from "@/components/Layout/Layout";
import { useRouter } from "next/router";

export default function App({ Component, pageProps }) {
  const router = useRouter();

  // Rutas sin Layout
  const noLayoutPages = ["/auth/login"];

  return (
    <SessionProvider session={pageProps.session}>
      <HeroUIProvider>
        {noLayoutPages.includes(router.pathname) ? (
          <Component {...pageProps} />
        ) : (
          <Layout>
            <Component {...pageProps} />
          </Layout>
        )}
      </HeroUIProvider>
    </SessionProvider>
  );
}
