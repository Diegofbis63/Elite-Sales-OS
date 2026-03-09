"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    Users,
    MessageSquare,
    BarChart3,
    Settings,
    Search,
    Sparkles,
    Bell,
    Briefcase,
    Globe
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { getProfile, updateProfile } from '@/lib/actions';
import { ProfileModal } from './ProfileModal';
import { useLanguage } from '@/components/LanguageContext';

export const Sidebar = () => {
    const pathname = usePathname();
    const { t } = useLanguage();
    const navItems = [
        { id: '/', icon: LayoutDashboard, label: t('nav_dashboard') },
        { id: '/prospects', icon: Users, label: t('nav_prospects') },
        { id: '/projects', icon: Briefcase, label: t('nav_projects') },
        { id: '/copywriting', icon: MessageSquare, label: t('nav_copywriting') },
        { id: '/analytics', icon: BarChart3, label: t('nav_analytics') },
        { id: '/ajustes', icon: Settings, label: t('nav_settings') },
    ];

    return (
        <aside className="w-64 border-r border-white/5 bg-black/50 backdrop-blur-3xl h-full fixed left-0 top-0 hidden lg:flex flex-col z-[50]">
            <div className="h-24 flex items-center px-10 border-b border-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-black font-black text-xs shadow-[0_0_15px_rgba(255,255,255,0.2)]">E</div>
                    <span className="font-serif font-light tracking-[0.4em] text-[10px] uppercase text-white/90">Elite Sales</span>
                </div>
            </div>
            <nav className="flex-1 py-14 px-6 space-y-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.id;
                    return (
                        <Link
                            key={item.id}
                            href={item.id}
                            className={`w-full relative flex items-center px-6 py-4 rounded-xl transition-all group ${isActive ? 'text-white' : 'text-white/30 hover:text-white hover:bg-white/[0.02]'}`}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="active-nav"
                                    className="absolute inset-0 bg-white/5 border border-white/10 rounded-xl"
                                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                />
                            )}
                            <item.icon className={`w-4 h-4 relative z-10 transition-colors ${isActive ? 'text-white' : 'group-hover:text-white'}`} />
                            <span className="ml-5 text-[10px] font-black tracking-[0.2em] relative z-10 uppercase">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>
            <div className="p-8 border-t border-white/5">
                <div className="p-6 rounded-2xl bg-gradient-to-br from-white/[0.05] to-transparent border border-white/5 text-center">
                    <p className="text-2xl font-serif italic text-white/20 leading-none italic uppercase tracking-tighter">Elite Agency</p>
                    <p className="text-[9px] text-white/10 uppercase tracking-[0.4em] font-black mt-2">OS v4.0 Platinum</p>
                </div>
            </div>
        </aside>
    );
};

export const Header = ({ profile, onEditProfile, onSearch }: { profile: any, onEditProfile: () => void, onSearch?: (q: string) => void }) => {
    const { language, setLanguage, t } = useLanguage();

    return (
        <header className="h-24 flex items-center justify-between px-10 lg:px-14 border-b border-white/5 bg-[#0a0a0a]/50 backdrop-blur-md sticky top-0 z-40">
            <div className="flex items-center gap-6 flex-1 max-w-2xl">
                <Search className="w-4 h-4 text-white/20" />
                <input
                    type="text"
                    onChange={(e) => onSearch?.(e.target.value)}
                    placeholder={t('header_search')}
                    className="w-full bg-transparent text-[11px] font-light tracking-widest text-white/80 placeholder-white/20 focus:outline-none"
                />
            </div>

            <div className="flex items-center gap-8">
                {/* Language Toggle */}
                <div className="flex items-center bg-white/[0.03] border border-white/5 rounded-full p-1 h-10 w-28 relative">
                    <div
                        className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-full transition-all duration-300 ${language === 'en' ? 'left-[calc(50%+2px)]' : 'left-1'}`}
                    />
                    <button
                        onClick={() => setLanguage('es')}
                        className={`flex-1 text-[9px] font-black uppercase tracking-tighter relative z-10 transition-colors ${language === 'es' ? 'text-black' : 'text-white/40'}`}
                    >
                        ES
                    </button>
                    <button
                        onClick={() => setLanguage('en')}
                        className={`flex-1 text-[9px] font-black uppercase tracking-tighter relative z-10 transition-colors ${language === 'en' ? 'text-black' : 'text-white/40'}`}
                    >
                        EN
                    </button>
                </div>

                <div className="flex items-center gap-3 pr-8 border-r border-white/5">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_10px_rgba(34,211,238,0.5)] animate-pulse" />
                    <span className="text-[9px] font-black tracking-[0.3em] uppercase text-white/30">{t('header_sync')}</span>
                </div>

                <div className="flex items-center gap-4 group cursor-pointer" onClick={onEditProfile}>
                    <div className="text-right hidden sm:block">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/90">{profile?.full_name || t('header_director')}</p>
                        <p className="text-[8px] uppercase tracking-widest text-white/20 mt-1">{profile?.role || t('header_role')}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full border border-white/10 p-0.5 group-hover:border-white/40 transition-all duration-500">
                        <div className="w-full h-full rounded-full bg-white/5 overflow-hidden">
                            {profile?.photo_base64 ? (
                                <img src={profile.photo_base64} className="w-full h-full object-cover grayscale brightness-125" alt="Avatar" />
                            ) : (
                                <img src="https://picsum.photos/seed/elite_user/100/100" className="w-full h-full object-cover grayscale brightness-125" alt="Avatar" />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export const EliteLayout = ({ children, onSearch }: { children: React.ReactNode, onSearch?: (q: string) => void }) => {
    const [profile, setProfile] = useState<any>(null);
    const [showProfileModal, setShowProfileModal] = useState(false);

    const fetchProfile = async () => {
        const p = await getProfile();
        setProfile(p);
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-cyan-500/30">
            <Sidebar />
            <main className="lg:pl-64 min-h-screen flex flex-col">
                <Header profile={profile} onEditProfile={() => setShowProfileModal(true)} onSearch={onSearch} />
                <div className="flex-1 p-10 lg:p-14 max-w-[1600px] mx-auto w-full">
                    {children}
                </div>
            </main>

            <ProfileModal
                isOpen={showProfileModal}
                onClose={() => setShowProfileModal(false)}
                profile={profile}
                onRefresh={fetchProfile}
            />
        </div>
    );
};

