import "@/styles/globals.css";
import { HeroUIProvider } from "@heroui/react";
import { SessionProvider } from "next-auth/react";
import Layout from "@/components/Layout/Layout";
import { useRouter } from "next/router";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function App({ Component, pageProps }) {
  const router = useRouter();

  // Rutas sin Layout
  const noLayoutPages = ["/auth/login"];

  return (
    <SessionProvider session={pageProps.session}>
      <HeroUIProvider>
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          closeOnClick
          pauseOnHover
        />
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
