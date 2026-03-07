"use client";

import { motion } from "framer-motion";
import { FaLinkedinIn, FaXTwitter, FaGithub } from "react-icons/fa6";
import Link from "next/link";

const Footer = () => {
    return (
        <footer
            style={{
                background: "#0c0a1a",
                padding: "80px 24px 40px",
                borderTop: "1px solid rgba(255,255,255,0.06)",
            }}
        >
            <div
                style={{
                    maxWidth: 1100,
                    margin: "0 auto",
                }}
            >
                {/* Top Grid */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                        gap: 50,
                        marginBottom: 60,
                    }}
                >
                    {/* Brand + Newsletter */}
                    <div>
                        <h2
                            style={{
                                color: "#ffffff",
                                fontSize: 18,
                                fontWeight: 600,
                                marginBottom: 14,
                            }}
                        >
                            Scasi
                        </h2>

                        <p
                            style={{
                                color: "#8b8aa3",
                                fontSize: 14,
                                lineHeight: 1.7,
                                marginBottom: 20,
                            }}
                        >
                            Intelligent email prioritization powered by AI.
                            Built for professionals who value clarity and control.
                        </p>

                    </div>

                    {/* Product Links */}
                    <FooterColumn
                        title="Product"
                        links={[
                            { label: "Features", href: "/features" },
                            { label: "Security", href: "/security" },
                            { label: "Pricing", href: "/pricing" },
                        ]}
                    />

                    {/* Company Links */}
                    <FooterColumn
                        title="Company"
                        links={[
                            { label: "About", href: "/about" },
                            { label: "Blog", href: "/blog" },
                            { label: "Careers", href: "/careers" },
                        ]}
                    />

                    {/* Legal Links */}
                    <FooterColumn
                        title="Legal"
                        links={[
                            { label: "Privacy", href: "/privacy" },
                            { label: "Terms", href: "/terms" },
                        ]}
                    />
                </div>

                {/* Moving Gradient Divider */}
                <motion.div
                    animate={{
                        backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                    style={{
                        height: 1,
                        background:
                            "linear-gradient(270deg, transparent, #7c3aed, transparent)",
                        backgroundSize: "200% 200%",
                        marginBottom: 30,
                    }}
                />

                {/* Bottom Row */}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: 20,
                    }}
                >
                    <p
                        style={{
                            color: "#6f6d85",
                            fontSize: 13,
                        }}
                    >
                        © 2026 Scasi. All rights reserved.
                    </p>

                    {/* Social Icons */}
                    <div style={{ display: "flex", gap: 16 }}>
                        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
                            <motion.div
                                whileHover={{ y: -3, scale: 1.05 }}
                                style={{
                                    width: 34,
                                    height: 34,
                                    borderRadius: "50%",
                                    background: "rgba(255,255,255,0.04)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    cursor: "pointer",
                                    color: "#8b8aa3",
                                    fontSize: 14,
                                }}
                            >
                                <FaLinkedinIn />
                            </motion.div>
                        </a>
                        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                            <motion.div
                                whileHover={{ y: -3, scale: 1.05 }}
                                style={{
                                    width: 34,
                                    height: 34,
                                    borderRadius: "50%",
                                    background: "rgba(255,255,255,0.04)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    cursor: "pointer",
                                    color: "#8b8aa3",
                                    fontSize: 14,
                                }}
                            >
                                <FaXTwitter />
                            </motion.div>
                        </a>
                        <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                            <motion.div
                                whileHover={{ y: -3, scale: 1.05 }}
                                style={{
                                    width: 34,
                                    height: 34,
                                    borderRadius: "50%",
                                    background: "rgba(255,255,255,0.04)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    cursor: "pointer",
                                    color: "#8b8aa3",
                                    fontSize: 14,
                                }}
                            >
                                <FaGithub />
                            </motion.div>
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

/* Reusable Column */
const FooterColumn = ({
    title,
    links,
}) => {
    return (
        <div>
            <h4
                style={{
                    color: "#c7c6d9",
                    fontSize: 12,
                    fontWeight: 600,
                    marginBottom: 16,
                    letterSpacing: 1,
                    textTransform: "uppercase",
                }}
            >
                {title}
            </h4>

            {links.map((link, i) => (
                <Link key={i} href={link.href} style={{ textDecoration: "none" }}>
                    <motion.div
                        whileHover={{ x: 4 }}
                        style={{
                            position: "relative",
                            marginBottom: 12,
                            cursor: "pointer",
                            color: "#8b8aa3",
                            fontSize: 14,
                        }}
                    >
                        {link.label}

                        {/* Animated underline */}
                        <motion.span
                            style={{
                                position: "absolute",
                                bottom: -4,
                                left: 0,
                                height: 1,
                                width: 0,
                                background: "#7c3aed",
                            }}
                            whileHover={{ width: "100%" }}
                        />
                    </motion.div>
                </Link>
            ))}
        </div>
    );
};

export default Footer;