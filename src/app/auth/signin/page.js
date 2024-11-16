"use client";

import { useState, useEffect } from "react";
import GoogleIcon from "@mui/icons-material/Google";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true); // Ensures this runs only on the client
  }, []);

  const handleGoogle = async () => {
    try {
      await signIn("google", { callbackUrl: "/Dashboard" });
    } catch (error) {
      console.log(error);
    }
  };

  if (!isClient) {
    return null; // Prevent rendering on the server to avoid hydration mismatch
  }

  return (
    <>
      <div className="flex justify-center min-h-screen bg-gray-100 antialiased">
        <div className="container sm:mt-40 mt-24 my-auto max-w-md border-2 border-gray-200 p-3 bg-white">
          <div className="text-center m-6">
            <h1 className="text-3xl font-semibold text-gray-700">
              Welcome back
            </h1>
            <p className="text-gray-500">Sign in into your account</p>
          </div>

          <div className="m-6">
            <div className="flex flex-row justify-center mb-8">
              <span className="absolute bg-white px-4 text-gray-500">
                or sign-in with
              </span>
              <div className="w-full bg-gray-200 mt-3 h-px"></div>
            </div>

            <div className="flex flex-row gap-2">
              <button
                type="submit"
                className="bg-white border border-black text-black w-full p-2 flex flex-row justify-center gap-2 items-center rounded-sm hover:bg-gray-200 duration-100 ease-in-out"
                onClick={handleGoogle}
              >
                <GoogleIcon />
                Google
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
