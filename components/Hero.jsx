"use client";

import { signIn } from "next-auth/react";

export default function Hero() {
    return (
        <section className="relative w-full min-h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden bg-gradient-to-b from-[#faf9ff] via-[#f3f0ff] to-[#ede9fe]">

            {/* Soft Premium Purple Glow */}
            <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-purple-400/10 blur-[120px] rounded-full -z-10"></div>

            {/* Announcement Pill */}
            <div className="mb-10 px-6 py-3 bg-white/80 backdrop-blur-md rounded-full shadow-sm border border-purple-100 text-[#4338ca] text-sm font-medium">
                ✨ Join thousands of happy users
            </div>

            {/* Headline */}
            <h1 className="text-6xl md:text-7xl font-semibold leading-tight text-[#1e1b4b]">
                Your assistant for
                <br />
                <span className="text-[#a5b4fc]">
                    scheduling follow-ups
                </span>
            </h1>

            {/* Subtext */}
            <p className="mt-8 text-lg text-[#475569] max-w-2xl leading-relaxed">
                Scassi quietly organizes your inbox in the background and groups
                emails into clear categories. You only see what truly matters.
            </p>

            {/* CTA Section */}
            <div className="mt-12 flex flex-col items-center gap-5">

                <p className="text-sm text-[#64748b]">
                    Try free with <span className="font-semibold">1-click:</span>
                </p>

                <button
                    onClick={() => signIn("google", { callbackUrl: "/" })}
                    className="px-10 py-4 bg-[#1e1b4b] text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                >
                    Continue with Google
                </button>

                <p className="text-sm text-[#94a3b8]">
                    7-day free trial.
                </p>

            </div>

        </section>
    );
}