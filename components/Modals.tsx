"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, ChevronDown, Sparkles, Loader2, Lock as LucideLock, Copy, Eye, EyeOff } from 'lucide-react';
import { updateProspectFinancials, updateProjectVault, updateProspect, createProspect } from '@/lib/actions';

export const CloseDealModal = ({ isOpen, onClose, prospect, onRefresh }: { isOpen: boolean, onClose: () => void, prospect: any, onRefresh: () => void }) => {
    const [formData, setFormData] = useState({ total_price: '', installments: 1, monthly_maintenance: '', first_payment: new Date().toISOString().split('T')[0] });
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        const nextPayment = new Date(formData.first_payment);
        nextPayment.setMonth(nextPayment.getMonth() + 1);

        const res = await updateProspectFinancials(prospect.id, {
            ...formData,
            next_payment_due: nextPayment.toISOString()
        });

        if (res.success) {
            onRefresh();
            onClose();
        }
        setIsSaving(false);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full max-w-xl bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] p-12 overflow-hidden shadow-2xl">
                        <h3 className="text-2xl font-serif font-light tracking-[0.1em] uppercase text-white/90">Closing <span className="text-white/20 italic">The Deal</span></h3>
                        <p className="text-[10px] text-white/30 uppercase tracking-[0.5em] font-black mt-2 mb-10">{prospect?.business_name}</p>

                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-white/20 ml-2">Precio Total del Proyecto ($)</label>
                                    <input type="number" required placeholder="5000" value={formData.total_price} onChange={e => setFormData({ ...formData, total_price: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-2xl font-serif text-white/90" />
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-white/20 ml-2">Cuotas</label>
                                    <div className="relative">
                                        <select value={formData.installments} onChange={e => setFormData({ ...formData, installments: Number(e.target.value) })} className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-2xl font-serif text-white/90 appearance-none">
                                            <option value={1} className="bg-[#0a0a0a]">1 Cuota</option>
                                            <option value={2} className="bg-[#0a0a0a]">2 Cuotas</option>
                                            <option value={3} className="bg-[#0a0a0a]">3 Cuotas</option>
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 pointer-events-none" />
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 rounded-3xl bg-cyan-500/5 border border-cyan-500/10 flex justify-between items-center">
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-cyan-500/40">Valor de cada Cuota</p>
                                    <p className="text-3xl font-serif text-cyan-400 mt-2">${formData.total_price ? (Number(formData.total_price) / formData.installments).toFixed(2) : '0.00'}</p>
                                </div>
                                <Sparkles className="w-8 h-8 text-cyan-400/20" />
                            </div>

                            <button disabled={isSaving} className="w-full py-6 bg-white text-black text-[11px] font-black uppercase tracking-[0.5em] rounded-3xl hover:shadow-[0_20px_40px_rgba(255,255,255,0.2)] transition-all">
                                {isSaving ? 'SELLANDO...' : 'Sellar Contrato Platinum'}
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export const VaultModal = ({ isOpen, onClose, prospect, onRefresh }: { isOpen: boolean, onClose: () => void, prospect: any, onRefresh: () => void }) => {
    const defaultDetails = { website_url: '', admin_user: '', admin_password: '', database_hosting: '', domain_name: '', domain_renewal_date: '' };
    const [details, setDetails] = useState(defaultDetails);
    const [isSaving, setIsSaving] = useState(false);
    const [showPass, setShowPass] = useState(false);

    useEffect(() => {
        if (prospect?.project_details) setDetails({ ...defaultDetails, ...prospect.project_details });
        else setDetails(defaultDetails);
    }, [prospect]);

    const handleSave = async () => {
        setIsSaving(true);
        await updateProjectVault(prospect.id, details);
        onRefresh();
        onClose();
        setIsSaving(false);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[250] flex items-end justify-end p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="w-full max-w-lg h-full bg-[#0a0a0a] border-l border-white/10 p-12 overflow-y-auto custom-scrollbar shadow-2xl">
                        <div className="flex justify-between items-center mb-12">
                            <div>
                                <h3 className="text-2xl font-serif font-light tracking-widest uppercase text-white">Project <span className="text-white/20 italic">Vault</span></h3>
                                <p className="text-[10px] text-white/30 tracking-[0.4em] font-black uppercase mt-1">Acceso Maestro al Ecosistema</p>
                            </div>
                            <button onClick={onClose} className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-colors"><X className="w-5 h-5" /></button>
                        </div>

                        <div className="space-y-10">
                            {[
                                { label: 'URL del Sitio', field: 'website_url', type: 'text' },
                                { label: 'Nombre de Dominio', field: 'domain_name', type: 'text' },
                                { label: 'Vencimiento Dominio', field: 'domain_renewal_date', type: 'date' },
                                { label: 'Hosting / Base de Datos', field: 'database_hosting', type: 'text' },
                            ].map(f => (
                                <div key={f.field} className="space-y-4">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-white/20 ml-2">{f.label}</label>
                                    <div className="flex gap-2">
                                        <input type={f.type} value={(details as any)[f.field]} onChange={e => setDetails({ ...details, [f.field]: e.target.value })} className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-5 text-sm text-white/80" />
                                        <button onClick={() => navigator.clipboard.writeText((details as any)[f.field])} className="p-5 bg-white/5 rounded-2xl hover:bg-white/10 text-white/20 transition-colors"><Copy className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            ))}

                            <div className="grid grid-cols-2 gap-6 pt-10 border-t border-white/5">
                                <div className="space-y-4">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-white/20 ml-2">Usuario Admin</label>
                                    <input value={details.admin_user} onChange={e => setDetails({ ...details, admin_user: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm" />
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-white/20 ml-2">Contraseña</label>
                                    <div className="relative">
                                        <input type={showPass ? 'text' : 'password'} value={details.admin_password} onChange={e => setDetails({ ...details, admin_password: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 pr-14 text-sm font-mono tracking-widest" />
                                        <button onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors">{showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                                    </div>
                                </div>
                            </div>

                            <button onClick={handleSave} disabled={isSaving} className="w-full py-6 bg-cyan-500 text-black text-[11px] font-black uppercase tracking-[0.5em] rounded-3xl mt-12 transition-all">
                                {isSaving ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Encriptar Bóveda'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export const LeadFormModal = ({ isOpen, onClose, onRefresh, prospect }: { isOpen: boolean, onClose: () => void, onRefresh: () => void, prospect?: any }) => {
    const [formData, setFormData] = useState({ name: '', business_name: '', phone: '', industry: '', status: 'cold' });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (prospect) {
            setFormData({
                name: prospect.name || '',
                business_name: prospect.business_name || '',
                phone: prospect.phone || '',
                industry: prospect.industry || '',
                status: prospect.status || 'cold'
            });
        } else {
            setFormData({ name: '', business_name: '', phone: '', industry: '', status: 'cold' });
        }
    }, [prospect, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        const res = prospect ? await updateProspect(prospect.id, formData) : await createProspect(formData);
        if (res.success) {
            onRefresh();
            onClose();
        }
        setIsSaving(false);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-3xl p-10 shadow-2xl">
                        <h3 className="text-xl font-serif mb-8 tracking-widest uppercase">{prospect ? 'Editar' : 'Nuevo'} <span className="text-white/20 italic">Prospecto</span></h3>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <input placeholder="Nombre Contacto" required className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            <input placeholder="Empresa / Negocio" required className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm" value={formData.business_name} onChange={e => setFormData({ ...formData, business_name: e.target.value })} />
                            <input placeholder="WhatsApp" required className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                            <div className="grid grid-cols-2 gap-6">
                                <input placeholder="Industria" className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm" value={formData.industry} onChange={e => setFormData({ ...formData, industry: e.target.value })} />
                                <select className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm appearance-none outline-none" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                                    <option value="cold" className="bg-[#0a0a0a]">COLD</option>
                                    <option value="contacted" className="bg-[#0a0a0a]">CONTACTED</option>
                                    <option value="interested" className="bg-[#0a0a0a]">INTERESTED</option>
                                    <option value="closed" className="bg-[#0a0a0a]">CLOSED</option>
                                    <option value="cancelled" className="bg-[#0a0a0a]">CANCELLED</option>
                                </select>
                            </div>
                            <button disabled={isSaving} className="w-full py-5 bg-white text-black text-[10px] font-black uppercase tracking-[0.3em] rounded-xl hover:shadow-[0_15px_30px_rgba(255,255,255,0.1)] transition-all">
                                {isSaving ? 'PROCESANDO...' : (prospect ? 'GUARDAR CAMBIOS' : 'REGISTRAR LEAD')}
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
