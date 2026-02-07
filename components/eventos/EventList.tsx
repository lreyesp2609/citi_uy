'use client';

import { useState } from 'react';
import { Evento } from '@/lib/api/eventos'; // or service/interface

interface EventListProps {
    eventos: Evento[];
    loading: boolean;
    esLider: boolean; // if true, can request approval
    esPastor: boolean; // if true, can approve/reject
    onEdit: (evento: Evento) => void;
    onCancel: (evento: Evento) => void;
    onRequestApproval: (evento: Evento) => void;
    onApproveReject: (evento: Evento) => void; // Opens modal
}

export default function EventList({
    eventos,
    loading,
    esLider,
    esPastor,
    onEdit,
    onCancel,
    onRequestApproval,
    onApproveReject
}: EventListProps) {

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('es-ES', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    const getStatusBadge = (estado: string) => {
        switch (estado) {
            case 'APROBADO':
                return <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Aprobado</span>;
            case 'PENDIENTE':
                return <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Pendiente</span>;
            case 'EN_REVISION':
                return <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">En Revisión</span>;
            case 'RECHAZADO':
                return <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">Rechazado</span>;
            case 'CANCELADO':
                return <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Cancelado</span>;
            default:
                return <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{estado}</span>;
        }
    };

    if (loading) {
        return (
            <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-2"></div>
                <p className="text-gray-500">Cargando eventos...</p>
            </div>
        );
    }

    if (eventos.length === 0) {
        return (
            <div className="text-center py-8 bg-white rounded-lg border border-dashed border-gray-300">
                <p className="text-gray-500">No hay eventos registrados.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            <ul className="divide-y divide-gray-200">
                {eventos.map((evento) => (
                    <li key={evento.id_evento} className="p-4 hover:bg-gray-50 transition">
                        <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <h4 className="text-lg font-semibold text-gray-900 truncate">{evento.nombre}</h4>
                                    {getStatusBadge(evento.estado)}
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-center text-sm text-gray-500 gap-y-1 gap-x-4 mb-2">
                                    <div className="flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <span>{formatDate(evento.fecha_inicio)}</span>
                                    </div>
                                    {evento.ubicacion && (
                                        <div className="flex items-center gap-1">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            <span>{evento.ubicacion}</span>
                                        </div>
                                    )}
                                </div>
                                {evento.descripcion && (
                                    <p className="text-sm text-gray-600 line-clamp-2">{evento.descripcion}</p>
                                )}
                                {evento.motivo_rechazo && evento.estado === 'RECHAZADO' && (
                                    <p className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded">
                                        <strong>Motivo rechazo:</strong> {evento.motivo_rechazo}
                                    </p>
                                )}
                            </div>

                            <div className="ml-4 flex flex-col items-end gap-2">
                                {/* Actions */}
                                <div className="flex gap-2">
                                    {(evento.estado === 'PENDIENTE' || evento.estado === 'EN_REVISION') && (
                                        <button
                                            onClick={() => onEdit(evento)}
                                            className="cursor-pointer text-blue-600 hover:text-blue-800 text-sm font-medium"
                                            title="Editar"
                                        >
                                            Editar
                                        </button>
                                    )}

                                    {evento.estado !== 'CANCELADO' && evento.estado !== 'RECHAZADO' && (
                                        <button
                                            onClick={() => onCancel(evento)}
                                            className="cursor-pointer text-red-600 hover:text-red-800 text-sm font-medium"
                                            title="Cancelar"
                                        >
                                            Cancelar
                                        </button>
                                    )}
                                </div>

                                <div className="flex gap-2 mt-2">
                                    {esLider && evento.estado === 'PENDIENTE' && (
                                        <button
                                            onClick={() => onRequestApproval(evento)}
                                            className="cursor-pointer px-3 py-1 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700 transition"
                                        >
                                            Enviar a Revisión
                                        </button>
                                    )}

                                    {esPastor && evento.estado === 'EN_REVISION' && (
                                        <button
                                            onClick={() => onApproveReject(evento)}
                                            className="cursor-pointer px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition"
                                        >
                                            Revisar
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
