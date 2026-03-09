"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, User, Loader2, ArrowRight, Sparkles } from 'lucide-react';
import { loginAction } from '@/lib/actions';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        const formData = new FormData(e.currentTarget);
        const res = await loginAction(formData);

        if (res.success) {
            router.push('/');
            router.refresh();
        } else {
            setError(res.error || 'Authentication failed');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 blur-[120px] rounded-full animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full animate-pulse delay-700" />

            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md relative z-10"
            >
                {/* Logo Section */}
                <div className="text-center mb-12 space-y-4">
                    <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        className="inline-flex p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl shadow-2xl relative"
                    >
                        <Shield className="w-8 h-8 text-white" />
                        <Sparkles className="w-4 h-4 text-cyan-400 absolute -top-1 -right-1 animate-bounce" />
                    </motion.div>
                    <h1 className="text-4xl font-serif font-light tracking-[0.2em] text-white uppercase">
                        Elite <span className="text-white/20 italic">Sales</span>
                    </h1>
                    <p className="text-[10px] text-white/30 uppercase tracking-[0.5em] font-black">
                        Unified Operating System
                    </p>
                </div>

                {/* Login Card */}
                <div className="bg-white/[0.02] border border-white/10 rounded-[2.5rem] p-10 backdrop-blur-3xl shadow-[0_40px_100px_rgba(0,0,0,0.8)] relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

                    <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                        <div className="space-y-6">
                            {/* Username */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-2">Username</label>
                                <div className="relative group/input">
                                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within/input:text-cyan-400 transition-colors">
                                        <User className="w-4 h-4" />
                                    </div>
                                    <input
                                        name="username"
                                        type="text"
                                        required
                                        placeholder="Admin identifier"
                                        className="w-full bg-black/40 border border-white/5 rounded-2xl py-5 pl-14 pr-6 text-sm text-white placeholder:text-white/10 outline-none focus:border-cyan-500/30 focus:bg-black/60 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-2">Security Key</label>
                                <div className="relative group/input">
                                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within/input:text-cyan-400 transition-colors">
                                        <Lock className="w-4 h-4" />
                                    </div>
                                    <input
                                        name="password"
                                        type="password"
                                        required
                                        placeholder="••••••••"
                                        className="w-full bg-black/40 border border-white/5 rounded-2xl py-5 pl-14 pr-6 text-sm text-white placeholder:text-white/10 outline-none focus:border-cyan-500/30 focus:bg-black/60 transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {error && (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-[10px] text-red-400 uppercase tracking-widest font-black text-center bg-red-400/5 py-3 rounded-xl border border-red-400/10"
                            >
                                {error}
                            </motion.p>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-white text-black py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] flex items-center justify-center gap-3 hover:bg-cyan-400 hover:text-black transition-all shadow-[0_20px_40px_rgba(255,255,255,0.05)] disabled:opacity-50 group/btn"
                        >
                            {isLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <>
                                    Initialize <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer Info */}
                <div className="mt-12 text-center">
                    <p className="text-[9px] text-white/10 uppercase tracking-[0.5em] font-black">
                        Enterprise Grade Security & Auth
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
