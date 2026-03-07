"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function LaptopDemo() {
    const [showSummary, setShowSummary] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowSummary(true);
        }, 2200);

        return () => clearTimeout(timer);
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2 }}
            className="relative perspective-1000"
        >
            {/* Floating Animation */}
            <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="relative"
            >
                {/* Laptop Frame */}
                <div className="w-[560px] h-[360px] bg-gray-900 rounded-2xl shadow-2xl p-3 border border-gray-700">

                    {/* Screen */}
                    <div className="w-full h-full bg-gradient-to-br from-indigo-950 via-purple-950 to-black rounded-xl p-5 overflow-hidden">

                        {/* Fake Inbox Email */}
                        <motion.div
                            initial={{ x: -60, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="bg-white/5 p-4 rounded-lg mb-4 backdrop-blur-md"
                        >
                            <p className="text-sm text-white font-semibold">
                                🔥 Internship Deadline Tomorrow
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                                Please submit your documents before 21 Feb.
                            </p>
                        </motion.div>

                        {/* Priority Badge */}
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 1.2 }}
                            className="bg-red-500 text-white text-xs px-4 py-1 rounded-full inline-block shadow-lg"
                        >
                            Priority: 92
                        </motion.div>

                        {/* AI Summary */}
                        {showSummary && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 1 }}
                                className="mt-5 bg-white/10 p-4 rounded-lg"
                            >
                                <p className="text-xs text-white leading-relaxed">
                                    ✨ AI Summary: This email requires immediate action as the
                                    deadline is tomorrow. Recommended to respond within 24 hours.
                                </p>
                            </motion.div>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* Glow Effect */}
            <div className="absolute -inset-6 bg-purple-600/30 blur-3xl rounded-full -z-10"></div>
        </motion.div>
    );
}