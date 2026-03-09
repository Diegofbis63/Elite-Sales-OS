export interface Project {
    id: string;
    es: {
        name: string;
        description: string;
        value_props: string[];
        niche: string;
        roi_metric: string;
    };
    en: {
        name: string;
        description: string;
        value_props: string[];
        niche: string;
        roi_metric: string;
    };
    vercel_url: string;
    doc_url: string;
    estimated_price: string;
}

export const INITIAL_PROJECTS: Project[] = [
    {
        id: '1',
        es: {
            name: 'NOVA Estética B2B Suite',
            description: 'Ecosistema de flujo agéntico total. Chatbot NLP con razonamiento autónomo que cierra ventas y gestiona crisis en WhatsApp. Sustituye el 100% de la carga de recepción.',
            value_props: [
                'Ahorro operativo de +$1,200 USD/mes vs staff humano.',
                'Razonamiento multimodal para interpretar fotos de piel/cabello.',
                'Integración nativa con pasarelas de pago instantáneo.'
            ],
            niche: 'Operaciones Autónomas',
            roi_metric: 'Breakeven: 90 días'
        },
        en: {
            name: 'NOVA Aesthetics B2B Suite',
            description: 'Total agentic flow ecosystem. NLP Chatbot with autonomous reasoning that closes sales and manages crises on WhatsApp. Replaces 100% of the reception load.',
            value_props: [
                'Operational savings of +$1,200 USD/month vs human staff.',
                'Multimodal reasoning to interpret skin/hair photos.',
                'Native integration with instant payment gateways.'
            ],
            niche: 'Autonomous Beauty Ops',
            roi_metric: 'Breakeven: 90 days'
        },
        vercel_url: 'https://nova-estetica.vercel.app/',
        doc_url: 'https://github.com/Diegofbis63/nova-estetica-demo',
        estimated_price: '$6,500 - $12,000'
    },
    {
        id: '2',
        es: {
            name: 'SaaS Estética Pro',
            description: 'Núcleo ERP con Inteligencia Predictiva. No solo gestiona, sino que anticipa compras y tendencias de consumo. Vendido como IP propia "Lifetime".',
            value_props: [
                'Propiedad intelectual absoluta del cliente (Valor Activo).',
                'Sincronización Multi-Sucursal en tiempo real vía Edge.',
                'Auditoría automática de caja mediante visión artificial.'
            ],
            niche: 'Empresa Predictiva',
            roi_metric: 'Valor de Reventa +40%'
        },
        en: {
            name: 'SaaS Aesthetics Pro',
            description: 'ERP core with Predictive Intelligence. Not only manages, but anticipates purchases and consumption trends. Sold as custom "Lifetime" IP.',
            value_props: [
                'Absolute intellectual property for the client (Asset Value).',
                'Real-time Multi-Branch synchronization via Edge.',
                'Automatic cash audit through computer vision.'
            ],
            niche: 'Predictive Enterprise',
            roi_metric: 'Resale Value +40%'
        },
        vercel_url: 'https://saas-estetica-pro.vercel.app/',
        doc_url: 'https://github.com/Diegofbis63/saas-estetica-pro-demo',
        estimated_price: '$4,800 - $7,500'
    },
    {
        id: '3',
        es: {
            name: 'Santo Cuore Salud (Medical Hub)',
            description: 'Infraestructura clínica de alta disponibilidad. Booking agéntico sin costos de tokens externos (Arquitectura Local-First). Estabilidad crítica.',
            value_props: [
                '0% dependencia de APIs externas para el Booking.',
                'Cumplimiento normativo de datos médicos (HIPAA/GDPR).',
                'Portal del médico acelerado por IA para diagnóstico previo.'
            ],
            niche: 'Infraestructura Salud',
            roi_metric: '99.99% Uptime Médico'
        },
        en: {
            name: 'Santo Cuore Health (Medical Hub)',
            description: 'High-availability clinical infrastructure. Agentic booking without external token costs (Local-First Architecture). Critical stability.',
            value_props: [
                '0% dependence on external APIs for Booking.',
                'Regulatory compliance for medical data (HIPAA/GDPR).',
                'AI-accelerated doctor portal for pre-diagnosis.'
            ],
            niche: 'HealthTech Infrastructure',
            roi_metric: '99.99% Medical Uptime'
        },
        vercel_url: 'https://santo-cuore-salud.vercel.app',
        doc_url: 'https://github.com/Diegofbis63/santo-cuore-salud-showcase',
        estimated_price: '$4,500 - $6,500'
    },
    {
        id: '4',
        es: {
            name: 'Quantix AI (BI E-Commerce)',
            description: 'Cerebro de analítica prescriptiva. Ejecuta acciones preventivas en el e-commerce basándose en el comportamiento VIP.',
            value_props: [
                'Motor de recomendación agéntico hyper-personalizado.',
                'Reducción de abandono de carrito en 35% vía IA.',
                'Dashboard predictivo 2026 con simulación de escenarios.'
            ],
            niche: 'Inteligencia Prescriptiva',
            roi_metric: 'ROI Mensual +18%'
        },
        en: {
            name: 'Quantix AI (BI E-Commerce)',
            description: 'Prescriptive analytics brain. Executes preventive actions on e-commerce based on VIP behavior.',
            value_props: [
                'Hyper-personalized agentic recommendation engine.',
                '35% reduction in cart abandonment via AI.',
                '2026 predictive dashboard with scenario simulation.'
            ],
            niche: 'Prescriptive Intelligence',
            roi_metric: 'Monthly ROI +18%'
        },
        vercel_url: 'https://e-commerce-analytics-saas.vercel.app/',
        doc_url: 'https://github.com/Diegofbis63/quantix-ai-ecommerce-demo',
        estimated_price: '$5,800 - $9,500'
    },
    {
        id: '5',
        es: {
            name: 'Gemini AI Architect',
            description: 'Fábrica de Agentes de IA Industriales. Framework de orquestación para despliegue de micro-agentes especializados en tareas complejas.',
            value_props: [
                'Despliegue de "Agentes Empleados" en 24 horas.',
                'Infraestructura escalable en Vercel/Google Cloud.',
                'Protocolo de seguridad cuántica en el manejo de seeds.'
            ],
            niche: 'Infraestructura Agéntica',
            roi_metric: 'Digital Transformation 2.0'
        },
        en: {
            name: 'Gemini AI Architect',
            description: 'Industrial AI Agent Factory. Orchestration framework for deploying specialized micro-agents for complex tasks.',
            value_props: [
                'Deployment of "Digital Employees" in 24 hours.',
                'Scalable infrastructure on Vercel/Google Cloud.',
                'Quantum security protocol in seed management.'
            ],
            niche: 'Agentic Infrastructure',
            roi_metric: 'Digital Transformation 2.0'
        },
        vercel_url: 'https://gemini-code-assistant-five.vercel.app/',
        doc_url: 'https://github.com/Diegofbis63/gemini-ai-architect-demo',
        estimated_price: '$8,500 - $25,000'
    },
    {
        id: '6',
        es: {
            name: 'Conversion Engine',
            description: 'Funnel Agéntico Auto-Optimizado. La landing se re-escribe sola en tiempo real basándose en el origen del visitante.',
            value_props: [
                'A/B Testing autónomo sin intervención humana.',
                'Puntaje perfecto en métricas de experiencia 2026.',
                'Captura de leads enriquecida con data scraping.'
            ],
            niche: 'Crecimiento Autónomo',
            roi_metric: 'Conversion Velocity x4'
        },
        en: {
            name: 'Conversion Engine',
            description: 'Self-Optimized Agentic Funnel. The landing page rewrites itself in real-time based on visitor origin.',
            value_props: [
                'Autonomous A/B Testing without human intervention.',
                'Perfect score on 2026 experience metrics.',
                'Enriched lead capture through agentic scraping.'
            ],
            niche: 'Self-Optimizing Growth',
            roi_metric: 'Conversion Velocity x4'
        },
        vercel_url: 'https://landing-page-ab-test-demo.vercel.app',
        doc_url: 'https://github.com/Diegofbis63/landing-page-ab-test-demo',
        estimated_price: '$2,500 - $4,500'
    }
];
