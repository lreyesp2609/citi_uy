// components/dashboard/miembros/VerPersona.tsx
'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Persona } from '@/lib/services/personasService';

interface VerPersonaProps {
  persona: Persona;
  onClose: () => void;
}

function VerPersonaContent({ persona, onClose }: VerPersonaProps) {
  // Bloquear scroll del body
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  // Cerrar con ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // Función para formatear fecha
  const formatearFecha = (fecha: string | null) => {
    if (!fecha) return '-';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-EC', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Calcular edad si hay fecha de nacimiento
  const calcularEdad = (fecha: string | null) => {
    if (!fecha) return null;
    const hoy = new Date();
    const nacimiento = new Date(fecha);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  };

  const edad = calcularEdad(persona.fecha_nacimiento);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - FIJO */}
        <div className="bg-gradient-to-r from-red-700 to-red-600 text-white px-6 py-4 flex items-center justify-between rounded-t-lg flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
              {persona.nombres.charAt(0)}{persona.apellidos.charAt(0)}
            </div>
            <div>
              <h2 className="text-2xl font-bold">
                {persona.nombres} {persona.apellidos}
              </h2>
              <p className="text-red-100 text-sm">
                {persona.numero_cedula || 'Sin cédula'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="cursor-pointer text-white/80 hover:text-white transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Contenido - SCROLLABLE */}
        <div className="overflow-y-auto flex-1 p-6">
          {/* Información Personal */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b-2 border-red-500">
              Información Personal
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-xs text-gray-500 font-medium uppercase">Nombres</p>
                <p className="text-sm text-gray-900 font-semibold mt-1">{persona.nombres}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-xs text-gray-500 font-medium uppercase">Apellidos</p>
                <p className="text-sm text-gray-900 font-semibold mt-1">{persona.apellidos}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-xs text-gray-500 font-medium uppercase">Cédula</p>
                <p className="text-sm text-gray-900 font-semibold mt-1">{persona.numero_cedula || '-'}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-xs text-gray-500 font-medium uppercase">Género</p>
                <p className="text-sm text-gray-900 font-semibold mt-1">{persona.genero || '-'}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-xs text-gray-500 font-medium uppercase">Fecha de Nacimiento</p>
                <p className="text-sm text-gray-900 font-semibold mt-1">
                  {formatearFecha(persona.fecha_nacimiento)}
                  {edad && <span className="text-gray-500 ml-2">({edad} años)</span>}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-xs text-gray-500 font-medium uppercase">Estado Civil</p>
                <p className="text-sm text-gray-900 font-semibold mt-1">{persona.estado_civil || '-'}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-xs text-gray-500 font-medium uppercase">Nacionalidad</p>
                <p className="text-sm text-gray-900 font-semibold mt-1">{persona.nacionalidad || '-'}</p>
              </div>
            </div>
          </div>

          {/* Información de Contacto */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b-2 border-red-500">
              Información de Contacto
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-xs text-gray-500 font-medium uppercase">Correo Electrónico</p>
                <p className="text-sm text-gray-900 font-semibold mt-1 break-all">
                  {persona.correo_electronico || '-'}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-xs text-gray-500 font-medium uppercase">Celular</p>
                <p className="text-sm text-gray-900 font-semibold mt-1">{persona.celular || '-'}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg md:col-span-2">
                <p className="text-xs text-gray-500 font-medium uppercase">Dirección</p>
                <p className="text-sm text-gray-900 font-semibold mt-1">{persona.direccion || '-'}</p>
              </div>
            </div>
          </div>

          {/* Información Académica y Laboral */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b-2 border-red-500">
              Información Académica y Laboral
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-xs text-gray-500 font-medium uppercase">Nivel de Estudio</p>
                <p className="text-sm text-gray-900 font-semibold mt-1">{persona.nivel_estudio || '-'}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-xs text-gray-500 font-medium uppercase">Profesión</p>
                <p className="text-sm text-gray-900 font-semibold mt-1">{persona.profesion || '-'}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg md:col-span-2">
                <p className="text-xs text-gray-500 font-medium uppercase">Lugar de Trabajo</p>
                <p className="text-sm text-gray-900 font-semibold mt-1">{persona.lugar_trabajo || '-'}</p>
              </div>
            </div>
          </div>

          {/* Información del Sistema (si tiene rol) */}
          {persona.rol && (
            <div className="mb-4">
              <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b-2 border-red-500">
                Información del Sistema
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-xs text-gray-500 font-medium uppercase">Rol Asignado</p>
                <div className="mt-2">
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    persona.rol.toLowerCase() === 'pastor'
                      ? 'bg-purple-100 text-purple-800'
                      : persona.rol.toLowerCase() === 'líder' || persona.rol.toLowerCase() === 'lider'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {persona.rol}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer - FIJO */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg flex justify-end flex-shrink-0">
          <button
            onClick={onClose}
            className="cursor-pointer px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

export default function VerPersona(props: VerPersonaProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <VerPersonaContent {...props} />,
    document.body
  );
}