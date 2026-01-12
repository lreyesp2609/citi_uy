// components/miembros/FormPersona.tsx
'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { personasService, Persona } from '@/lib/services/personasService';

interface FormPersonaProps {
  persona?: Persona; // Si existe, es edición; si no, es creación
  onSuccess: () => void;
  onCancel: () => void;
}

function FormPersonaContent({ persona, onSuccess, onCancel }: FormPersonaProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const isEditing = !!persona; // true si estamos editando

  const [formData, setFormData] = useState({
    nombres: persona?.nombres || '',
    apellidos: persona?.apellidos || '',
    numero_cedula: persona?.numero_cedula || '',
    correo_electronico: persona?.correo_electronico || '',
    genero: persona?.genero || '',
    fecha_nacimiento: persona?.fecha_nacimiento || '',
    nivel_estudio: persona?.nivel_estudio || '',
    nacionalidad: persona?.nacionalidad || '',
    profesion: persona?.profesion || '',
    estado_civil: persona?.estado_civil || '',
    lugar_trabajo: persona?.lugar_trabajo || '',
    celular: persona?.celular || '',
    direccion: persona?.direccion || '',
  });

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
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onCancel]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!formData.nombres.trim() || !formData.apellidos.trim()) {
        setError('Nombres y Apellidos son obligatorios');
        setLoading(false);
        return;
      }

      let result;
      
      if (isEditing && persona) {
        // Actualizar persona existente
        result = await personasService.update(persona.id_persona, formData);
      } else {
        // Crear nueva persona
        result = await personasService.create(formData as Omit<Persona, 'id_persona'>);
      }

      if (result.success) {
        console.log(`✅ Persona ${isEditing ? 'actualizada' : 'creada'} exitosamente`);
        onSuccess();
      } else {
        setError(result.message || `Error al ${isEditing ? 'actualizar' : 'crear'} persona`);
      }
    } catch (err: any) {
      setError(err.message || 'Error inesperado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] overflow-y-auto"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={onCancel}
    >
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="bg-white rounded-lg shadow-2xl max-w-4xl w-full my-8"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-lg z-10">
            <h2 className="text-2xl font-bold text-gray-800">
              {isEditing ? 'Editar Persona' : 'Nueva Persona'}
            </h2>
            <button
              onClick={onCancel}
              type="button"
              className="cursor-pointer text-gray-400 hover:text-gray-600 transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form */}
          <div className="max-h-[calc(90vh-100px)] overflow-y-auto">
            <form onSubmit={handleSubmit} className="p-6">
              {error && (
                <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nombres */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombres <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="nombres"
                    value={formData.nombres}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900"
                  />
                </div>

                {/* Apellidos */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Apellidos <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="apellidos"
                    value={formData.apellidos}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900"
                  />
                </div>

                {/* Número de Cédula */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número de Cédula
                  </label>
                  <input
                    type="text"
                    name="numero_cedula"
                    value={formData.numero_cedula}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900"
                  />
                </div>

                {/* Género */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Género
                  </label>
                  <select
                    name="genero"
                    value={formData.genero}
                    onChange={handleChange}
                    className="cursor-pointer w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900"
                  >
                    <option value="" className="cursor-pointer">Seleccionar...</option>
                    <option value="Masculino" className="cursor-pointer">Masculino</option>
                    <option value="Femenino" className="cursor-pointer">Femenino</option>
                  </select>
                </div>

                {/* Fecha de Nacimiento */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Nacimiento
                  </label>
                  <input
                    type="date"
                    name="fecha_nacimiento"
                    value={formData.fecha_nacimiento}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900"
                  />
                </div>

                {/* Celular */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Celular
                  </label>
                  <input
                    type="tel"
                    name="celular"
                    value={formData.celular}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900"
                  />
                </div>

                {/* Correo Electrónico */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    name="correo_electronico"
                    value={formData.correo_electronico}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900"
                  />
                </div>

                {/* Estado Civil */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado Civil
                  </label>
                  <select
                    name="estado_civil"
                    value={formData.estado_civil}
                    onChange={handleChange}
                    className="cursor-pointer w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900"
                  >
                    <option value="" className="cursor-pointer">Seleccionar...</option>
                    <option value="Soltero/a" className="cursor-pointer">Soltero/a</option>
                    <option value="Casado/a" className="cursor-pointer">Casado/a</option>
                    <option value="Divorciado/a" className="cursor-pointer">Divorciado/a</option>
                    <option value="Viudo/a" className="cursor-pointer">Viudo/a</option>
                    <option value="Unión Libre" className="cursor-pointer">Unión Libre</option>
                  </select>
                </div>

                {/* Nacionalidad */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nacionalidad
                  </label>
                  <input
                    type="text"
                    name="nacionalidad"
                    value={formData.nacionalidad}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900"
                  />
                </div>

                {/* Nivel de Estudio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nivel de Estudio
                  </label>
                  <select
                    name="nivel_estudio"
                    value={formData.nivel_estudio}
                    onChange={handleChange}
                    className="cursor-pointer w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900"
                  >
                    <option value="" className="cursor-pointer">Seleccionar...</option>
                    <option value="Primaria" className="cursor-pointer">Primaria</option>
                    <option value="Secundaria" className="cursor-pointer">Secundaria</option>
                    <option value="Técnico" className="cursor-pointer">Técnico</option>
                    <option value="Universitario" className="cursor-pointer">Universitario</option>
                    <option value="Postgrado" className="cursor-pointer">Postgrado</option>
                  </select>
                </div>

                {/* Profesión */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Profesión
                  </label>
                  <input
                    type="text"
                    name="profesion"
                    value={formData.profesion}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900"
                  />
                </div>

                {/* Lugar de Trabajo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lugar de Trabajo
                  </label>
                  <input
                    type="text"
                    name="lugar_trabajo"
                    value={formData.lugar_trabajo}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900"
                  />
                </div>

                {/* Dirección */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dirección
                  </label>
                  <textarea
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900"
                  />
                </div>
              </div>

              {/* Botones */}
              <div className="mt-6 flex items-center justify-end gap-4 border-t pt-4">
                <button
                  type="button"
                  onClick={onCancel}
                  disabled={loading}
                  className="cursor-pointer px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="cursor-pointer px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {isEditing ? 'Actualizando...' : 'Guardando...'}
                    </>
                  ) : (
                    isEditing ? 'Actualizar Persona' : 'Registrar Persona'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FormPersona(props: FormPersonaProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <FormPersonaContent {...props} />,
    document.body
  );
}