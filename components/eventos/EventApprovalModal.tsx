'use client';

import { useState } from 'react';
import { Evento } from '@/lib/api/eventos';

interface EventApprovalModalProps {
    evento: Evento;
    onClose: () => void;
    onApprove: () => Promise<void>;
    onReject: (motivo: string) => Promise<void>;
}

export default function EventApprovalModal({
    evento,
    onClose,
    onApprove,
    onReject
}: EventApprovalModalProps) {
    const [rejectMode, setRejectMode] = useState(false);
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);

    const handleApprove = async () => {
        setLoading(true);
        await onApprove();
        setLoading(false);
    };

    const handleReject = async () => {
        if (!reason.trim()) return;
        setLoading(true);
        await onReject(reason);
        setLoading(false);
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-lg shadow-xl w-full max-w-md p-6"
                onClick={e => e.stopPropagation()}
            >
                <h3 className="text-lg font-bold text-gray-900 mb-2">Revisar Evento</h3>
                <p className="text-sm text-gray-600 mb-4">
                    Estás revisando: <strong>{evento.nombre}</strong>
                </p>

                {!rejectMode ? (
                    <div className="space-y-3">
                        <p className="text-gray-700">¿Qué acción deseas tomar con este evento?</p>
                        <div className="flex gap-3 justify-end mt-4">
                            <button onClick={onClose} className="cursor-pointer px-3 py-2 text-gray-600 hover:bg-gray-50 rounded">
                                Cancelar
                            </button>
                            <button
                                onClick={() => setRejectMode(true)}
                                className="cursor-pointer px-3 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded font-medium"
                            >
                                Rechazar
                            </button>
                            <button
                                onClick={handleApprove}
                                disabled={loading}
                                className="cursor-pointer px-3 py-2 bg-green-600 text-white hover:bg-green-700 rounded font-medium"
                            >
                                {loading ? 'Procesando...' : 'Aprobar Evento'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-700">Motivo del rechazo *</label>
                        <textarea
                            className="w-full border rounded p-2 focus:ring-2 focus:ring-red-500"
                            rows={3}
                            value={reason}
                            onChange={e => setReason(e.target.value)}
                            placeholder="Explica por qué se rechaza..."
                            autoFocus
                        />
                        <div className="flex gap-3 justify-end mt-4">
                            <button onClick={() => setRejectMode(false)} className="cursor-pointer px-3 py-2 text-gray-600 hover:bg-gray-50 rounded">
                                Atrás
                            </button>
                            <button
                                onClick={handleReject}
                                disabled={!reason.trim() || loading}
                                className="cursor-pointer px-3 py-2 bg-red-600 text-white hover:bg-red-700 rounded font-medium disabled:opacity-50"
                            >
                                {loading ? 'Rechazando...' : 'Confirmar Rechazo'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
