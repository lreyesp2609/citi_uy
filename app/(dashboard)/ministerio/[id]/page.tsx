'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { ministeriosService, Ministerio } from '@/lib/services/ministeriosService';
import { eventosService, Evento } from '@/lib/services/eventosService';
import EventList from '@/components/eventos/EventList';
import EventForm from '@/components/eventos/EventForm';
import EventApprovalModal from '@/components/eventos/EventApprovalModal';
import Toast from '@/components/ui/Toast';

interface ToastData {
    type: 'success' | 'error' | 'info' | 'warning';
    title: string;
    message: string;
}

export default function MinisterioDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    // Unwrap params using React.use() or await if in async component, but this is client component so we use the hook pattern or await in effect if needed, 
    // actually in Next 15 `params` is a Promise.
    // We need to unwrap it.
    const resolvedParams = use(params);
    const idMinisterio = parseInt(resolvedParams.id);

    const [ministerio, setMinisterio] = useState<Ministerio | null>(null);
    const [eventos, setEventos] = useState<Evento[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // UI States
    const [showEventForm, setShowEventForm] = useState(false);
    const [editingEvent, setEditingEvent] = useState<Evento | undefined>(undefined);
    const [approvalEvent, setApprovalEvent] = useState<Evento | undefined>(undefined);
    const [toast, setToast] = useState<ToastData | null>(null);

    const esPastor = user?.rol?.toLowerCase() === 'pastor';
    const esLider = user?.rol?.toLowerCase() === 'lider' || user?.rol?.toLowerCase() === 'líder'; // Handle accent just in case

    // Check if user is leader OF THIS ministry might be a good check, but for now we assume generic Roles.
    // In a real app we'd check `ministerio.lideres.includes(user.id)`.

    useEffect(() => {
        if (!authLoading) {
            if (!user) {
                router.push('/');
            } else {
                loadData();
            }
        }
    }, [authLoading, user, idMinisterio]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [minResult, evResult] = await Promise.all([
                ministeriosService.getById(idMinisterio),
                eventosService.getByMinisterio(idMinisterio)
            ]);

            if (minResult.success && minResult.data) {
                setMinisterio(minResult.data);
            } else {
                setError(minResult.message || 'Error al cargar ministerio');
            }

            if (evResult.success && evResult.data) {
                setEventos(evResult.data);
            }
        } catch (err: any) {
            setError(err.message || 'Error inesperado');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateEvent = async (data: any) => {
        // If pastor creates, maybe auto-approve? The plan said "creates as Pendiente" strictly. 
        // We'll stick to service creation which defaults to PENDIENTE unless service changes it.
        // Actually, backend defaults to PENDIENTE.
        // If Pastor is creating, maybe we WANT to pass estado='APROBADO'? 
        // For now, let's respect the base flow: Create -> Pendiente.

        // UPDATE: If pastor, we might want to auto-approve. Let's send it as PENDIENTE and then maybe auto-approve?
        // Or just create. The requirements say: Postcondition "Pendiente de Aprobación".

        return await eventosService.create(data);
    };

    const handleUpdateEvent = async (data: any) => {
        if (!editingEvent) return;
        return await eventosService.update(editingEvent.id_evento, data);
    };

    const handleCancelEvent = async (evento: Evento) => {
        if (!confirm('¿Estás seguro de cancelar este evento? Esta acción no se puede deshacer.')) return;

        const result = await eventosService.cancel(evento.id_evento);
        if (result.success) {
            setToast({ type: 'success', title: 'Evento Cancelado', message: 'El evento ha sido cancelado.' });
            loadData();
        } else {
            setToast({ type: 'error', title: 'Error', message: result.message || 'No se pudo cancelar el evento' });
        }
    };

    const handleRequestApproval = async (evento: Evento) => {
        const result = await eventosService.changeEstado(evento.id_evento, 'EN_REVISION');
        if (result.success) {
            setToast({ type: 'success', title: 'Solicitud Enviada', message: 'El evento está ahora en revisión.' });
            loadData();
        } else {
            setToast({ type: 'error', title: 'Error', message: result.message || 'Error al solicitar aprobación' });
        }
    };

    const handleApproveReject = async (approve: boolean, motivo?: string) => {
        if (!approvalEvent) return;

        const nuevoEstado = approve ? 'APROBADO' : 'RECHAZADO';
        const result = await eventosService.changeEstado(approvalEvent.id_evento, nuevoEstado, motivo);

        if (result.success) {
            setToast({
                type: 'success',
                title: approve ? 'Evento Aprobado' : 'Evento Rechazado',
                message: approve ? 'El evento es visible para todos.' : 'El evento ha sido rechazado.'
            });
            setApprovalEvent(undefined);
            loadData();
        } else {
            setToast({ type: 'error', title: 'Error', message: result.message || 'Error al procesar la solicitud' });
        }
    };

    if (authLoading || loading) {
        return (
            <DashboardLayout>
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
                </div>
            </DashboardLayout>
        );
    }

    if (!ministerio) {
        return (
            <DashboardLayout>
                <div className="p-4 bg-red-50 text-red-700 rounded-lg">
                    No se encontró el ministerio o no tienes permiso para verlo.
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header Ministerio */}
                <div className="bg-white rounded-lg shadow p-6 flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => router.back()}
                                className="cursor-pointer text-gray-400 hover:text-gray-600"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                            </button>
                            <h1 className="text-2xl font-bold text-gray-800">{ministerio.nombre}</h1>
                        </div>
                        {ministerio.descripcion && (
                            <p className="mt-2 text-gray-600 ml-9">{ministerio.descripcion}</p>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${ministerio.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {ministerio.activo ? 'Activo' : 'Inactivo'}
                        </span>
                    </div>
                </div>

                {/* Sección Eventos */}
                {/* Sección Eventos */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold text-gray-800">Eventos Programados</h2>

                        {/* Permission Logic: 
                            1. Must have leaders assigned.
                            2. User must be an assigned leader.
                        */}
                        {ministerio.lideres && ministerio.lideres.length > 0 ? (
                            (ministerio.lideres.some(l => l.id_usuario === user?.id) || esPastor) && (
                                <button
                                    onClick={() => setShowEventForm(true)}
                                    className="cursor-pointer bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition flex items-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    Crear Evento
                                </button>
                            )
                        ) : (
                            <div className="text-sm text-amber-600 bg-amber-50 px-3 py-1 rounded-md border border-amber-200">
                                ⚠ Este ministerio necesita líderes asignados para gestionar eventos.
                            </div>
                        )}
                    </div>

                    <EventList
                        eventos={eventos}
                        loading={false}
                        esLider={esLider}
                        esPastor={esPastor}
                        onEdit={(ev) => { setEditingEvent(ev); setShowEventForm(true); }}
                        onCancel={handleCancelEvent}
                        onRequestApproval={handleRequestApproval}
                        onApproveReject={(ev) => setApprovalEvent(ev)}
                    />
                </div>

                {/* Forms & Modals */}
                {showEventForm && (
                    <EventForm
                        ministerioId={idMinisterio}
                        evento={editingEvent}
                        onCancel={() => { setShowEventForm(false); setEditingEvent(undefined); }}
                        onSuccess={() => {
                            setShowEventForm(false);
                            setEditingEvent(undefined);
                            setToast({ type: 'success', title: 'Éxito', message: editingEvent ? 'Evento actualizado' : 'Evento creado' });
                            loadData();
                        }}
                        onSubmit={editingEvent ? handleUpdateEvent : handleCreateEvent}
                    />
                )}

                {approvalEvent && (
                    <EventApprovalModal
                        evento={approvalEvent}
                        onClose={() => setApprovalEvent(undefined)}
                        onApprove={() => handleApproveReject(true)}
                        onReject={(motivo) => handleApproveReject(false, motivo)}
                    />
                )}

                {toast && (
                    <Toast
                        type={toast.type}
                        title={toast.title}
                        message={toast.message}
                        onClose={() => setToast(null)}
                    />
                )}
            </div>
        </DashboardLayout>
    );
}
