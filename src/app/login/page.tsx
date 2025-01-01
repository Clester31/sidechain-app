"use client"

import { useState } from "react"
import { useRouter } from "next/navigation";
import { signUpWithEmail, signInWithEmail, signInWithGoogle } from "../../../auth";

export default function Login() {
    const router = useRouter();
    const [mode, setMode] = useState<string>("login");
    const [email, setEmail] = useState<string>();
    const [username, setUsername] = useState<string>();
    const [password, setPassword] = useState<string>();
    const [confPassword, setConfPassword] = useState<string>();

    const handleAuthentication = async () => {
        try {
            if (mode === 'login') {
                await signInWithEmail(email, password);
                router.push('/')
            } else { // creating a new account
                if(password === confPassword) {
                    await signUpWithEmail(email, username, password);
                    router.push('/')
                } else {
                    alert("passwords do not match");
                }
            }
        } catch (error) {
            console.error(error);
        }
    }

    const handleGoogleAuthentication = async () => {
        await signInWithGoogle();
        router.push('/');
    }

    return (
        <div className="flex flex-col justify-center items-center h-screen">
            {
                mode === 'login' &&
                <div className="login-container flex flex-col w-1/4 items-center bg-slate-800 py-4 rounded-xl text-lg">
                    <h1 className="font-semibold">Login With Email</h1>
                    <div className="flex flex-col items-center my-8 gap-2">
                        <label htmlFor="email" className="mb-2">Email</label>
                        <input
                            className="py-2 px-4 text-black rounded-md"
                            name="email"
                            type="email"
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <label htmlFor="password" className="mt-4 mb-2">Password</label>
                        <input
                            className="py-2 px-4 text-black rounded-md"
                            name="password"
                            type="password"
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button
                        className="px-4 py-2 bg-green-600 rounded-2xl hover:bg-green-500 transition 150"
                        onClick={handleAuthentication}>Log In
                    </button>
                </div>
            }
            {
                mode === 'signup' &&
                <div className="login-container flex flex-col w-1/4 items-center bg-slate-800 py-4 rounded-xl text-lg">
                    <h1 className="font-semibold">Sign Up</h1>
                    <div className="flex flex-col items-center my-8 gap-2">
                        <label htmlFor="email" className="mb-2">Email</label>
                        <input
                            className="py-2 px-4 text-black rounded-md"
                            name="email"
                            type="email"
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <label htmlFor="username" className="mb-2">Username</label>
                        <input
                            className="py-2 px-4 text-black rounded-md"
                            name="username"
                            type="text"
                            onChange={(e) => setUsername(e.target.value)}
                        />
                        <label htmlFor="password" className="mb-2">Password</label>
                        <input
                            className="py-2 px-4 text-black rounded-md"
                            name="password"
                            type="password"
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <label htmlFor="confirmPassword" className="mb-2">Password</label>
                        <input
                            className="py-2 px-4 text-black rounded-md"
                            name="confirmPassword"
                            type="password"
                            onChange={(e) => setConfPassword(e.target.value)}
                        />
                    </div>
                    <button
                        className="px-4 py-2 bg-green-600 rounded-2xl hover:bg-green-500 transition 150"
                        onClick={handleAuthentication}>{mode === 'login' ? 'Log In' : 'Sign Up'}
                    </button>
                </div>
            }
            <div className="my-4">
                {
                    mode === 'login' &&
                    <h1>Don&apos;t have an account? <span onClick={() => setMode("signup")} className="text-green-500 cursor-pointer">Create one.</span></h1>
                }
                {
                    mode === 'signup' &&
                    <h1>Already have an account? <span onClick={() => setMode("login")} className="text-green-500 cursor-pointer">Log in.</span></h1>
                }
            </div>
            <button onClick={handleGoogleAuthentication} className="bg-sky-600 p-2 rounded-xl">Sign in with Google</button>
        </div>
    )
}