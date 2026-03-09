"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Briefcase,
    ExternalLink,
    TrendingUp,
    Zap,
    DollarSign,
    Shield,
    Rocket,
    Edit3,
    Trash2,
    Plus,
    X,
    Save,
    ChevronRight,
    Search,
    Globe,
    Code2,
    CheckCircle2,
    Target
} from 'lucide-react';
import { EliteLayout } from '@/components/EliteLayout';
import { useLanguage } from '@/components/LanguageContext';
import { SectionHeader } from '@/components/SectionHeader';
import { SpotlightCard } from '@/components/SpotlightCard';

import { Project, INITIAL_PROJECTS } from '@/lib/projects';
import { getProjectsDB, upsertProject, deleteProjectDB } from '@/lib/actions';


export default function ProjectsPage() {
    const { language, t } = useLanguage();
    const [projects, setProjects] = useState<Project[]>([]);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchProjects = async () => {
        setIsLoading(true);
        const dbProjects = await getProjectsDB();
        if (dbProjects && dbProjects.length > 0) {
            setProjects(dbProjects as any as Project[]);
        } else {
            // Si la DB está vacía, usar los iniciales pero NO guardarlos automáticamente
            // para evitar duplicados en el primer render si hay lentitud
            setProjects(INITIAL_PROJECTS);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const filteredProjects = projects.filter(p => {
        const content = language === 'en' ? p.en : p.es;
        return content.name.toLowerCase().includes(search.toLowerCase()) ||
            content.niche.toLowerCase().includes(search.toLowerCase());
    });

    const handleEdit = (project: Project) => {
        setEditingProject(JSON.parse(JSON.stringify(project))); // Deep clone
        setIsModalOpen(true);
    };

    const handleAddNew = () => {
        const newProject: Project = {
            id: Date.now().toString(),
            es: { name: '', description: '', value_props: ['', '', ''], niche: '', roi_metric: '' },
            en: { name: '', description: '', value_props: ['', '', ''], niche: '', roi_metric: '' },
            vercel_url: 'https://',
            doc_url: 'https://github.com/',
            estimated_price: '0'
        };
        setEditingProject(newProject);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (confirm(t('delete_confirm') || 'Are you sure?')) {
            const res = await deleteProjectDB(id);
            if (res.success) {
                setProjects(projects.filter(p => p.id !== id));
            }
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (editingProject) {
            const res = await upsertProject(editingProject.id, {
                es: editingProject.es,
                en: editingProject.en,
                vercel_url: editingProject.vercel_url,
                doc_url: editingProject.doc_url,
                estimated_price: editingProject.estimated_price
            });

            if (res.success) {
                const exists = projects.find(p => p.id === editingProject.id);
                if (exists) {
                    setProjects(projects.map(p => p.id === editingProject.id ? editingProject : p));
                } else {
                    setProjects([editingProject, ...projects]);
                }
                setIsModalOpen(false);
                setEditingProject(null);
            } else {
                alert("Error saving project to database");
            }
        }
    };

    return (
        <EliteLayout onSearch={setSearch}>
            <div className="max-w-[1600px] mx-auto space-y-12 lg:space-y-20 animate-in fade-in slide-in-from-bottom-5 duration-500 px-4 lg:px-0 pt-16">
                <SectionHeader
                    icon={Briefcase}
                    label={t('projects_title_main')}
                    title={t('projects_title_main')}
                    accent={t('projects_title_accent')}
                    subtitle={t('projects_subtitle')}
                    rightElement={
                        <div className="flex flex-col sm:flex-row items-center gap-4 lg:gap-8 w-full sm:w-auto">
                            <div className="w-full sm:w-auto px-6 sm:px-10 py-4 sm:py-6 bg-white/[0.03] border border-white/5 rounded-2xl sm:rounded-[2rem] backdrop-blur-3xl flex items-center gap-4 sm:gap-6">
                                <Rocket className="w-5 h-5 text-white/20" />
                                <div className="text-left">
                                    <p className="text-2xl sm:text-3xl font-serif text-white leading-none">{projects.length}</p>
                                    <p className="text-[8px] sm:text-[10px] text-white/20 uppercase tracking-[0.3em] font-black mt-1 sm:mt-2">{t('projects_listed')}</p>
                                </div>
                            </div>
                            <button
                                onClick={handleAddNew}
                                className="w-full sm:w-auto h-16 sm:h-20 px-8 sm:px-10 bg-white text-black rounded-2xl sm:rounded-[2rem] hover:scale-105 transition-all shadow-xl shadow-white/5 flex items-center justify-center gap-4 group"
                            >
                                <Plus className="w-5 sm:w-6 h-5 sm:h-6 group-hover:rotate-90 transition-transform duration-300" />
                                <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em]">{t('projects_new_asset')}</span>
                            </button>
                        </div>
                    }
                />

                {/* Projects Grid - Balanced Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-4">
                    {filteredProjects.map((p, i) => {
                        const content = language === 'en' ? p.en : p.es;
                        return (
                            <SpotlightCard
                                key={p.id}
                                delay={i * 0.03}
                                className="h-full flex flex-col group"
                            >
                                <div className="flex flex-col h-full">
                                    {/* Header del Proyecto */}
                                    <div className="p-6 sm:p-8 pb-0 space-y-3 sm:space-y-4">
                                        <div className="flex justify-between items-start">
                                            <div className="flex gap-2">
                                                <div className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-full">
                                                    <p className="text-[7px] sm:text-[8px] font-black uppercase tracking-widest text-white/40">{content.niche}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-1.5">
                                                <button onClick={() => handleEdit(p)} className="p-2 sm:p-2.5 bg-white/5 rounded-lg hover:bg-white/10 text-white/20 hover:text-white transition-all"><Edit3 className="w-3.5 h-3.5" /></button>
                                                <button onClick={() => handleDelete(p.id)} className="p-2 sm:p-2.5 bg-white/5 rounded-lg hover:bg-red-500/20 text-white/20 hover:text-red-400 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                                            </div>
                                        </div>

                                        <h3 className="text-xl sm:text-2xl font-serif font-light tracking-wide text-white group-hover:text-cyan-400 transition-colors duration-300 uppercase">
                                            {content.name}
                                        </h3>

                                        <p className="text-[13px] sm:text-sm font-serif italic text-white/30 leading-snug line-clamp-2">
                                            {content.description}
                                        </p>
                                    </div>

                                    {/* Value Props & Metrics */}
                                    <div className="flex-1 p-6 sm:p-8 space-y-6 sm:space-y-8">
                                        <div className="space-y-3 sm:space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-[1px] w-4 bg-cyan-500/20" />
                                                <p className="text-[7px] sm:text-[8px] font-black uppercase tracking-[0.4em] text-cyan-500/40">{t('projects_value_prop')}</p>
                                            </div>
                                            <div className="space-y-2.5">
                                                {content.value_props.slice(0, 3).map((v, idx) => (
                                                    <div key={idx} className="flex gap-3 items-start group/item">
                                                        <CheckCircle2 className="w-4 h-4 text-cyan-500/20 mt-0.5 shrink-0 group-hover/item:text-cyan-400 transition-colors" />
                                                        <p className="text-[11px] sm:text-xs text-white/50 font-serif leading-tight line-clamp-1">{v}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                            <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 space-y-2 group/metric">
                                                <p className="text-[7px] sm:text-[8px] text-white/10 uppercase tracking-widest font-black">{t('projects_yield')}</p>
                                                <div className="flex items-center gap-2">
                                                    <TrendingUp className="w-3.5 h-3.5 text-cyan-500/40" />
                                                    <p className="text-xs sm:text-sm text-white/80 font-black uppercase tracking-tighter">{content.roi_metric}</p>
                                                </div>
                                            </div>
                                            <div className="p-4 rounded-xl bg-cyan-500/[0.01] border border-cyan-500/5 space-y-2 group/price">
                                                <p className="text-[7px] sm:text-[8px] text-cyan-500/20 uppercase tracking-widest font-black">{t('projects_price_point')}</p>
                                                <div className="flex items-center gap-2">
                                                    <DollarSign className="w-3.5 h-3.5 text-cyan-400/40" />
                                                    <p className="text-xs sm:text-sm text-cyan-400 font-black uppercase tracking-tighter shrink-0">{p.estimated_price}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="p-6 sm:p-8 pt-0 flex gap-2.5 mt-auto">
                                        <a
                                            href={p.vercel_url}
                                            target="_blank"
                                            className="flex-1 h-12 bg-white text-black text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] rounded-xl flex items-center justify-center gap-2.5 hover:bg-cyan-400 hover:text-black transition-all duration-300"
                                        >
                                            <Globe className="w-4 h-4" /> {t('projects_live_demo')}
                                        </a>
                                        <a
                                            href={p.doc_url}
                                            target="_blank"
                                            className="w-12 h-12 border border-white/5 hover:bg-white/5 text-white/20 hover:text-white transition-all rounded-xl flex items-center justify-center group/btn"
                                        >
                                            <Code2 className="w-4.5 h-4.5" />
                                        </a>
                                    </div>
                                </div>
                            </SpotlightCard>
                        );
                    })}
                </div>
            </div >

            {/* Modal de Edición - Bigger and Bilingual */}
            {/* Modal de Edición - Bigger and Bilingual */}
            <AnimatePresence>
                {
                    isModalOpen && editingProject && (
                        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 sm:p-6 bg-black/95 backdrop-blur-3xl">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="w-full max-w-4xl bg-[#0a0a0a] border border-white/10 rounded-[2rem] sm:rounded-[3rem] p-8 sm:p-16 overflow-y-auto max-h-[95vh] shadow-[0_0_100px_rgba(0,0,0,0.5)] space-y-8 sm:space-y-12 relative"
                            >
                                <button onClick={() => setIsModalOpen(false)} className="absolute top-6 sm:top-12 right-6 sm:right-12 p-3 sm:p-5 bg-white/5 rounded-full hover:bg-white/10 text-white/40 transition-all z-10">
                                    <X className="w-5 sm:w-6 h-5 sm:h-6" />
                                </button>

                                <div className="text-center space-y-3 sm:space-y-4 pt-4 sm:pt-0">
                                    <h2 className="text-3xl sm:text-5xl font-serif tracking-widest uppercase text-white/90">
                                        {projects.find(p => p.id === editingProject.id) ? t('edit') : t('projects_new_asset')} <span className="text-white/20 italic">Asset</span>
                                    </h2>
                                    <p className="text-[9px] sm:text-[10px] text-cyan-500 uppercase tracking-[0.4em] font-black">{t('projects_sync_value')}</p>
                                </div>

                                <form onSubmit={handleSave} className="space-y-8 sm:space-y-12">
                                    {/* Localized Content Section */}
                                    <div className="p-6 sm:p-10 rounded-2xl sm:rounded-[2.5rem] bg-white/[0.02] border border-white/5 space-y-6 sm:space-y-8">
                                        <div className="flex items-center gap-4 mb-2 sm:mb-4">
                                            <Globe className="w-4 sm:w-5 h-4 sm:h-5 text-cyan-400" />
                                            <h3 className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-white/80">{language === 'es' ? 'Contenido' : 'Content'} ({language.toUpperCase()})</h3>
                                        </div>

                                        <div className="space-y-3 sm:space-y-4">
                                            <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-white/20 ml-2">{t('projects_name_label')}</label>
                                            <input
                                                className="w-full bg-black border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-xl sm:text-2xl font-serif text-white outline-none focus:border-cyan-500 transition-all"
                                                value={editingProject[language].name}
                                                onChange={e => setEditingProject({
                                                    ...editingProject,
                                                    [language]: { ...editingProject[language], name: e.target.value }
                                                })}
                                            />
                                        </div>

                                        <div className="space-y-3 sm:space-y-4">
                                            <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-white/20 ml-2">{t('projects_desc_label')}</label>
                                            <textarea
                                                rows={3}
                                                className="w-full bg-black border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-base sm:text-lg font-serif italic text-white/60 outline-none focus:border-cyan-500 transition-all resize-none leading-relaxed"
                                                value={editingProject[language].description}
                                                onChange={e => setEditingProject({
                                                    ...editingProject,
                                                    [language]: { ...editingProject[language], description: e.target.value }
                                                })}
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                                            <div className="space-y-3 sm:space-y-4">
                                                <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-white/20 ml-2">{t('projects_niche_label')}</label>
                                                <input
                                                    className="w-full bg-black border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-[9px] sm:text-xs uppercase font-black text-white/60 outline-none focus:border-cyan-500 transition-all"
                                                    value={editingProject[language].niche}
                                                    onChange={e => setEditingProject({
                                                        ...editingProject,
                                                        [language]: { ...editingProject[language], niche: e.target.value }
                                                    })}
                                                />
                                            </div>
                                            <div className="space-y-3 sm:space-y-4">
                                                <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-white/20 ml-2">{t('projects_yield')}</label>
                                                <input
                                                    className="w-full bg-black border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-lg sm:text-xl font-serif text-white outline-none focus:border-cyan-500 transition-all"
                                                    value={editingProject[language].roi_metric}
                                                    onChange={e => setEditingProject({
                                                        ...editingProject,
                                                        [language]: { ...editingProject[language], roi_metric: e.target.value }
                                                    })}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Global Data */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10 px-2 sm:px-4">
                                        <div className="space-y-3 sm:space-y-4">
                                            <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-white/20 ml-2">{t('projects_price_label')}</label>
                                            <div className="relative">
                                                < DollarSign className="absolute left-5 sm:left-6 top-1/2 -translate-y-1/2 w-4 sm:w-5 h-4 sm:h-5 text-cyan-500" />
                                                <input
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 pl-12 sm:pl-14 text-lg sm:text-xl font-sans font-black text-cyan-500 outline-none focus:border-cyan-500 transition-all"
                                                    value={editingProject.estimated_price}
                                                    onChange={e => setEditingProject({ ...editingProject, estimated_price: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-3 sm:space-y-4">
                                            <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-white/20 ml-2">{language === 'es' ? 'Despliegue' : 'Deployment'}</label>
                                            <div className="relative">
                                                <Globe className="absolute left-5 sm:left-6 top-1/2 -translate-y-1/2 w-4 sm:w-5 h-4 sm:h-5 text-white/20" />
                                                <input
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 pl-12 sm:pl-14 text-xs sm:text-sm font-light text-white/60 outline-none focus:border-cyan-500 transition-all"
                                                    value={editingProject.vercel_url}
                                                    onChange={e => setEditingProject({ ...editingProject, vercel_url: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <button type="submit" className="w-full h-20 sm:h-24 bg-white text-black text-[11px] sm:text-[13px] font-black uppercase tracking-[0.4em] sm:tracking-[0.6em] rounded-2xl sm:rounded-[2.5rem] hover:shadow-[0_20px_60px_rgba(255,255,255,0.25)] hover:-translate-y-1 transition-all flex items-center justify-center gap-4 sm:gap-6">
                                        <Save className="w-5 sm:w-6 h-5 sm:h-6" /> {t('projects_save')}
                                    </button>
                                </form>
                            </motion.div>
                        </div>
                    )
                }
            </AnimatePresence >
        </EliteLayout >
    );
}

