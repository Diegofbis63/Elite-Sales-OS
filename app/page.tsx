"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { EliteLayout } from '@/components/EliteLayout';
import { Dashboard as DashboardUI } from '@/components/Dashboard';
import { getDashboardStats, getNotifications } from '@/lib/actions';

export default function Dashboard() {
    const router = useRouter();
    const [stats, setStats] = useState<any>(null);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const fetchData = async () => {
        const [s, n] = await Promise.all([getDashboardStats(), getNotifications()]);
        setStats(s);
        setNotifications(n);
    };

    useEffect(() => {
        fetchData();
    }, [refreshTrigger]);

    const handleRefresh = () => setRefreshTrigger(prev => prev + 1);

    return (
        <EliteLayout onSearch={(q) => {
            if (q) router.push(`/prospects?q=${encodeURIComponent(q)}`);
        }}>
            <div className="max-w-[1400px] mx-auto px-8 py-16">
                <DashboardUI
                    stats={stats}
                    notifications={notifications}
                    onRefresh={handleRefresh}
                    onNavigate={(route) => router.push(route)}
                />
            </div>
        </EliteLayout>
    );
}
