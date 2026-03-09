"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, MessageSquare, Trash2, Edit3, Loader2, Sparkles, X, Copy, CheckCircle2 } from 'lucide-react';
import { EliteLayout } from '@/components/EliteLayout';
import { SpotlightCard } from '@/components/SpotlightCard';
import { getTemplates, createTemplate, deleteTemplate, updateTemplate } from '@/lib/actions';

export default function TemplatesPage() {
    const [templates, setTemplates] = useState<any[]>([]);
    const [isFetching, setIsFetching] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
    const [formData, setFormData] = useState({ title: '', content: '' });
    const [isSaving, setIsSaving] = useState(false);

    const fetchTemplates = async () => {
        setIsFetching(true);
        const data = await getTemplates();
        setTemplates(data);
        setIsFetching(false);
    };

    useEffect(() => {
        fetchTemplates();
    }, []);

    const handleOpenModal = (template?: any) => {
        if (template) {
            setSelectedTemplate(template);
            setFormData({ title: template.title, content: template.content });
        } else {
            setSelectedTemplate(null);
            setFormData({ title: '', content: '' });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        if (selectedTemplate) {
            await updateTemplate(selectedTemplate.id, formData.title, formData.content);
        } else {
            await createTemplate(formData.title, formData.content);
        }
        await fetchTemplates();
        setShowModal(false);
        setIsSaving(false);
    };

    const handleDelete = async (id: string) => {
        if (confirm('¿Eliminar esta pieza de copywriting?')) {
            await deleteTemplate(id);
            await fetchTemplates();
        }
    };

    return (
        <EliteLayout>
            <div className="max-w-[1400px] mx-auto px-8 py-16 space-y-16 animate-in fade-in duration-1000">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
                    <div className="space-y-4">
                        <h1 className="text-5xl font-sans font-black tracking-[0.2em] text-white/95 uppercase">Copywriting <span className="text-white/20 italic">Hub</span></h1>
                        <p className="text-[10px] text-white/40 uppercase tracking-[0.5em] font-black">Gestión de Narrativa Estratégica.</p>
                    </div>
                    <button
                        onClick={() => handleOpenModal()}
                        className="px-10 py-6 bg-white text-black text-[11px] font-black uppercase tracking-[0.4em] rounded-3xl hover:shadow-[0_20px_40px_rgba(255,255,255,0.2)] transition-all flex items-center gap-4"
                    >
                        <Plus className="w-5 h-5" /> Nueva Pieza
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {isFetching ? (
                        Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="h-64 rounded-3xl bg-white/[0.02] border border-white/5 animate-pulse" />
                        ))
                    ) : templates.length === 0 ? (
                        <div className="col-span-full py-32 text-center opacity-20">
                            <MessageSquare className="w-16 h-16 mx-auto mb-6" />
                            <p className="tracking-[0.5em] font-black uppercase text-[10px]">Sin piezas de copia registradas.</p>
                        </div>
                    ) : (
                        templates.map((t, i) => (
                            <SpotlightCard key={t.id} delay={i * 0.1} className="p-10 flex flex-col h-full group">
                                <div className="flex justify-between items-start mb-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
                                        <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-white/80">{t.title}</h3>
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                        <button onClick={() => handleOpenModal(t)} className="p-3 bg-white/5 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-colors"><Edit3 className="w-3.5 h-3.5" /></button>
                                        <button onClick={() => handleDelete(t.id)} className="p-3 bg-white/5 rounded-full hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-serif italic text-white/40 leading-relaxed line-clamp-6">{t.content}</p>
                                </div>
                                <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-between">
                                    <span className="text-[8px] font-black text-white/10 uppercase tracking-widest">{t.content.length} Caracteres</span>
                                    <button
                                        onClick={() => { navigator.clipboard.writeText(t.content); alert('Copiado al portapapeles'); }}
                                        className="text-[9px] font-black uppercase tracking-widest text-cyan-500/40 hover:text-cyan-400 transition-colors flex items-center gap-2"
                                    >
                                        <Copy className="w-3 h-3" /> Copiar
                                    </button>
                                </div>
                            </SpotlightCard>
                        ))
                    )}
                </div>
            </div>

            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
                        <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] p-12 overflow-hidden shadow-2xl">
                            <div className="flex justify-between items-center mb-10">
                                <div>
                                    <h3 className="text-2xl font-serif font-light tracking-[0.1em] uppercase text-white/90">{selectedTemplate ? 'Editar' : 'Nueva'} <span className="text-white/20 italic">Pieza</span></h3>
                                    <p className="text-[10px] text-white/30 uppercase tracking-[0.4em] font-black mt-2">Elite Sales Copywriting Engine</p>
                                </div>
                                <button onClick={() => setShowModal(false)} className="p-4 bg-white/5 rounded-full hover:bg-white/10 text-white/20 hover:text-white transition-all"><X className="w-5 h-5" /></button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="space-y-4">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-white/20 ml-2">Título de Referencia</label>
                                    <input
                                        required
                                        placeholder="Ej: Pitch Inicial - Clínicas Premium"
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-lg font-serif text-white/90 placeholder-white/5 focus:outline-none focus:border-cyan-500/50 transition-all"
                                    />
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-white/20 ml-2">Contenido Estratégico</label>
                                    <textarea
                                        required
                                        placeholder="Escribe el cuerpo del mensaje..."
                                        value={formData.content}
                                        onChange={e => setFormData({ ...formData, content: e.target.value })}
                                        className="w-full h-64 bg-white/5 border border-white/10 rounded-2xl p-6 text-base font-serif italic text-white/80 placeholder-white/5 focus:outline-none focus:border-cyan-500/50 transition-all resize-none custom-scrollbar"
                                    />
                                    <p className="text-[8px] text-white/10 uppercase tracking-widest text-right">Tip: Usa variables como {`{nombre}`} o {`{negocio}`} para personalización.</p>
                                </div>

                                <button disabled={isSaving} className="w-full py-6 bg-white text-black text-[11px] font-black uppercase tracking-[0.5em] rounded-3xl hover:shadow-[0_20px_40px_rgba(255,255,255,0.2)] transition-all flex items-center justify-center gap-4">
                                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                                    {selectedTemplate ? 'Actualizar Copia' : 'Sellar Nueva Pieza'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </EliteLayout>
    );
}
