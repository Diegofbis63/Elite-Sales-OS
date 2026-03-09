"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, MessageSquare, Lock as LucideLock, CheckCircle2, X, Edit2, Trash2, Database, Briefcase, Film, ChevronDown, Users } from 'lucide-react';
import { INITIAL_PROJECTS, Project } from '@/lib/projects';
import { SpotlightCard } from './SpotlightCard';
import { getProspects, updateProspectStatus, deleteProspect, queueMessage } from '@/lib/actions';
import { useLanguage } from './LanguageContext';
import { SectionHeader } from './SectionHeader';

export const ProspectsList = ({ searchQuery = '', onEdit, onOpenVault, onCloseDeal }: { searchQuery?: string, onEdit: (p: any) => void, onOpenVault: (p: any) => void, onCloseDeal: (p: any) => void }) => {
    const { t } = useLanguage();
    const [prospectsList, setProspectsList] = useState<any[]>([]);
    const [isFetching, setIsFetching] = useState(true);
    const [selectedProspect, setSelectedProspect] = useState<any>(null);
    const [showWhatsApp, setShowWhatsApp] = useState(false);

    const fetchProspects = () => {
        setIsFetching(true);
        getProspects().then(data => {
            setProspectsList(data);
            setIsFetching(false);
        });
    };

    useEffect(() => {
        fetchProspects();
    }, []);

    const filteredProspects = prospectsList.filter(p => {
        const query = searchQuery.toLowerCase();
        return (
            (p.name?.toLowerCase() || '').includes(query) ||
            (p.business_name?.toLowerCase() || '').includes(query) ||
            (p.industry?.toLowerCase() || '').includes(query)
        );
    });

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'interested': return 'text-amber-400 border-amber-400/20 bg-amber-400/5';
            case 'contacted': return 'text-cyan-400 border-cyan-400/20 bg-cyan-400/5';
            case 'closed': return 'text-purple-400 border-purple-400/20 bg-purple-400/5';
            case 'cancelled': return 'text-red-400 border-red-400/20 bg-red-400/5';
            default: return 'text-white/20 border-white/5 bg-white/[0.02]';
        }
    };

    const handleStatusUpdate = async (id: string, newStatus: any) => {
        const res = await updateProspectStatus(id, newStatus);
        if (res.success) fetchProspects();
    };

    const handleDelete = async (id: string) => {
        if (confirm(t('delete_confirm'))) {
            const res = await deleteProspect(id);
            if (res.success) fetchProspects();
        }
    };

    return (
        <div className="space-y-8 lg:space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-500">
            <SectionHeader
                icon={Users}
                label={t('leads_title')}
                title={t('leads_title')}
                accent="Hub"
                subtitle={t('leads_subtitle')}
                rightElement={
                    <button
                        onClick={() => onEdit(null)}
                        className="w-full sm:w-auto h-16 sm:h-20 px-6 sm:px-10 bg-white text-black text-[10px] sm:text-[11px] font-black tracking-[0.2em] sm:tracking-[0.3em] uppercase rounded-2xl sm:rounded-[2rem] flex items-center justify-center gap-4 hover:shadow-[0_20px_40px_rgba(255,255,255,0.1)] transition-all whitespace-nowrap"
                    >
                        <Plus className="w-5 h-5" /> {t('leads_new_btn')}
                    </button>
                }
            />

            <SpotlightCard className="overflow-hidden border-0" neon={false}>
                <div className="bg-black/20 backdrop-blur-xl rounded-3xl overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.5)]">
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse min-w-[1000px]">
                            <thead>
                                <tr className="border-b border-white/5 text-white/20 text-[8px] sm:text-[9px] font-black uppercase tracking-[0.3em] sm:tracking-[0.4em] bg-white/[0.01]">
                                    <th className="px-6 sm:px-12 py-6 sm:py-10 font-black">{t('leads_table_entity')}</th>
                                    <th className="px-6 sm:px-12 py-6 sm:py-10 font-black">{t('leads_table_industry')}</th>
                                    <th className="px-6 sm:px-12 py-6 sm:py-10 font-black">{t('leads_table_channel')}</th>
                                    <th className="px-6 sm:px-12 py-6 sm:py-10 font-black">{t('leads_table_status')}</th>
                                    <th className="px-6 sm:px-12 py-6 sm:py-10 text-right font-black">{t('leads_table_actions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                <AnimatePresence mode="popLayout">
                                    {isFetching ? (
                                        Array.from({ length: 5 }).map((_, i) => (
                                            <tr key={i} className="border-b border-white/5 animate-pulse">
                                                <td colSpan={5} className="px-12 py-12 bg-white/[0.01]" />
                                            </tr>
                                        ))
                                    ) : filteredProspects.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-12 py-32 text-center text-white/10 uppercase tracking-[0.5em] text-[10px] font-black">{t('leads_empty')}</td>
                                        </tr>
                                    ) : (
                                        filteredProspects.map((p, i) => (
                                            <motion.tr
                                                key={p.id}
                                                layout
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.03 }}
                                                className="border-b border-white/5 hover:bg-white/[0.03] transition-all group"
                                            >
                                                <td className="px-6 sm:px-12 py-6 sm:py-10">
                                                    <div className="text-[13px] sm:text-[14px] font-serif tracking-widest text-white/90 group-hover:text-white transition-colors uppercase leading-normal font-light">{p.business_name || p.name}</div>
                                                    <div className="text-[7px] sm:text-[8px] text-white/10 mt-2 uppercase tracking-[0.4em] font-black">UID: {String(p.id).slice(0, 8)}</div>
                                                </td>
                                                <td className="px-6 sm:px-12 py-6 sm:py-10">
                                                    <span className="text-[9px] sm:text-[10px] text-white/40 font-light tracking-[0.3em] uppercase">/ {p.industry || t('leads_industry_general')}</span>
                                                </td>
                                                <td className="px-6 sm:px-12 py-6 sm:py-10">
                                                    <div className="text-[11px] sm:text-[12px] font-mono text-white/80 font-bold tracking-widest">{p.phone || t('leads_private')}</div>
                                                    <div className={`mt-2 flex items-center gap-2 ${p.has_website ? 'text-green-500/30' : 'text-red-500/30'}`}>
                                                        <div className={`w-1 h-1 rounded-full ${p.has_website ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`} />
                                                        <span className="text-[7px] sm:text-[8px] font-black uppercase tracking-[0.3em]">{p.has_website ? t('leads_web_infra') : t('leads_web_pending')}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 sm:px-12 py-6 sm:py-10">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-1.5 h-1.5 rounded-full ${getStatusColor(p.status).split(' ')[0].replace('text-', 'bg-')}`} />
                                                        <select
                                                            value={p.status || 'cold'}
                                                            onChange={(e) => handleStatusUpdate(p.id, e.target.value)}
                                                            className="bg-transparent text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-white/60 outline-none cursor-pointer hover:text-white transition-all appearance-none"
                                                        >
                                                            <option value="cold" className="bg-[#0a0a0a]">{t('leads_status_cold')}</option>
                                                            <option value="contacted" className="bg-[#0a0a0a]">{t('leads_status_contacted')}</option>
                                                            <option value="interested" className="bg-[#0a0a0a]">{t('leads_status_interested')}</option>
                                                            <option value="closed" className="bg-[#0a0a0a]">{t('leads_status_closed')}</option>
                                                            <option value="cancelled" className="bg-[#0a0a0a]">{t('leads_status_cancelled')}</option>
                                                        </select>
                                                    </div>
                                                </td>
                                                <td className="px-6 sm:px-12 py-6 sm:py-10 text-right">
                                                    <div className="flex items-center justify-end gap-2 sm:gap-3">
                                                        <motion.button
                                                            initial={{ opacity: 0, scale: 0.8 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            transition={{ delay: 0.1 }}
                                                            onClick={(e) => { e.stopPropagation(); setSelectedProspect(p); setShowWhatsApp(true); }}
                                                            title={t('leads_action_wa')}
                                                            className="p-3 rounded-xl bg-white/5 border border-white/10 text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-500/40 transition-all"
                                                        >
                                                            <MessageSquare className="w-4 h-4" />
                                                        </motion.button>

                                                        {p.status === 'closed' && (
                                                            <motion.button
                                                                initial={{ opacity: 0, scale: 0.8 }}
                                                                animate={{ opacity: 1, scale: 1 }}
                                                                onClick={(e) => { e.stopPropagation(); onOpenVault(p); }}
                                                                title={t('leads_action_vault')}
                                                                className="p-3 rounded-xl bg-white/5 border border-white/10 text-purple-400 hover:bg-purple-500/20 hover:border-purple-500/40 transition-all"
                                                            >
                                                                <LucideLock className="w-4 h-4" />
                                                            </motion.button>
                                                        )}

                                                        {p.status !== 'closed' && (
                                                            <motion.button
                                                                initial={{ opacity: 0, scale: 0.8 }}
                                                                animate={{ opacity: 1, scale: 1 }}
                                                                onClick={(e) => { e.stopPropagation(); onCloseDeal(p); }}
                                                                title={t('leads_action_close')}
                                                                className="p-3 rounded-xl bg-white/5 border border-white/10 text-green-400 hover:bg-green-500/20 hover:border-green-500/40 transition-all"
                                                            >
                                                                <CheckCircle2 className="w-4 h-4" />
                                                            </motion.button>
                                                        )}

                                                        <motion.button
                                                            initial={{ opacity: 0, scale: 0.8 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            onClick={(e) => { e.stopPropagation(); onEdit(p); }}
                                                            title={t('leads_action_edit')}
                                                            className="p-3 rounded-xl bg-white text-black hover:bg-cyan-400 hover:text-white transition-all shadow-xl"
                                                        >
                                                            <Edit2 className="w-4 h-4 font-black" />
                                                        </motion.button>

                                                        <motion.button
                                                            initial={{ opacity: 0, scale: 0.8 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }}
                                                            title={t('delete')}
                                                            className="p-2 sm:p-3 rounded-[0.5rem] sm:rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </motion.button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))
                                    )}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                </div>
            </SpotlightCard>

            <WhatsAppModal
                isOpen={showWhatsApp}
                onClose={() => setShowWhatsApp(false)}
                prospect={selectedProspect}
            />
        </div>
    );
};

export const WhatsAppModal = ({ isOpen, onClose, prospect }: { isOpen: boolean, onClose: () => void, prospect: any }) => {
    const { t, language } = useLanguage();
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [showProjects, setShowProjects] = useState(false);

    const handleSend = async () => {
        if (!message) return;
        setIsSending(true);
        await queueMessage(prospect.phone, message);
        setIsSending(false);
        onClose();
        alert(t('copy_success'));
    };

    const handleSelectProject = (project: Project) => {
        const content = project[language];
        const projectText = `
*${content.name.toUpperCase()}*
🚀 ${content.description}

💎 *PROPUESTA DE VALOR:*
${content.value_props.map(v => `• ${v}`).join('\n')}

📈 *RETORNO DE INVERSIÓN:*
${content.roi_metric}

🔗 *DEMO EN VIVO:*
${project.vercel_url}
`.trim();
        setMessage(projectText);
        setShowProjects(false);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-xl bg-[#0a0a0a] border border-white/10 rounded-3xl p-10 shadow-2xl">
                        <button onClick={onClose} className="absolute top-8 right-8 p-3 hover:bg-white/5 rounded-full transition-all text-white/20 hover:text-white">
                            <X className="w-5 h-5" />
                        </button>

                        <h3 className="text-xl font-serif mb-6 tracking-widest uppercase">{t('modal_whatsapp_title')} <span className="text-white/20 italic">{t('modal_whatsapp_accent')}</span></h3>
                        <p className="text-[10px] text-white/40 uppercase tracking-widest mb-8">{t('leads_table_channel')} : {prospect?.business_name || prospect?.name}</p>

                        {/* Selector de Proyectos & Multimedia */}
                        <div className="grid grid-cols-2 gap-3 mb-6">
                            <div className="relative">
                                <button
                                    onClick={() => setShowProjects(!showProjects)}
                                    className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-cyan-400 hover:bg-cyan-500/10 transition-all"
                                >
                                    <div className="flex items-center gap-2">
                                        <Briefcase className="w-3.5 h-3.5" />
                                        {t('modal_whatsapp_projects')}
                                    </div>
                                    <ChevronDown className={`w-3 h-3 transition-transform ${showProjects ? 'rotate-180' : ''}`} />
                                </button>

                                <AnimatePresence>
                                    {showProjects && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            className="absolute top-full left-0 w-full mt-2 bg-[#121212] border border-white/10 rounded-xl overflow-hidden shadow-2xl z-10"
                                        >
                                            {INITIAL_PROJECTS.map((project) => (
                                                <button
                                                    key={project.id}
                                                    onClick={() => handleSelectProject(project)}
                                                    className="w-full px-5 py-4 text-left text-[10px] text-white/60 hover:text-white hover:bg-white/5 border-b border-white/5 last:border-0 transition-all uppercase tracking-wider"
                                                >
                                                    {project[language].name}
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <button
                                onClick={() => { }} // Placeholder
                                className="h-12 px-4 bg-white/5 border border-white/10 rounded-xl flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-purple-400 hover:bg-purple-500/10 transition-all"
                            >
                                <Film className="w-3.5 h-3.5" />
                                {t('modal_whatsapp_multimedia')}
                            </button>
                        </div>

                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder={t('modal_whatsapp_placeholder')}
                            className="w-full h-52 bg-white/5 border border-white/10 rounded-2xl p-6 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-all resize-none font-serif leading-relaxed"
                        />

                        <button
                            onClick={handleSend}
                            disabled={isSending || !message}
                            className="w-full py-5 bg-white text-black text-[10px] font-black uppercase tracking-[0.4em] rounded-2xl mt-8 hover:shadow-[0_15px_30px_rgba(255,255,255,0.1)] transition-all disabled:opacity-50"
                        >
                            {isSending ? t('loading') : t('projects_deploy_btn')}
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
