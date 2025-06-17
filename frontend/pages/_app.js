import "@/styles/globals.css";
import { HeroUIProvider } from "@heroui/react";
import { SessionProvider, useSession } from "next-auth/react";
import Layout from "@/components/Layout/Layout";
import { useRouter } from "next/router";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useEffect } from "react";
import { toast } from "react-toastify";

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <SessionProvider session={session}>
      <AppContent Component={Component} pageProps={pageProps} />
    </SessionProvider>
  );
}

function AppContent({ Component, pageProps }) {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated" && router.pathname !== "/auth/login") {
      toast.error("Tu sesión ha expirado");
      router.push("/auth/login");
    }
  }, [status, router]);

  // Rutas sin Layout
  const noLayoutPages = ["/auth/login"];

  return (
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
  );
}

export default MyApp;
