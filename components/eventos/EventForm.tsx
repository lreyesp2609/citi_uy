'use client';

import { useState, useEffect } from 'react';
import { Evento } from '@/lib/api/eventos'; // Interfaces

interface EventFormProps {
    ministerioId: number;
    evento?: Evento;
    onSuccess: () => void;
    onCancel: () => void;
    onSubmit: (data: any) => Promise<any>; // Inject service call
}

export default function EventForm({
    ministerioId,
    evento,
    onSuccess,
    onCancel,
    onSubmit
}: EventFormProps) {
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        fecha_inicio: '',
        fecha_fin: '',
        ubicacion: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (evento) {
            // Format dates for input datetime-local
            const formatForInput = (dateStr: string) => {
                if (!dateStr) return '';
                return new Date(dateStr).toISOString().slice(0, 16);
            };

            setFormData({
                nombre: evento.nombre,
                descripcion: evento.descripcion || '',
                fecha_inicio: formatForInput(evento.fecha_inicio),
                fecha_fin: evento.fecha_fin ? formatForInput(evento.fecha_fin) : '',
                ubicacion: evento.ubicacion || ''
            });
        }
    }, [evento]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (!formData.nombre || !formData.fecha_inicio) {
                throw new Error('Nombre y Fecha de inicio son obligatorios');
            }

            const payload = {
                ...formData,
                id_ministerio: ministerioId,
                // Ensure dates are ISO strings
                fecha_inicio: new Date(formData.fecha_inicio).toISOString(),
                fecha_fin: formData.fecha_fin ? new Date(formData.fecha_fin).toISOString() : null,
            };

            const result = await onSubmit(payload);

            if (result.success) {
                onSuccess();
            } else {
                setError(result.message || 'Error al guardar el evento');
            }
        } catch (err: any) {
            setError(err.message || 'Error inesperado');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={onCancel}
        >
            <div
                className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-900">
                        {evento ? 'Editar Evento' : 'Crear Nuevo Evento'}
                    </h3>
                    <button onClick={onCancel} className="cursor-pointer text-gray-400 hover:text-gray-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="bg-red-50 text-red-700 p-3 rounded text-sm">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nombre del Evento <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            required
                            value={formData.nombre}
                            onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                            className="mt-1 w-full rounded border border-gray-300 p-2 text-gray-900 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            placeholder="Ej. Culto de Jóvenes"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Fecha Inicio <span className="text-red-500">*</span></label>
                            <input
                                type="datetime-local"
                                required
                                value={formData.fecha_inicio}
                                onChange={e => setFormData({ ...formData, fecha_inicio: e.target.value })}
                                className="mt-1 w-full rounded border border-gray-300 p-2 text-gray-900"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Fecha Fin</label>
                            <input
                                type="datetime-local"
                                value={formData.fecha_fin}
                                onChange={e => setFormData({ ...formData, fecha_fin: e.target.value })}
                                className="mt-1 w-full rounded border border-gray-300 p-2 text-gray-900"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Ubicación</label>
                        <input
                            type="text"
                            value={formData.ubicacion}
                            onChange={e => setFormData({ ...formData, ubicacion: e.target.value })}
                            className="mt-1 w-full rounded border border-gray-300 p-2 text-gray-900"
                            placeholder="Ej. Auditorio Principal"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Descripción</label>
                        <textarea
                            rows={3}
                            value={formData.descripcion}
                            onChange={e => setFormData({ ...formData, descripcion: e.target.value })}
                            className="mt-1 w-full rounded border border-gray-300 p-2 text-gray-900"
                            placeholder="Detalles adicionales..."
                        ></textarea>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="cursor-pointer px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="cursor-pointer px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition disabled:opacity-50"
                        >
                            {loading ? 'Guardando...' : 'Guardar Evento'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
