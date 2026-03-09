"use client";

import React, { useState } from 'react';
import { EliteLayout } from '@/components/EliteLayout';
import { ProspectsList } from '@/components/ProspectsList';
import { LeadFormModal, VaultModal, CloseDealModal } from '@/components/Modals';

export default function ProspectsPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // UI Local state for modals
    const [selectedProspect, setSelectedProspect] = useState<any>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showVaultModal, setShowVaultModal] = useState(false);
    const [showCloseDealModal, setShowCloseDealModal] = useState(false);

    const handleRefresh = () => setRefreshTrigger(prev => prev + 1);

    const openEdit = (p: any) => {
        setSelectedProspect(p);
        setShowEditModal(true);
    };

    const openVault = (p: any) => {
        setSelectedProspect(p);
        setShowVaultModal(true);
    };

    const openCloseDeal = (p: any) => {
        setSelectedProspect(p);
        setShowCloseDealModal(true);
    };

    return (
        <EliteLayout onSearch={setSearchQuery}>
            <div className="max-w-[1400px] mx-auto px-8 py-16">
                <ProspectsList
                    key={refreshTrigger}
                    searchQuery={searchQuery}
                    onEdit={openEdit}
                    onOpenVault={openVault}
                    onCloseDeal={openCloseDeal}
                />
            </div>

            <LeadFormModal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                onRefresh={handleRefresh}
                prospect={selectedProspect}
            />

            <VaultModal
                isOpen={showVaultModal}
                onClose={() => setShowVaultModal(false)}
                prospect={selectedProspect}
                onRefresh={handleRefresh}
            />

            <CloseDealModal
                isOpen={showCloseDealModal}
                onClose={() => setShowCloseDealModal(false)}
                prospect={selectedProspect}
                onRefresh={handleRefresh}
            />
        </EliteLayout>
    );
}
