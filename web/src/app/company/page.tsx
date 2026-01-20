import React from 'react';

export default function CompanyPage() {
    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
                <span className="text-2xl">🏢</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight mb-4 text-foreground">Company Brief</h1>
            <p className="text-muted-foreground max-w-md">
                Comprehensive profiles and updates on key industry players.
            </p>
        </div>
    );
}
