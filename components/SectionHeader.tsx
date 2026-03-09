import React from 'react';
import { LucideIcon } from 'lucide-react';

interface SectionHeaderProps {
    icon: LucideIcon;
    label: string;
    title: string;
    accent?: string;
    subtitle: string;
    rightElement?: React.ReactNode;
}

export const SectionHeader = ({ icon: Icon, label, title, accent, subtitle, rightElement }: SectionHeaderProps) => {
    return (
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 pb-14 border-b border-white/5">
            <div className="space-y-6">
                <div className="flex items-center gap-4 text-cyan-400">
                    <div className="p-3 bg-cyan-400/10 rounded-xl border border-cyan-400/20 shadow-[0_0_20px_rgba(34,211,238,0.2)]">
                        <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-black uppercase tracking-[0.5em]">{label}</span>
                </div>
                <h1 className="text-8xl font-sans font-black tracking-tighter text-white leading-none">
                    {title.toUpperCase()} {accent && <span className="text-white/20 italic font-serif">{accent.toUpperCase()}</span>}
                </h1>
                <p className="text-2xl text-white/40 font-light tracking-wide max-w-3xl leading-relaxed">
                    {subtitle}
                </p>
            </div>
            {rightElement && (
                <div className="flex items-center gap-8">
                    {rightElement}
                </div>
            )}
        </div>
    );
};
