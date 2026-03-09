"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Briefcase, Camera, Loader2 } from 'lucide-react';
import { updateProfile } from '@/lib/actions';

export const ProfileModal = ({ isOpen, onClose, profile, onRefresh }: { isOpen: boolean, onClose: () => void, profile: any, onRefresh: () => void }) => {
    const [formData, setFormData] = useState({ full_name: profile?.full_name || '', role: profile?.role || '', photo_base64: profile?.photo_base64 || '' });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (profile) setFormData({ full_name: profile.full_name, role: profile.role, photo_base64: profile.photo_base64 });
    }, [profile]);

    const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setFormData(prev => ({ ...prev, photo_base64: reader.result as string }));
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        const res = await updateProfile(formData);
        if (res.success) {
            onRefresh();
            onClose();
        }
        setIsSaving(false);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="w-full max-w-xl bg-[#0a0a0a] border border-white/10 rounded-[3rem] p-12 relative shadow-[0_50px_100px_rgba(0,0,0,0.5)]"
                    >
                        <button onClick={onClose} className="absolute top-8 right-8 p-3 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
                            <X className="w-5 h-5" />
                        </button>

                        <div className="space-y-12">
                            <div className="text-center">
                                <h3 className="text-3xl font-serif font-light tracking-tighter uppercase">Perfil de <span className="text-white/20 italic">Acceso</span></h3>
                                <p className="text-[10px] text-white/30 tracking-[0.4em] font-black uppercase mt-2">Director del Protocolo Elite</p>
                            </div>

                            <div className="flex justify-center">
                                <div className="relative group cursor-pointer" onClick={() => document.getElementById('photo-upload')?.click()}>
                                    <div className="w-32 h-32 rounded-full border-2 border-dashed border-white/10 p-1 group-hover:border-cyan-500/50 transition-all duration-500">
                                        <div className="w-full h-full rounded-full bg-white/5 overflow-hidden flex items-center justify-center">
                                            {formData.photo_base64 ? (
                                                <img src={formData.photo_base64} className="w-full h-full object-cover grayscale brightness-125 transition-all group-hover:scale-110" alt="Profile" />
                                            ) : (
                                                <User className="w-10 h-10 text-white/10 group-hover:text-cyan-500/50 transition-colors" />
                                            )}
                                        </div>
                                    </div>
                                    <div className="absolute bottom-0 right-0 p-2 bg-white text-black rounded-full shadow-lg group-hover:scale-110 transition-transform">
                                        <Camera className="w-4 h-4" />
                                    </div>
                                    <input id="photo-upload" type="file" className="hidden" accept="image/*" onChange={handlePhoto} />
                                </div>
                            </div>

                            <div className="space-y-8">
                                <div className="space-y-4">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-white/20 ml-4 flex items-center gap-2">
                                        <User className="w-3 h-3" /> Nombre Completo
                                    </label>
                                    <input
                                        value={formData.full_name}
                                        onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                                        className="w-full bg-white/[0.02] border border-white/10 rounded-2xl py-5 px-8 text-sm text-white/80 focus:outline-none focus:border-cyan-500/50 transition-all"
                                    />
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-white/20 ml-4 flex items-center gap-2">
                                        <Briefcase className="w-3 h-3" /> Cargo / Rango Elite
                                    </label>
                                    <input
                                        value={formData.role}
                                        onChange={e => setFormData({ ...formData, role: e.target.value })}
                                        className="w-full bg-white/[0.02] border border-white/10 rounded-2xl py-5 px-8 text-sm text-white/80 focus:outline-none focus:border-cyan-500/50 transition-all font-serif"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="w-full py-6 bg-white text-black text-[11px] font-black uppercase tracking-[0.5em] rounded-3xl hover:bg-neutral-100 transition-all shadow-[0_20px_40px_rgba(255,255,255,0.1)] flex items-center justify-center gap-4 disabled:opacity-50"
                            >
                                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sincronizar Identidad'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
