import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                const baseUrl = process.env.NEXT_PUBLIC_API_URL;
                const { email, password } = credentials || {};

                try {
                    const res = await fetch(`${baseUrl}/api/Auth/login`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            cT_Correo_usuario: credentials.email,
                            cT_Contrasenna: credentials.password,
                        }),
                    });

                    if (!res.ok) {
                        console.log("Autenticación fallida");
                        return null;
                    }

                    const userData = await res.json();
                    console.log("Usuario autenticado:", userData);

                    // IMPORTANTE: Devolver exactamente este formato para NextAuth
                    if (userData) {
                        return {
                            id: String(userData.cN_Id_usuario),
                            name: userData.cT_Nombre_usuario,
                            email: userData.cT_Correo_usuario,
                            role: userData.cN_Id_rol
                        };
                    }

                    return null;
                } catch (error) {
                    console.error("Fetch error:", error);
                    throw new Error("Error en el servidor de autenticación");
                }
            }
        }),
    ],
    session: {
        strategy: "jwt",
        maxAge: 60 * 60 * 2,
    },
    secret: process.env.NEXTAUTH_SECRET,
    jwt: {
        maxAge: 60 * 60 * 2, 
    },
    pages: {
        signIn: "/auth/login",
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                return { ...token, ...user };
            }
            return token;
        },
        async session({ session, token }) {
            session.user = {
                ...token,
            };
            return session;
        },
    },
};

export default NextAuth(authOptions);
