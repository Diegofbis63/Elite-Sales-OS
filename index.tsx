import React, { useRef, useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  MessageSquare, 
  BarChart3, 
  Settings, 
  Search, 
  Bell, 
  MessageCircle, 
  Edit2, 
  Trash2, 
  Filter, 
  Plus, 
  Save,
  MapPin,
  Loader2,
  X,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import ReactMarkdown from 'react-markdown';

// --- Helpers ---

const getApiKey = async () => {
  // @ts-ignore
  if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
    // @ts-ignore
    const hasKey = await window.aistudio.hasSelectedApiKey();
    if (!hasKey) {
      // @ts-ignore
      await window.aistudio.openSelectKey();
    }
  }
  // @ts-ignore
  return typeof process !== 'undefined' ? process.env?.API_KEY : import.meta.env.VITE_GEMINI_API_KEY;
};

// --- Components ---

const SpotlightCard = ({ children, className = '', delay = 0, neon = true }: { children: React.ReactNode, className?: string, delay?: number, neon?: boolean }) => {
  const divRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current || isFocused) return;
    const div = divRef.current;
    const rect = div.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <motion.div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onFocus={() => { setIsFocused(true); setOpacity(1); }}
      onBlur={() => { setIsFocused(false); setOpacity(0); }}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ type: 'spring', stiffness: 300, damping: 24, delay }}
      whileHover={{ scale: 1.01, transition: { type: 'spring', stiffness: 400, damping: 20 } }}
      className={`relative overflow-hidden rounded-xl bg-[#0f0f0f]/80 backdrop-blur-xl ${className} ${neon ? 'border-0' : 'border border-white/5'}`}
    >
      {neon && (
        <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none z-0">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] bg-[conic-gradient(from_0deg,transparent_70%,rgba(168,85,247,0.8)_90%,rgba(168,85,247,1)_100%)]"
          />
          <div className="absolute inset-[1px] bg-[#0f0f0f]/95 rounded-xl backdrop-blur-3xl" />
        </div>
      )}
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 z-0"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(255,255,255,.08), transparent 40%)`,
        }}
      />
      <div className="relative z-10 h-full">
        {children}
      </div>
    </motion.div>
  );
};

