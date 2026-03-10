"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    MessageSquare,
    Trash2,
    Edit3,
    Loader2,
    Sparkles,
    X,
    Copy,
    ChevronDown,
    Wand2,
    CheckCircle2,
    BookOpen
} from 'lucide-react';
import { EliteLayout } from '@/components/EliteLayout';
import { SpotlightCard } from '@/components/SpotlightCard';
import { getTemplates, createTemplate, deleteTemplate, updateTemplate } from '@/lib/actions';
import { useLanguage } from '@/components/LanguageContext';
import { SectionHeader } from '@/components/SectionHeader';

const PRESET_TEMPLATES: Record<string, Record<string, { stage: string, title: string, content: string }[]>> = {
    es: {
        'Salud y Estética (Clínicas)': [
            { stage: 'Primer Contacto', title: 'Pitch de Innovación Estética', content: 'Hola {nombre}, he seguido la trayectoria de {negocio} y me impresiona su enfoque. Ayudamos a clínicas a automatizar la agenda y aumentar las consultas premium mediante IA. ¿Tendría sentido charlar 5 min?' },
            { stage: 'Seguimiento', title: 'Valor Agregado - Casos de Éxito', content: 'Hola {nombre}, te comparto cómo ayudamos a otro centro similar a {negocio} a reducir el ausentismo en un 30%. Creo que podríamos replicar esto con ustedes.' },
            { stage: 'Interés', title: 'Propuesta Personalizada', content: 'Diseñamos una estrategia específica para {negocio}. Adjunto los puntos clave para optimizar su embudo de ventas actual.' },
            { stage: 'Cierre', title: 'Apertura de Expansión', content: 'Todo listo para comenzar la transformación en {negocio}. ¿Confirmamos el horario de la reunión de implementación?' },
            { stage: 'Bienvenida', title: 'Onboarding Platinum', content: '¡Bienvenido a la familia Elite, {nombre}! Es un honor potenciar la visión de {negocio}.' }
        ],
        'Fitness y Deportes (Gimnasios)': [
            { stage: 'Primer Contacto', title: 'Retención de Membresías', content: 'Hola {nombre}, vi que {negocio} es referencia en el sector. Tenemos una solución para automatizar el seguimiento de socios y reducir bajas. ¿Te interesa conocer más?' },
            { stage: 'Seguimiento', title: 'Optimización de Leads', content: 'Hola {nombre}, te escribo brevemente porque noté que muchos gimnasios pierden el 40% de leads por falta de respuesta rápida. En {negocio} podemos solucionarlo.' },
            { stage: 'Interés', title: 'Demo de Automatización', content: 'Tengo lista la demo de cómo el bot manejaría las consultas de {negocio}. Mira estos resultados.' },
            { stage: 'Cierre', title: 'Contrato Firme', content: 'Hagamos que {negocio} sea el centro más tech de la zona. ¿Cerramos los detalles hoy?' },
            { stage: 'Bienvenida', title: 'Protocolo de Inicio', content: 'Hola {nombre}, activamos el protocolo de alta para {negocio}. ¡A por esos objetivos!' }
        ],
        'Belleza y Cuidado (Salones)': [
            { stage: 'Primer Contacto', title: 'Agenda Full-Time', content: 'Hola {nombre}, admiro el estilo de {negocio}. Implementamos sistemas de reserva inteligentes que llenan huecos vacíos automáticamente. ¿Charlamos?' },
            { stage: 'Seguimiento', title: 'Re-engagement de Clientes', content: 'Muchos clientes de {negocio} no vuelven por falta de recordatorios. Nuestra IA se encarga de que siempre tengan su próxima cita.' },
            { stage: 'Interés', title: 'Simulación de Ingresos', content: 'Hice un cálculo de cuánto más podría facturar {negocio} con nuestro sistema de re-compra automática.' },
            { stage: 'Cierre', title: 'Alianza Estratégica', content: 'Un placer formalizar esta alianza con {negocio}. El éxito está asegurado.' },
            { stage: 'Bienvenida', title: 'Estreno de Plataforma', content: '¡Felicidades {nombre}! Mañana empezamos a transformar {negocio}.' }
        ],
        'Mascotas y Veterinaria': [
            { stage: 'Primer Contacto', title: 'Cuidado y Eficiencia', content: 'Hola {nombre}, en {negocio} cuidan lo más valioso. Nosotros cuidamos su tiempo automatizando fichas médicas y recordatorios. ¿Te lo cuento?' },
            { stage: 'Seguimiento', title: 'Prevención de Olvidos', content: 'El seguimiento de vacunas en {negocio} puede ser 100% automático. Evita que tus clientes se olviden de sus citas.' },
            { stage: 'Interés', title: 'Diseño de Workflow', content: 'Armamos este flujo de trabajo para {negocio}. Pura eficiencia para el cuidado animal.' },
            { stage: 'Cierre', title: 'Acuerdo de Servicio', content: 'Damos el paso final para {negocio}. ¿Fijamos el lanzamiento para la próxima semana?' },
            { stage: 'Bienvenida', title: 'Eco-System Pet', content: 'Bienvenidos al ecosistema Elite. {negocio} ahora es una clínica del futuro.' }
        ],
        'Servicios Profesionales': [
            { stage: 'Primer Contacto', title: 'Escalabilidad B2B', content: 'Hola {nombre}, sigo de cerca el crecimiento de {negocio}. Ayudamos a firmas profesionales a calificar sus leads automáticamente. ¿Hablamos?' },
            { stage: 'Seguimiento', title: 'Ahorro de Horas Hombre', content: 'Noté que el equipo de {negocio} invierte mucho tiempo en tareas manuales. Nuestra solución les devuelve 10h semanales.' },
            { stage: 'Interés', title: 'Blueprint Operativo', content: 'Aquí tienes el mapa de cómo escalaremos las operaciones de {negocio} sin contratar más personal.' },
            { stage: 'Cierre', title: 'Firma de Acuerdo', content: 'Socio, el contrato de {negocio} está listo para ser sellado. ¿Avanzamos?' },
            { stage: 'Bienvenida', title: 'Socio Estratégico', content: 'Un honor contar con {negocio} entre nuestros socios autorizados.' }
        ],
        'Real Estate / Inmobiliarias': [
            { stage: 'Primer Contacto', title: 'Captación de Propiedades', content: 'Hola {nombre}, vi las propiedades de {negocio}. Tenemos un motor de captura de leads que filtra interesados reales. ¿Buscamos una reunión?' },
            { stage: 'Seguimiento', title: 'Calificación de Prospectos', content: 'Sabemos que en {negocio} pierden tiempo con curiosos. Nuestra IA califica y solo te pasa los tratos serios.' },
            { stage: 'Interés', title: 'Pipeline Inmobiliario', content: 'Este es el pipeline que diseñé para las próximas ventas de {negocio}.' },
            { stage: 'Cierre', title: 'Escritura de Alianza', content: 'Listos para el cierre más importante del año para {negocio}. ¿Firmamos?' },
            { stage: 'Bienvenida', title: 'Keys of Success', content: '¡Bienvenido {nombre}! Aquí tienes las llaves para el éxito de {negocio}.' }
        ],
        'Automotriz Premium': [
            { stage: 'Primer Contacto', title: 'Test Drive Digital', content: 'Hola {nombre}, el stock de {negocio} es de alta gama. Nuestra IA hace el "Test Drive" digital resolviendo dudas 24/7. ¿Te interesa?' },
            { stage: 'Seguimiento', title: 'Venta Consultiva', content: 'Seguimos con el interés en los vehículos de {negocio}. Podemos automatizar el envío de catálogos dinámicos.' },
            { stage: 'Interés', title: 'Análisis de Conversión', content: 'Echa un vistazo a cómo incrementamos las visitas al showroom de {negocio}.' },
            { stage: 'Cierre', title: 'Traspaso de Mando', content: 'El trato está cerrado para {negocio}. ¿Iniciamos la integración hoy?' },
            { stage: 'Bienvenida', title: 'High Octane Welcome', content: 'Aceleramos juntos, {nombre}. Bienvenidos al estándar de oro con {negocio}.' }
        ]
    },
    en: {
        'Health & Aesthetics (Clinics)': [
            { stage: 'First Contact', title: 'Aesthetic Innovation Pitch', content: 'Hi {name}, I have been following {business} and I am impressed with your approach. We help clinics automate their schedule and increase premium consultations through AI. Would a 5-min talk make sense?' },
            { stage: 'Follow-up', title: 'Added Value - Success Stories', content: 'Hi {name}, I want to share how we helped a center similar to {business} reduce no-shows by 30%. I believe we could replicate this for you.' },
            { stage: 'Interest', title: 'Personalized Proposal', content: 'We designed a specific strategy for {business}. Attached are the key points to optimize your current sales funnel.' },
            { stage: 'Closing', title: 'Expansion Opening', content: 'Everything is ready to start the transformation at {business}. Shall we confirm the time for the implementation meeting?' },
            { stage: 'Welcome', title: 'Platinum Onboarding', content: 'Welcome to the Elite family, {name}! It is an honor to enhance the vision of {business}.' }
        ],
        'Fitness & Sports (Gyms)': [
            { stage: 'First Contact', title: 'Membership Retention', content: 'Hi {name}, I saw that {business} is a reference in the sector. We have a solution to automate member follow-up and reduce churn. Interested in learning more?' },
            { stage: 'Follow-up', title: 'Lead Optimization', content: 'Hi {name}, I am writing briefly because I noticed many gyms lose 40% of leads due to slow response. At {business} we can fix this.' },
            { stage: 'Interest', title: 'Automation Demo', content: 'I have the demo ready on how the bot would handle inquiries for {business}. Check out these results.' },
            { stage: 'Closing', title: 'Firm Contract', content: 'Let\'s make {business} the most tech-forward center in the area. Shall we close the details today?' },
            { stage: 'Welcome', title: 'Start Protocol', content: 'Hi {name}, we are activating the onboarding protocol for {business}. Let\'s hit those goals!' }
        ],
        'Beauty & Care (Salons)': [
            { stage: 'First Contact', title: 'Full-Time Agenda', content: 'Hi {name}, I admire the style of {business}. We implement intelligent booking systems that fill empty slots automatically. Talk soon?' },
            { stage: 'Follow-up', title: 'Client Re-engagement', content: 'Many {business} clients don\'t return due to lack of reminders. Our AI ensures they always have their next appointment set.' },
            { stage: 'Interest', title: 'Revenue Simulation', content: 'I calculated how much more {business} could bill with our automatic re-purchase system.' },
            { stage: 'Closing', title: 'Strategic Alliance', content: 'A pleasure to formalize this alliance with {business}. Success is guaranteed.' },
            { stage: 'Welcome', title: 'Platform Premiere', content: 'Congratulations {name}! Tomorrow we start transforming {business}.' }
        ],
        'Pets & Veterinary': [
            { stage: 'First Contact', title: 'Care and Efficiency', content: 'Hi {name}, at {business} you take care of what matters most. We take care of your time by automating medical records and reminders. Can I tell you more?' },
            { stage: 'Follow-up', title: 'Forgetfulness Prevention', content: 'Vaccine follow-ups at {business} can be 100% automatic. Prevent your clients from forgetting their appointments.' },
            { stage: 'Interest', title: 'Workflow Design', content: 'We built this workflow for {business}. Pure efficiency for animal care.' },
            { stage: 'Closing', title: 'Service Agreement', content: 'Taking the final step for {business}. Shall we set the launch for next week?' },
            { stage: 'Welcome', title: 'Pet Eco-System', content: 'Welcome to the Elite ecosystem. {business} is now a clinic of the future.' }
        ],
        'Professional Services': [
            { stage: 'First Contact', title: 'B2B Scalability', content: 'Hi {name}, I am closely following the growth of {business}. We help professional firms qualify their leads automatically. Shall we talk?' },
            { stage: 'Follow-up', title: 'Man-Hour Savings', content: 'I noticed the {business} team spends a lot of time on manual tasks. Our solution saves them 10h weekly.' },
            { stage: 'Interest', title: 'Operational Blueprint', content: 'Here is the map of how we will scale operations for {business} without hiring more staff.' },
            { stage: 'Closing', title: 'Agreement Signing', content: 'Partner, the contract for {business} is ready to be sealed. Shall we move forward?' },
            { stage: 'Welcome', title: 'Strategic Partner', content: 'An honor to have {business} among our authorized partners.' }
        ],
        'Real Estate / Realtors': [
            { stage: 'First Contact', title: 'Property Acquisition', content: 'Hi {name}, I saw the listings at {business}. We have a lead capture engine that filters real prospects. Coffee meeting?' },
            { stage: 'Follow-up', title: 'Prospect Qualification', content: 'We know at {business} you lose time with curious browsers. Our AI qualifies and only passes the real deals to you.' },
            { stage: 'Interest', title: 'Real Estate Pipeline', content: 'This is the pipeline I designed for the upcoming sales at {business}.' },
            { stage: 'Closing', title: 'Alliance Deed', content: 'Ready for the most important closing of the year for {business}. Shall we sign?' },
            { stage: 'Welcome', title: 'Keys of Success', content: 'Welcome {name}! Here are the keys to success for {business}.' }
        ],
        'Premium Automotive': [
            { stage: 'First Contact', title: 'Digital Test Drive', content: 'Hi {name}, {business} inventory is high-end. Our AI does the digital "Test Drive" resolving doubts 24/7. Interested?' },
            { stage: 'Follow-up', title: 'Consultative Selling', content: 'Following up on the interest in {business} vehicles. We can automate dynamic catalog delivery.' },
            { stage: 'Interest', title: 'Conversion Analysis', content: 'Take a look at how we increased visits to the {business} showroom.' },
            { stage: 'Closing', title: 'Handover of Command', content: 'The deal is closed for {business}. Shall we start the integration today?' },
            { stage: 'Welcome', title: 'High Octane Welcome', content: 'Accelerating together, {name}. Welcome to the gold standard with {business}.' }
        ]
    }
};

