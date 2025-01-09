"use client"

import { useState } from "react"
import { useRouter } from "next/navigation";
import { signUpWithEmail, signInWithEmail, signInWithGoogle } from "../../../auth";
import { Bounce, ToastContainer, toast } from 'react-toastify';

export default function Login() {
    const router = useRouter();
    const [mode, setMode] = useState<string>("login");
    const [email, setEmail] = useState<string>();
    const [username, setUsername] = useState<string>();
    const [password, setPassword] = useState<string>();
    const [confPassword, setConfPassword] = useState<string>();
    const [passwordHidden, setPasswordHidden] = useState<string>('password');

    const handleAuthentication = async () => {
        try {
            if (mode === 'login') {
                await signInWithEmail(email, password);
                router.push('/')
            } else { // creating a new account
                if (password === confPassword) {
                    await signUpWithEmail(email, username, password);
                    router.push('/')
                } else {
                    toast.error("Passwords do not match", {
                        position: "top-right",
                        theme: "dark",
                        transition: Bounce,
                    });
                }
            }
        } catch (error) {
            console.error(error);
            toast.error("Please fill all fields", {
                position: "top-right",
                theme: "dark",
                transition: Bounce,
            });
        }
    }

    const handleGoogleAuthentication = async () => {
        await signInWithGoogle();
        router.push('/');
    }

    return (
        <div className="flex flex-col justify-center items-center h-screen">
            <ToastContainer />
            {
                mode === 'login' &&
                <div className="login-container flex flex-col w-1/3 items-center bg-slate-800 py-4 rounded-xl text-lg">
                    <h1 className="font-semibold">Login With Email</h1>
                    <div className="flex flex-col items-center my-8 gap-2">
                        <div className="flex justify-between w-full gap-4">
                            <label htmlFor="email" className="mb-2">Email</label>
                            <input
                                className="py-1 px-4 text-black rounded border-2 border-black"
                                name="email"
                                type="email"
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="flex justify-between w-full gap-4">
                            <label htmlFor="password" className="mb-2">Password</label>
                            <input
                                className="py-1 px-4 text-black rounded border-2 border-black"
                                name="password"
                                type="password"
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>
                    <button
                        className="px-4 py-2 bg-green-600 rounded-2xl hover:bg-green-500 transition 150"
                        onClick={handleAuthentication}>Log In
                    </button>
                </div>
            }
            {
                mode === 'signup' &&
                <div className="login-container flex flex-col w-1/3 items-center bg-slate-800 py-4 gap-2 rounded-xl text-lg">
                    <h1 className="font-semibold">Sign Up</h1>
                    <div className="flex flex-col items-center gap-2">
                        <div className="flex justify-between w-full gap-4">
                            <label htmlFor="email" className="w-1/4">Email</label>
                            <input
                                className="py-1 px-4 text-black rounded border-2 border-black w-3/4"
                                name="email"
                                type="email"
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="flex justify-between w-full gap-4">
                            <label htmlFor="username" className="w-1/4">Username</label>
                            <input
                                className="py-1 px-4 text-black rounded border-2 border-black w-3/4"
                                name="username"
                                type="text"
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                        <div className="flex justify-between w-full gap-4">
                            <label htmlFor="password" className="w-1/4">Password</label>
                            <input
                                className="py-1 px-4 text-black rounded border-2 border-black w-3/4"
                                name="password"
                                type={passwordHidden}
                                pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*(_|[^\w])).{8,}$"
                                required
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <div className="flex flex-row items-center bg-gray-900 px-4 py-1 rounded-xl text-sm ml-20">
                            <div className="flex flex-col">
                                <h1 className="mb-2 font-semibold">Password Must Contain:</h1>
                                <p>At least 8 characters</p>
                                <p>At least One uppercase letter</p>
                                <p>At least one symbol</p>
                            </div>
                        </div>
                        <div className="flex justify-between w-full gap-4">
                            <label htmlFor="confirmPassword" className="w-1/4">Confirm</label>
                            <input
                                className="py-1 px-4 text-black rounded-md border-2 border-black w-3/4"
                                name="confirmPassword"
                                type={passwordHidden}
                                onChange={(e) => setConfPassword(e.target.value)}
                            />
                        </div>
                    </div>
                    <h1 className="text-sm hover:underline cursor-pointer" onClick={() => setPasswordHidden(passwordHidden === 'password' ? 'text' : 'password')}>Show Password</h1>
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