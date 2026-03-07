"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoadingPage() {
    const router = useRouter();

    useEffect(() => {
        console.log("🎬 Loading page mounted - Animation should start now");
    }, []);

    const handleComplete = () => {
        router.replace("/");
    };

}