export default function TemplatesPage() {
    const { t, language } = useLanguage();
    const [templates, setTemplates] = useState<any[]>([]);
    const [isFetching, setIsFetching] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
    const [formData, setFormData] = useState({ title: '', content: '' });
    const [isSaving, setIsSaving] = useState(false);

    const [showPresets, setShowPresets] = useState(false);
    const [selectedNiche, setSelectedNiche] = useState<string | null>(null);

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

    const handleImportPreset = async (niche: string) => {
        setIsFetching(true);
        const presets = PRESET_TEMPLATES[language][niche];
        for (const p of presets) {
            await createTemplate(`[${p.stage}] ${p.title}`, p.content);
        }
        await fetchTemplates();
        setSelectedNiche(null);
        setShowPresets(false);
        setIsFetching(false);
    };

    const handleDelete = async (id: string) => {
        if (confirm(t('copy_delete_confirm'))) {
            await deleteTemplate(id);
            await fetchTemplates();
        }
    };

    const CURRENT_PRESETS = PRESET_TEMPLATES[language] || PRESET_TEMPLATES['es'];

    return (
        <EliteLayout>
            <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-8 lg:py-16 space-y-12 lg:space-y-16 animate-in fade-in duration-500 pt-16">
                <SectionHeader
                    icon={BookOpen}
                    label={t('copy_title')}
                    title={t('copy_title')}
                    accent={t('copy_accent')}
                    subtitle={t('copy_subtitle')}
                    rightElement={
                        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                            {/* Selector Inteligente de Nichos */}
                            <div className="relative w-full sm:w-auto">
                                <button
                                    onClick={() => setShowPresets(!showPresets)}
                                    className="w-full sm:w-auto h-16 sm:h-20 px-6 sm:px-10 bg-cyan-600 text-white text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] sm:tracking-[0.4em] rounded-2xl sm:rounded-[2rem] hover:bg-cyan-500 transition-all flex items-center justify-center gap-4 shadow-[0_10px_30px_rgba(8,145,178,0.3)]"
                                >
                                    <Wand2 className="w-4 sm:w-5 h-4 sm:h-5" /> {t('copy_btn_inject')} <ChevronDown className={`ml-2 w-3 sm:w-4 h-3 sm:h-4 transition-transform ${showPresets ? 'rotate-180' : ''}`} />
                                </button>

                                <AnimatePresence>
                                    {showPresets && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute right-0 top-full mt-4 w-full sm:w-80 bg-black/95 backdrop-blur-2xl border border-white/10 rounded-[1.5rem] sm:rounded-3xl overflow-hidden z-[100] shadow-2xl"
                                        >
                                            <div className="bg-cyan-600 px-6 py-4">
                                                <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-white/90">{t('copy_niche_selector')}</p>
                                            </div>
                                            <div className="p-2">
                                                {Object.keys(CURRENT_PRESETS).map((niche) => (
                                                    <button
                                                        key={niche}
                                                        onClick={() => setSelectedNiche(niche)}
                                                        className="w-full text-left px-4 sm:px-6 py-3 sm:py-4 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.1em] sm:tracking-[0.2em] text-white/40 hover:text-white hover:bg-white/5 transition-all rounded-xl"
                                                    >
                                                        {niche}
                                                    </button>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <button
                                onClick={() => handleOpenModal()}
                                className="w-full sm:w-auto h-16 sm:h-20 px-6 sm:px-10 bg-white text-black text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] sm:tracking-[0.4em] rounded-2xl sm:rounded-[2rem] hover:shadow-[0_20px_40px_rgba(255,255,255,0.25)] transition-all flex items-center justify-center gap-4 border border-transparent"
                            >
                                <Plus className="w-5 sm:w-6 h-5 sm:h-6" /> {t('copy_btn_new')}
                            </button>
                        </div>
                    }
                />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                    {isFetching ? (
                        Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="h-64 rounded-3xl bg-white/[0.02] border border-white/5 animate-pulse" />
                        ))
                    ) : templates.length === 0 ? (
                        <div className="col-span-full py-32 text-center opacity-20">
                            <MessageSquare className="w-16 h-16 mx-auto mb-6" />
                            <p className="tracking-[0.5em] font-black uppercase text-[10px]">{t('copy_empty')}</p>
                        </div>
                    ) : (
                        templates.map((t_item, i) => (
                            <SpotlightCard key={t_item.id} delay={i * 0.05} className="p-8 lg:p-10 flex flex-col h-full group">
                                <div className="flex justify-between items-start mb-6 lg:mb-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
                                        <h3 className="text-[10px] lg:text-[11px] font-black uppercase tracking-[0.3em] text-white">{t_item.title}</h3>
                                    </div>
                                    <div className="flex gap-2 lg:opacity-0 group-hover:opacity-100 transition-all">
                                        <button onClick={() => handleOpenModal(t_item)} className="p-2 sm:p-3 bg-white/5 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-colors"><Edit3 className="w-3.5 h-3.5" /></button>
                                        <button onClick={() => handleDelete(t_item.id)} className="p-2 sm:p-3 bg-white/5 rounded-full hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-serif italic text-white/60 leading-relaxed line-clamp-6 whitespace-pre-line">{t_item.content}</p>
                                </div>
                                <div className="mt-6 lg:mt-8 pt-6 lg:pt-8 border-t border-white/5 flex items-center justify-between">
                                    <span className="text-[8px] font-black text-white/30 uppercase tracking-widest">{t_item.content.length} {t('copy_chars')}</span>
                                    <button
                                        onClick={() => { navigator.clipboard.writeText(t_item.content); alert(t('copy_copied')); }}
                                        className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-cyan-500/80 hover:text-cyan-400 transition-colors flex items-center gap-2"
                                    >
                                        <Copy className="w-3 h-3" /> {t('copy_btn_copy')}
                                    </button>
                                </div>
                            </SpotlightCard>
                        ))
                    )}
                </div>
            </div>

            {/* Modal de Previsualización Presets */}
            <AnimatePresence>
                {selectedNiche && (
                    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl">
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 50 }}
                            className="w-full max-w-5xl bg-black/80 backdrop-blur-2xl border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
                        >
                            <div className="bg-cyan-600 p-12 flex justify-between items-center shrink-0">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3">
                                        <Sparkles className="w-5 h-5 text-white animate-pulse" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/60">{t('copy_strategy_suggested')}</span>
                                    </div>
                                    <h2 className="text-4xl font-sans font-black uppercase tracking-widest text-white">{selectedNiche}</h2>
                                    <p className="text-[10px] text-white/60 uppercase tracking-[0.4em] font-black">{t('copy_strategy_subtitle')}</p>
                                </div>
                                <button onClick={() => setSelectedNiche(null)} className="p-5 bg-black/20 rounded-full hover:bg-black/40 text-white transition-all"><X className="w-6 h-6" /></button>
                            </div>

                            <div className="flex-1 p-12 overflow-y-auto custom-scrollbar space-y-8">
                                {CURRENT_PRESETS[selectedNiche].map((p, i) => (
                                    <div key={i} className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 space-y-4 hover:border-cyan-500/30 transition-all group">
                                        <div className="flex justify-between items-center">
                                            <span className="px-4 py-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-[8px] font-black uppercase tracking-widest text-cyan-400">{p.stage}</span>
                                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20">{p.title}</span>
                                        </div>
                                        <p className="text-base font-serif italic text-white/50 leading-relaxed group-hover:text-white/80 transition-colors">"{p.content}"</p>
                                    </div>
                                ))}
                            </div>

                            <div className="p-12 border-t border-white/5 bg-black/80 shrink-0 flex gap-6">
                                <button
                                    onClick={() => setSelectedNiche(null)}
                                    className="flex-1 py-6 border border-white/10 text-white/60 text-[10px] font-black uppercase tracking-[0.4em] rounded-3xl hover:bg-white/5 transition-all"
                                >
                                    {t('cancel')}
                                </button>
                                <button
                                    onClick={() => handleImportPreset(selectedNiche)}
                                    disabled={isSaving}
                                    className="flex-[2] py-6 bg-white text-black text-[10px] font-black uppercase tracking-[0.5em] rounded-3xl hover:shadow-[0_20px_40px_rgba(255,255,255,0.2)] transition-all flex items-center justify-center gap-4"
                                >
                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <BookOpen className="w-4 h-4" />}
                                    {t('copy_btn_inject_lib')}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
                        <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-2xl bg-black/80 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-12 overflow-hidden shadow-2xl">
                            <div className="flex justify-between items-center mb-10">
                                <div>
                                    <h3 className="text-2xl font-serif font-light tracking-[0.1em] uppercase text-white/90">{selectedTemplate ? t('copy_modal_title_edit') : t('copy_modal_title_new')} <span className="text-white/40 italic">{t('copy_modal_accent')}</span></h3>
                                    <p className="text-[10px] text-white/50 uppercase tracking-[0.4em] font-black mt-2">{t('copy_modal_subtitle')}</p>
                                </div>
                                <button onClick={() => setShowModal(false)} className="p-4 bg-white/5 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-all"><X className="w-5 h-5" /></button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="space-y-4">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-white/50 ml-2">{t('copy_label_title')}</label>
                                    <input
                                        required
                                        placeholder={t('copy_placeholder_title')}
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-lg font-serif text-white/90 placeholder-white/5 focus:outline-none focus:border-cyan-500/50 transition-all"
                                    />
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-white/50 ml-2">{t('copy_label_content')}</label>
                                    <textarea
                                        required
                                        placeholder={t('copy_placeholder_content')}
                                        value={formData.content}
                                        onChange={e => setFormData({ ...formData, content: e.target.value })}
                                        className="w-full h-64 bg-white/5 border border-white/10 rounded-2xl p-6 text-base font-serif italic text-white/80 placeholder-white/5 focus:outline-none focus:border-cyan-500/50 transition-all resize-none custom-scrollbar"
                                    />
                                    <p className="text-[8px] text-white/30 uppercase tracking-widest text-right">{t('copy_tip')}</p>
                                </div>

                                <button disabled={isSaving} className="w-full py-6 bg-white text-black text-[11px] font-black uppercase tracking-[0.5em] rounded-3xl hover:shadow-[0_20px_40px_rgba(255,255,255,0.2)] transition-all flex items-center justify-center gap-4">
                                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                                    {selectedTemplate ? t('copy_btn_update') : t('copy_btn_register')}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </EliteLayout>
    );
}