const Sidebar = ({ currentRoute, setCurrentRoute }: { currentRoute: string, setCurrentRoute: (r: string) => void }) => {
  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Panel' },
    { id: 'prospects', icon: Users, label: 'Prospectos' },
    { id: 'templates', icon: MessageSquare, label: 'Plantillas' },
    { id: 'analytics', icon: BarChart3, label: 'Métricas' },
    { id: 'settings', icon: Settings, label: 'Configuración' },
  ];

  return (
    <div className="w-20 lg:w-64 border-r border-white/5 bg-[#0a0a0a] flex flex-col transition-all duration-300 z-20">
      <div className="h-16 flex items-center justify-center lg:justify-start lg:px-6 border-b border-white/5">
        <div className="w-8 h-8 rounded bg-gradient-to-br from-white to-white/50 flex items-center justify-center text-black font-bold text-sm">
          E
        </div>
        <span className="ml-3 font-serif font-medium tracking-widest hidden lg:block text-sm">ELITE OS</span>
      </div>
      <nav className="flex-1 py-6 flex flex-col gap-2 px-3">
        {navItems.map((item) => {
          const isActive = currentRoute === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentRoute(item.id)}
              className={`relative flex items-center px-3 py-3 rounded-lg transition-all duration-200 group ${
                isActive ? 'text-white' : 'text-white/50 hover:text-white'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="active-nav"
                  className="absolute inset-0 bg-white/10 rounded-lg"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <item.icon className="w-5 h-5 flex-shrink-0 relative z-10" />
              <span className="ml-3 text-sm font-medium hidden lg:block tracking-wide relative z-10">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

const Header = () => {
  return (
    <header className="h-16 border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-10">
      <div className="relative w-64 lg:w-96">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
        <input
          type="text"
          placeholder="Buscar prospectos..."
          className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm text-white placeholder-white/40 focus:outline-none focus:border-white/20 focus:bg-white/10 transition-all"
        />
      </div>
      <div className="flex items-center gap-6">
        <button className="relative p-2 text-white/50 hover:text-white transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-purple-500 border-2 border-[#0a0a0a] animate-pulse"></span>
        </button>
        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 overflow-hidden">
            <img src="https://picsum.photos/seed/avatar/100/100" alt="Profile" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
          </div>
          <div className="hidden md:block text-left">
            <div className="text-sm font-medium">Diego B.</div>
            <div className="text-[10px] text-white/40 uppercase tracking-wider">Admin</div>
          </div>
        </div>
      </div>
    </header>
  );
};

// --- Pages ---

const Dashboard = () => {
  const kpis = [
    { label: 'Ingresos Proyectados', value: '$124.500', trend: '+12.5%' },
    { label: 'Prospectos Calientes', value: '48', trend: '+4' },
    { label: 'Tasa de Conversión', value: '18.2%', trend: '+2.1%' },
    { label: 'Mensajes Enviados', value: '1.284', trend: '+156' },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-3xl font-serif font-light mb-2">Resumen</h1>
        <p className="text-white/50 text-sm">Métricas de prospección en tiempo real.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <SpotlightCard key={i} delay={i * 0.1} className="p-6 h-full">
            <div className="text-white/50 text-xs tracking-wider uppercase mb-4">{kpi.label}</div>
            <div className="flex items-end justify-between">
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }} 
                animate={{ opacity: 1, scale: 1 }} 
                transition={{ type: 'spring', delay: 0.2 + (i * 0.1) }}
                className="text-3xl font-light"
              >
                {kpi.value}
              </motion.div>
              <div className="text-purple-400 text-sm mb-1">{kpi.trend}</div>
            </div>
          </SpotlightCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <SpotlightCard delay={0.4} neon className="p-6 h-[400px] flex flex-col">
            <h3 className="text-sm font-medium text-white/70 mb-8">Prospección Semanal</h3>
            <div className="flex-1 flex items-end gap-2 sm:gap-4 pt-4 relative z-10">
              {[40, 65, 45, 80, 55, 90, 30].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-3 group h-full">
                  <div className="w-full relative bg-white/5 rounded-t-sm overflow-hidden h-full flex items-end">
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      transition={{ duration: 1.5, delay: 0.5 + (i * 0.1), type: 'spring', bounce: 0.4 }}
                      className="w-full bg-purple-500/20 group-hover:bg-purple-500/40 transition-colors rounded-t-sm border-t border-purple-500/50"
                    />
                  </div>
                  <span className="text-xs text-white/30 font-mono">D{i+1}</span>
                </div>
              ))}
            </div>
          </SpotlightCard>
        </div>

        <div>
          <SpotlightCard delay={0.5} className="p-6 h-[400px] flex flex-col">
            <h3 className="text-sm font-medium text-white/70 mb-6">Actividad Reciente</h3>
            <div className="flex-1 overflow-y-auto space-y-5 pr-2">
              {[
                { entity: 'Clínica del Sol', action: 'Leyó el mensaje', time: 'Hace 5 min' },
                { entity: 'Estética Nueva Córdoba', action: 'Respondió', time: 'Hace 12 min' },
                { entity: 'Sanatorio Allende', action: 'Campaña enviada', time: 'Hace 1 hora' },
                { entity: 'Consultorios Cerro', action: 'Agendó reunión', time: 'Hace 2 horas' },
                { entity: 'Odontología Avanzada', action: 'Leyó el mensaje', time: 'Hace 3 horas' },
                { entity: 'Hospital Privado', action: 'Campaña enviada', time: 'Hace 4 horas' },
              ].map((act, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + (i * 0.1) }}
                  className="flex items-start gap-4 group cursor-pointer"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-white/20 mt-2 group-hover:bg-purple-400 transition-colors shadow-[0_0_10px_rgba(168,85,247,0)] group-hover:shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
                  <div>
                    <div className="text-sm text-white/80 group-hover:text-white transition-colors">{act.entity}</div>
                    <div className="text-xs text-white/40 mt-0.5">{act.action} • {act.time}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </SpotlightCard>
        </div>
      </div>
    </div>
  );
};

const Prospects = () => {
  const [showAiModal, setShowAiModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [aiLeads, setAiLeads] = useState('');
  const [aiChunks, setAiChunks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const prospects = [
    { id: 1, name: 'Clínica del Sol', contact: 'Dr. Roberto Gómez', status: 'Interesado', lastContact: 'Hoy, 10:30 AM' },
    { id: 2, name: 'Estética Nueva Córdoba', contact: 'Lic. María Paz', status: 'Contactado', lastContact: 'Ayer, 16:45 PM' },
    { id: 3, name: 'Sanatorio Allende', contact: 'Ing. Carlos Ruiz', status: 'Frío', lastContact: 'Hace 3 días' },
    { id: 4, name: 'Consultorios Cerro', contact: 'Dra. Ana López', status: 'Cerrado', lastContact: 'Hace 1 semana' },
    { id: 5, name: 'Odontología Avanzada', contact: 'Dr. Martín Silva', status: 'Interesado', lastContact: 'Hoy, 09:15 AM' },
    { id: 6, name: 'Centro Médico Vital', contact: 'Lic. Sofía Herrera', status: 'Contactado', lastContact: 'Ayer, 11:20 AM' },
  ];

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Interesado': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      case 'Contactado': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'Cerrado': return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
      default: return 'text-white/50 bg-white/5 border-white/10';
    }
  };

  const handleSearchLeads = async () => {
    if (!searchQuery) return;
    setLoading(true);
    try {
      const key = await getApiKey();
      const ai = new GoogleGenAI({ apiKey: key });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Encuentra prospectos B2B para: ${searchQuery}. Devuelve una lista de nombres de empresas y una breve descripción.`,
        config: { tools: [{googleMaps: {}}] }
      });
      setAiLeads(response.text || '');
      setAiChunks(response.candidates?.[0]?.groundingMetadata?.groundingChunks || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-12 relative">
      <div className="flex items-end justify-between mb-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-3xl font-serif font-light mb-2">Prospectos</h1>
          <p className="text-white/50 text-sm">Gestión de contactos B2B.</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex gap-3">
          <button 
            onClick={() => setShowAiModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-lg text-sm hover:bg-purple-500/20 transition-colors"
          >
            <MapPin className="w-4 h-4" /> Buscar con IA
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm hover:bg-white/10 transition-colors">
            <Filter className="w-4 h-4" /> Filtros
          </button>
        </motion.div>
      </div>

      <SpotlightCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-white/40 text-xs uppercase tracking-wider bg-black/20">
                <th className="px-6 py-5 font-medium">Empresa</th>
                <th className="px-6 py-5 font-medium">Contacto</th>
                <th className="px-6 py-5 font-medium">Estado</th>
                <th className="px-6 py-5 font-medium">Último Contacto</th>
                <th className="px-6 py-5 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {prospects.map((p, i) => (
                  <motion.tr 
                    key={p.id} 
                    layout
                    initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    transition={{ delay: i * 0.05, type: 'spring', stiffness: 300, damping: 24 }}
                    className="border-b border-white/5 hover:bg-white/[0.03] transition-colors group"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-white/90">{p.name}</td>
                    <td className="px-6 py-4 text-sm text-white/60">{p.contact}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] uppercase tracking-wider border ${getStatusColor(p.status)}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-white/50">{p.lastContact}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="p-2 rounded-md hover:bg-purple-500/10 text-purple-500/70 hover:text-purple-400 transition-colors" title="WhatsApp">
                          <MessageCircle className="w-4 h-4" />
                        </motion.button>
                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="p-2 rounded-md hover:bg-white/10 text-white/50 hover:text-white transition-colors" title="Editar">
                          <Edit2 className="w-4 h-4" />
                        </motion.button>
                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="p-2 rounded-md hover:bg-red-500/10 text-red-500/70 hover:text-red-400 transition-colors" title="Eliminar">
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </SpotlightCard>

      {/* AI Modal */}
      <AnimatePresence>
        {showAiModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-2xl bg-[#0f0f0f] border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/20">
                <h2 className="text-xl font-serif flex items-center gap-2"><MapPin className="w-5 h-5 text-purple-400" /> Grounding Leads</h2>
                <button onClick={() => setShowAiModal(false)} className="text-white/50 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Ej: Clínicas dentales en Nueva Córdoba..."
                    className="flex-1 bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-sm focus:border-purple-500/50 outline-none transition-colors text-white"
                  />
                  <button 
                    onClick={handleSearchLeads}
                    disabled={loading || !searchQuery}
                    className="px-4 py-2 bg-purple-500 text-black rounded-lg text-sm font-medium hover:bg-purple-400 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />} Buscar
                  </button>
                </div>
                
                <div className="h-64 overflow-y-auto bg-black/20 rounded-lg border border-white/5 p-4 text-sm text-white/80">
                  {loading ? (
                    <div className="h-full flex items-center justify-center text-white/30"><Loader2 className="w-6 h-6 animate-spin" /></div>
                  ) : aiLeads ? (
                    <div className="space-y-4">
                      <div className="markdown-body prose prose-invert max-w-none prose-sm">
                        <ReactMarkdown>{aiLeads}</ReactMarkdown>
                      </div>
                      {aiChunks.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-white/10">
                          <h4 className="text-xs uppercase tracking-wider text-white/40 mb-2">Fuentes (Google Maps)</h4>
                          <div className="flex flex-wrap gap-2">
                            {aiChunks.map((chunk, i) => chunk.maps?.uri && (
                              <a key={i} href={chunk.maps.uri} target="_blank" rel="noreferrer" className="text-xs text-purple-400 hover:underline bg-purple-400/10 px-2 py-1 rounded">
                                {chunk.maps.title || 'Ver en Maps'}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-white/30 font-serif italic">Los resultados aparecerán aquí...</div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Templates = () => {
  const templates = [
    {
      id: 1,
      title: 'Abridor Clínicas',
      state: 'Frío',
      content: 'Hola {nombre}, ¿cómo estás? Vi que están haciendo un excelente trabajo en {negocio}. Quería consultarte si actualmente están tomando nuevos pacientes o si tienen la agenda llena.',
      variables: ['{nombre}', '{negocio}']
    },
    {
      id: 2,
      title: 'Seguimiento Valor (Día 3)',
      state: 'Contactado',
      content: 'Hola {nombre}, te escribo cortito para no robarte tiempo. ¿Pudiste ver el mensaje anterior sobre cómo podemos escalar las consultas en {negocio}?',
      variables: ['{nombre}', '{negocio}']
    },
    {
      id: 3,
      title: 'Propuesta / Agendar',
      state: 'Interesado',
      content: 'Excelente {nombre}. Para avanzar con la propuesta para {negocio}, ¿te parece bien si agendamos una breve llamada de 10 min este {dia} a las {hora}?',
      variables: ['{nombre}', '{negocio}', '{dia}', '{hora}']
    },
    {
      id: 4,
      title: 'Onboarding Cliente',
      state: 'Cerrado',
      content: '¡Bienvenido a Elite OS, {nombre}! Es un placer empezar a trabajar con {negocio}. Te acabo de enviar al correo los accesos y los próximos pasos para el onboarding.',
      variables: ['{nombre}', '{negocio}']
    }
  ];

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Interesado': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      case 'Contactado': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'Cerrado': return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
      case 'Frío': return 'text-white/50 bg-white/5 border-white/10';
      default: return 'text-white/50 bg-white/5 border-white/10';
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="max-w-4xl mx-auto pb-12">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-3xl font-serif font-light mb-2">Plantillas</h1>
          <p className="text-white/50 text-sm">Abridores de WhatsApp y secuencias por estado.</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-white text-black rounded-lg text-sm font-medium hover:bg-white/90 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.1)]">
          <Plus className="w-4 h-4" /> Nueva Plantilla
        </button>
      </div>

      <div className="grid gap-6">
        {templates.map((tpl, index) => {
          const isEditing = index === 0;

          return (
            <motion.div key={tpl.id} variants={item}>
              <SpotlightCard className={`p-6 ${!isEditing ? 'opacity-70 hover:opacity-100 transition-opacity' : ''}`}>
                {isEditing ? (
                  <>
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-4 w-2/3">
                        <input 
                          type="text" 
                          defaultValue={tpl.title} 
                          className="bg-transparent text-xl font-serif font-light outline-none border-b border-transparent focus:border-white/20 transition-colors w-full pb-1 text-white"
                        />
                        <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider border whitespace-nowrap ${getStatusColor(tpl.state)}`}>
                          {tpl.state}
                        </span>
                      </div>
                      <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-md text-xs hover:bg-white/10 transition-colors">
                        <Save className="w-3.5 h-3.5" /> Guardar
                      </button>
                    </div>
                    <div className="relative">
                      <textarea 
                        className="w-full h-40 bg-black/40 border border-white/10 rounded-lg p-5 text-sm text-white/80 focus:outline-none focus:border-white/30 transition-colors resize-none leading-relaxed"
                        defaultValue={tpl.content}
                      />
                      <div className="absolute bottom-4 right-4 flex gap-2">
                        {tpl.variables.map(v => (
                          <span key={v} className="px-2.5 py-1 bg-white/10 border border-white/5 rounded text-[10px] uppercase tracking-wider text-white/60 cursor-pointer hover:bg-white/20 hover:text-white transition-colors">{v}</span>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <h3 className="text-lg font-serif font-light">{tpl.title}</h3>
                        <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider border ${getStatusColor(tpl.state)}`}>
                          {tpl.state}
                        </span>
                      </div>
                      <button className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-md text-xs hover:bg-white/10 transition-colors">
                        <Edit2 className="w-3.5 h-3.5" /> Editar
                      </button>
                    </div>
                    <p className="text-sm text-white/50 leading-relaxed bg-black/20 p-4 rounded-lg border border-white/5">
                      {tpl.content.split(/(\{.*?\})/).map((part, i) => 
                        part.startsWith('{') && part.endsWith('}') 
                          ? <span key={i} className="text-white/80 bg-white/5 px-1 rounded">{part}</span> 
                          : part
                      )}
                    </p>
                  </>
                )}
              </SpotlightCard>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

const Analytics = () => {
  return (
    <div className="max-w-6xl mx-auto pb-12">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <h1 className="text-3xl font-serif font-light mb-2">Métricas</h1>
        <p className="text-white/50 text-sm">Análisis de rendimiento y embudo de ventas.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <SpotlightCard delay={0.1} neon className="p-6 h-[400px] flex flex-col">
          <h3 className="text-lg font-serif font-light mb-6 flex items-center gap-2 relative z-10">
            <BarChart3 className="w-5 h-5 text-purple-400" /> Embudo de Conversión
          </h3>
          <div className="flex-1 flex flex-col justify-center gap-4 relative z-10">
            {[
              { label: 'Contactados', value: '1.284', width: '100%', color: 'bg-blue-500/20 border-blue-500/50 text-blue-400' },
              { label: 'Interesados', value: '342', width: '75%', color: 'bg-amber-500/20 border-amber-500/50 text-amber-400' },
              { label: 'Reuniones', value: '86', width: '50%', color: 'bg-purple-500/20 border-purple-500/50 text-purple-400' },
              { label: 'Cerrados', value: '24', width: '30%', color: 'bg-purple-500/20 border-purple-500/50 text-purple-400' },
            ].map((step, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + (i * 0.1) }}
                className="flex flex-col items-start"
              >
                <div 
                  className={`h-12 rounded-lg border flex items-center justify-between px-4 w-full max-w-md ${step.color} relative overflow-hidden group`}
                  style={{ width: step.width }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  <span className="text-sm font-medium z-10">{step.label}</span>
                  <span className="font-mono font-bold z-10">{step.value}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </SpotlightCard>

        <SpotlightCard delay={0.2} className="p-6 h-[400px] flex flex-col">
          <h3 className="text-lg font-serif font-light mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-400" /> Tasa de Respuesta (Mensual)
          </h3>
          <div className="flex-1 relative flex items-end gap-2">
            <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
              <motion.path 
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 2, ease: "easeInOut", delay: 0.5 }}
                d="M0,80 Q10,70 20,85 T40,60 T60,40 T80,50 T100,20" 
                fill="none" 
                stroke="rgba(168,85,247,0.5)" 
                strokeWidth="2"
                className="drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]"
              />
              <motion.path 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 2, delay: 1 }}
                d="M0,80 Q10,70 20,85 T40,60 T60,40 T80,50 T100,20 L100,100 L0,100 Z" 
                fill="url(#gradient)" 
              />
              <defs>
                <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(168,85,247,0.2)" />
                  <stop offset="100%" stopColor="rgba(168,85,247,0)" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex justify-between items-end pb-2 px-1">
               {['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'].map((s, i) => (
                 <span key={i} className="text-[10px] text-white/30 font-mono">{s}</span>
               ))}
            </div>
          </div>
        </SpotlightCard>
      </div>
    </div>
  );
};

const SettingsView = () => {
  return (
    <div className="max-w-4xl mx-auto pb-12">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <h1 className="text-3xl font-serif font-light mb-2">Configuración</h1>
        <p className="text-white/50 text-sm">Ajustes de tu cuenta y preferencias del CRM.</p>
      </motion.div>

      <div className="grid gap-6 mt-8">
        <SpotlightCard delay={0.1} className="p-6">
          <h3 className="text-lg font-serif font-light mb-6 border-b border-white/10 pb-4">Perfil de Usuario</h3>
          <div className="flex items-center gap-6">
            <div className="relative group cursor-pointer">
              <div className="w-20 h-20 rounded-full bg-white/10 border border-white/20 overflow-hidden">
                <img src="https://picsum.photos/seed/avatar/200/200" alt="Profile" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
              </div>
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                <Edit2 className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-white/50 uppercase tracking-wider mb-1 block">Nombre Completo</label>
                  <input type="text" defaultValue="Diego Bisquerra" className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-sm focus:border-purple-500/50 outline-none transition-colors text-white/90" />
                </div>
                <div>
                  <label className="text-xs text-white/50 uppercase tracking-wider mb-1 block">Email</label>
                  <input type="email" defaultValue="diego@eliteos.com" className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-sm focus:border-purple-500/50 outline-none transition-colors text-white/90" />
                </div>
              </div>
            </div>
          </div>
        </SpotlightCard>

        <SpotlightCard delay={0.2} neon className="p-6">
          <h3 className="text-lg font-serif font-light mb-6 border-b border-white/10 pb-4 flex items-center gap-2 relative z-10">
            <Sparkles className="w-5 h-5 text-purple-400" /> Preferencias del Sistema
          </h3>
          <div className="space-y-6 relative z-10">
            {[
              { title: 'Notificaciones por Email', desc: 'Recibí un resumen diario de tus prospectos calientes.' },
              { title: 'Alertas de WhatsApp', desc: 'Notificame al instante cuando un prospecto responda.' },
              { title: 'Modo Neón', desc: 'Activa los bordes láser y efectos visuales avanzados.' }
            ].map((setting, i) => (
              <div key={i} className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-white/90">{setting.title}</div>
                  <div className="text-xs text-white/50 mt-1">{setting.desc}</div>
                </div>
                <div className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${i === 2 ? 'bg-purple-500' : 'bg-white/10'}`}>
                  <motion.div 
                    layout
                    className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm ${i === 2 ? 'right-0.5' : 'left-0.5'}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </SpotlightCard>
      </div>
    </div>
  );
};

// --- Layout & App ---

const Layout = ({ children, currentRoute, setCurrentRoute }: { children: React.ReactNode, currentRoute: string, setCurrentRoute: (r: string) => void }) => {
  return (
    <div className="flex h-screen bg-[#0a0a0a] text-white overflow-hidden">
      <Sidebar currentRoute={currentRoute} setCurrentRoute={setCurrentRoute} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-white/[0.02] blur-[120px] rounded-full pointer-events-none" />
        <Header />
        <main className="flex-1 overflow-y-auto p-6 lg:p-10 relative z-10">
          {children}
        </main>
      </div>
    </div>
  );
};

function App() {
  const [currentRoute, setCurrentRoute] = useState('dashboard');

  const renderContent = () => {
    switch (currentRoute) {
      case 'dashboard': return <Dashboard />;
      case 'prospects': return <Prospects />;
      case 'templates': return <Templates />;
      case 'analytics': return <Analytics />;
      case 'settings': return <SettingsView />;
      default: return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-full text-white/30 space-y-4">
          <div className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center">
            <Settings className="w-6 h-6 opacity-50" />
          </div>
          <p className="font-serif tracking-widest uppercase text-sm">Vista en construcción</p>
        </motion.div>
      );
    }
  };

  return (
    <Layout currentRoute={currentRoute} setCurrentRoute={setCurrentRoute}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentRoute}
          initial={{ opacity: 0, y: 15, scale: 0.98, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -15, scale: 0.98, filter: 'blur(8px)' }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="h-full"
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>
    </Layout>
  );
}

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<React.StrictMode><App /></React.StrictMode>);
}
