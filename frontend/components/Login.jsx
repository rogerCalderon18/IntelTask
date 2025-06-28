import { Card, CardBody, Input, Button, CardHeader, Form, Spinner } from "@heroui/react";
import { EyeFilledIcon } from "./icons/EyeFilledIcon";
import { EyeSlashFilledIcon } from "./icons/EyeSlashFilledIcon";
import { useCallback, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import React from "react";

const Login = () => {
  const [isVisible, setIsVisible] = React.useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const router = useRouter();

  const toggleVisibility = () => setIsVisible(!isVisible);

  const handleLogin = useCallback(
    async (values) => {
      setLoading(true);
      setErrorMessage(null);

      try {
        const result = await signIn("credentials", {
          redirect: false,
          email: values.email,
          password: values.password,
        });

        if (result?.error) {
          setErrorMessage("Credenciales inválidas");
        } else if (result?.url) {
          router.replace("/tareas");
        }
      } catch (error) {
        setErrorMessage("Ocurrió un error. Intente nuevamente.");
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  return (
    <div className="flex justify-center items-center min-h-screen relative bg-gradient-to-br from-white via-gray-100 to-gray-200">
      <Card className="w-full max-w-lg shadow-2xl rounded-lg">
        <CardHeader className="relative flex flex-col items-center justify-center gap-1 py-6 overflow-hidden rounded-t-lg">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-500 to-blue-400" />

          <h1 className="relative z-10 text-3xl font-extrabold tracking-wide text-white drop-shadow-md">
            IntelTask
          </h1>

          <p className="relative z-10 text-sm sm:text-base text-white/90">
            Gestión inteligente de tus tareas
          </p>
        </CardHeader>

        <CardBody className="p-6">
          <h2 className="text-3xl font-bold text-center text-gray-500 my-5">
            Inicio de sesión
          </h2>
          <Form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const values = {
                email: formData.get("email"),
                password: formData.get("password"),
              };
              handleLogin(values);
            }}
            className="flex flex-col gap-4"
          >
            <Input
              type="email"
              autoComplete="email"
              isRequired
              name="email"
              placeholder="Usuario"
              variant="bordered"
              className="focus:border-blue-500 h-12 text-base"
            />

            <Input
              name="password"
              isRequired
              autoComplete="current-password"
              endContent={
                <button
                  aria-label="toggle password visibility"
                  className="focus:outline-none"
                  type="button"
                  onClick={toggleVisibility}
                >
                  {isVisible ? (
                    <EyeSlashFilledIcon className="text-xl text-gray-400 pointer-events-none" />
                  ) : (
                    <EyeFilledIcon className="text-xl text-gray-400 pointer-events-none" />
                  )}
                </button>
              }
              placeholder="Contraseña"
              type={isVisible ? "text" : "password"}
              variant="bordered"
              className="focus:border-blue-500 h-12 text-base"
            />

            <a
              href="/forgot-password"
              className="text-sm text-blue-500 hover:underline text-right"
            >
              ¿Olvidaste tu contraseña?
            </a>

            <Button
              type="submit"
              className="bg-blue-500 text-white w-full h-12 text-lg hover:bg-blue-600 flex items-center justify-center"
              disabled={loading}
            >
              {loading ? <Spinner size="lg" className="text-white" color="default" /> : "Login"}
            </Button>
          </Form>
          {errorMessage && (
            <p className="text-red-500 text-center mt-4">{errorMessage}</p>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default Login;