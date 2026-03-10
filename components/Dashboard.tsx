"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Loader2, Bell, CheckCircle2 } from 'lucide-react';
import { SpotlightCard } from './SpotlightCard';
import { syncProspects, importLeads } from '@/lib/actions';
import { useLanguage } from './LanguageContext';

const NICHE_OPTIONS = [
    { labelKey: 'niche_health', value: 'clinica OR estetica OR odontologia OR psicologo OR consultorio' },
    { labelKey: 'niche_fitness', value: 'gimnasio OR crossfit OR pilates OR centro de entrenamiento' },
    { labelKey: 'niche_beauty', value: 'peluqueria OR barberia OR salon de belleza OR centro de uñas' },
    { labelKey: 'niche_pets', value: 'veterinaria OR clinica veterinaria OR peluqueria canina' },
    { labelKey: 'niche_pro', value: 'estudio juridico OR abogados OR estudio contable OR arquitectos' },
    { labelKey: 'niche_realestate', value: 'inmobiliaria OR bienes raices OR desarrollista' },
    { labelKey: 'niche_auto', value: 'detailing automotriz OR taller mecanico' },
];

export const Dashboard = ({ stats, onRefresh, notifications, onNavigate }: { stats: any, onRefresh: () => void, notifications: any[], onNavigate: (route: string) => void }) => {
    const { t } = useLanguage();
    const [isSyncing, setIsSyncing] = useState(false);
    const [selectedNiche, setSelectedNiche] = useState(NICHE_OPTIONS[0].value);
    const [syncLog, setSyncLog] = useState<{ msgKey?: string, msgStr?: string, type: 'info' | 'success' | 'error' | 'meta' }[]>([]);

    const handleSync = async () => {
        setIsSyncing(true);
        const nicheLabel = t(NICHE_OPTIONS.find(n => n.value === selectedNiche)?.labelKey || 'niche_health' as any);
        setSyncLog([{ msgKey: 'dash_sync_start', type: 'meta' }]);
        setSyncLog(prev => [...prev, { msgStr: `${t('dash_sync_objective')}: ${nicheLabel}`, type: 'meta' }]);

        try {
            const result = await syncProspects(selectedNiche) as any;
            if (result.success) {
                setSyncLog(prev => [
                    ...prev,
                    { msgStr: `${t('dash_sync_success')}: ${result.leadsAdded} ${t('dash_sync_entities')}`, type: 'success' }
                ]);
            } else {
                setSyncLog(prev => [...prev, { msgStr: `${t('dash_sync_alert')}: ${result.error}`, type: 'error' }]);
            }
            onRefresh();
        } catch (err) {
            setSyncLog(prev => [...prev, { msgStr: `${t('dash_sync_error')}: ${err}`, type: 'error' }]);
        } finally {
            setIsSyncing(false);
        }
    };

    const kpiData = [
        { label: t('dash_kpi_revenue'), value: stats?.projectedRevenue || '$0', trend: '+14% Mensual', route: '/analytics' },
        { label: t('dash_kpi_leads'), value: stats?.withoutWeb || '0', trend: 'Sincronizado', route: '/prospects' },
        { label: t('dash_kpi_conversion'), value: stats?.conversionRate || '0%', trend: '+3.2%', route: '/analytics' },
        { label: t('dash_kpi_reach'), value: stats?.messagesSent || '0', trend: 'Activo', route: '/analytics' },
    ];

    return (
        <div className="space-y-8 lg:space-y-16 animate-in fade-in duration-500">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 lg:gap-10">
                <div className="space-y-4">
                    <h1 className="text-3xl lg:text-5xl font-sans font-black tracking-[0.2em] text-white uppercase">{t('dash_title')}</h1>
                    <p className="text-[10px] text-white/50 uppercase tracking-[0.5em] font-black">{t('dash_subtitle')}</p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
                    <select
                        value={selectedNiche}
                        onChange={(e) => setSelectedNiche(e.target.value)}
                        className="w-full sm:w-[300px] px-8 py-4 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-white/80 focus:outline-none focus:border-cyan-500/50 transition-all cursor-pointer appearance-none"
                    >
                        {NICHE_OPTIONS.map((n, i) => (
                            <option key={i} value={n.value} className="bg-[#0a0a0a] text-white">{t(n.labelKey as any)}</option>
                        ))}
                    </select>
                    <button
                        onClick={handleSync}
                        disabled={isSyncing}
                        className="w-full sm:w-auto px-10 py-4 bg-white text-black text-[11px] font-black uppercase tracking-[0.4em] rounded-full hover:shadow-[0_20px_40px_rgba(255,255,255,0.2)] transition-all flex items-center justify-center gap-4 disabled:opacity-50"
                    >
                        {isSyncing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                        {isSyncing ? t('dash_sync_status') : t('dash_sync_btn')}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpiData.map((kpi, i) => (
                    <SpotlightCard
                        key={i}
                        delay={i * 0.05}
                        className="p-10 group cursor-pointer hover:bg-white/[0.03] transition-colors"
                        onClick={() => onNavigate(kpi.route)}
                    >
                        <div className="space-y-10 relative z-10">
                            <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/40 group-hover:text-cyan-500/70 transition-colors">{kpi.label}</p>
                            <div className="space-y-3">
                                <p className="text-4xl font-serif font-light text-white/90 group-hover:text-white transition-colors">{kpi.value}</p>
                                <div className="flex items-center gap-3">
                                    <div className="h-0.5 w-4 bg-white/20 group-hover:w-8 transition-all duration-500" />
                                    <span className="text-[9px] font-black text-white/40 uppercase tracking-widest font-bold group-hover:text-white/80">{kpi.trend}</span>
                                </div>
                            </div>
                        </div>
                    </SpotlightCard>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2">
                    <SpotlightCard className="p-10 min-h-[500px] flex flex-col group border-cyan-500/5">
                        <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-2.5 h-2.5 rounded-full bg-cyan-500 shadow-[0_0_15px_rgba(34,211,238,0.6)] animate-pulse" />
                                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/60">{t('dash_terminal_title')}</h3>
                            </div>
                            <div className="px-5 py-2 hover:bg-white/5 rounded-full text-[9px] font-mono text-white/30 tracking-widest uppercase cursor-default transition-colors">
                                Outscraper Engine Active
                            </div>
                        </div>

                        <div className="flex-1 bg-black/60 rounded-2xl p-8 font-mono text-[11px] leading-relaxed overflow-y-auto custom-scrollbar border border-white/5 shadow-inner">
                            {syncLog.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center opacity-20 py-20">
                                    <Sparkles className="w-12 h-12 mb-6" />
                                    <p className="tracking-[0.3em] font-black uppercase text-[10px]">{t('dash_waiting_sync')}</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {syncLog.map((log, i) => (
                                        <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex gap-4">
                                            <span className="text-white/20 shrink-0 select-none">[{i + 1}]</span>
                                            <span className={log.type === 'success' ? 'text-cyan-400' : log.type === 'error' ? 'text-red-400' : log.type === 'meta' ? 'text-purple-400 font-bold' : 'text-white/60'}>
                                                {log.msgKey ? t(log.msgKey as any) : log.msgStr}
                                            </span>
                                        </motion.div>
                                    ))}
                                    {isSyncing && (
                                        <div className="flex items-center gap-4 text-cyan-500/60 animate-pulse">
                                            <span className="text-white/10 shrink-0">[*]</span>
                                            <span>{t('dash_syncing_network')}</span>
                                            <Loader2 className="w-3 h-3 animate-spin" />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="mt-8 grid grid-cols-2 gap-6">
                            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                                <p className="text-[8px] text-white/20 uppercase tracking-widest font-black mb-2">{t('dash_geo_target')}</p>
                                <p className="text-[11px] text-white/60 font-serif italic tracking-wider">{t('dash_geo_value')}</p>
                            </div>
                            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                                <p className="text-[8px] text-white/20 uppercase tracking-widest font-black mb-2">{t('dash_capacity')}</p>
                                <p className="text-[11px] text-white/60 font-serif italic tracking-wider">{t('dash_capacity_value')}</p>
                            </div>
                        </div>
                    </SpotlightCard>
                </div>

                <SpotlightCard className="p-10 border-cyan-500/5">
                    <div className="space-y-10 h-full flex flex-col">
                        <div className="flex items-center justify-between">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/60">{t('dash_billing_title')}</h3>
                            <Bell className="w-4 h-4 text-white/20" />
                        </div>

                        <div className="flex-1 space-y-4 overflow-y-auto custom-scrollbar pr-2 min-h-[400px]">
                            {notifications.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
                                    <CheckCircle2 className="w-12 h-12 mb-6" />
                                    <p className="tracking-[0.3em] font-black uppercase text-[10px]">{t('dash_no_alerts')}</p>
                                </div>
                            ) : (
                                notifications.map((n, i) => (
                                    <motion.div key={i} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-all group">
                                        <div className="flex gap-4">
                                            <div className={`mt-1 shrink-0 w-1.5 h-1.5 rounded-full ${n.type === 'billing' ? 'bg-green-500' : 'bg-cyan-500'} shadow-[0_0_8px_currentColor]`} />
                                            <div className="space-y-2 text-left">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-white/90">
                                                    {n.type === 'billing' ? t('notif_billing') : t('notif_security')}
                                                </p>
                                                <p className="text-[11px] font-serif italic text-white/60 leading-relaxed">
                                                    {n.type === 'billing' ? t('notif_billing_msg') : t('notif_security_msg')}
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </div>
                </SpotlightCard>
            </div>
        </div>
    );
};
