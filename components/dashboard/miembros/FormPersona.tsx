// components/miembros/FormPersona.tsx
'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { personasService, Persona } from '@/lib/services/personasService';
import Toast from '@/components/ui/Toast';

interface FormPersonaProps {
  persona?: Persona; // Si existe, es edición; si no, es creación
  onSuccess: () => void;
  onCancel: () => void;
}

interface ToastState {
  show: boolean;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
}

function FormPersonaContent({ persona, onSuccess, onCancel }: FormPersonaProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const isEditing = !!persona; // true si estamos editando

  const [toast, setToast] = useState<ToastState>({
    show: false,
    type: 'info',
    title: '',
    message: ''
  });

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

  const showToast = (type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) => {
    setToast({ show: true, type, title, message });
  };

  const calculateAge = (birthDate: string): number => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validación de campos obligatorios
      if (!formData.nombres.trim() || !formData.apellidos.trim()) {
        const errorMsg = 'Los campos Nombres y Apellidos son obligatorios';
        setError(errorMsg);
        showToast('error', 'Campos requeridos', errorMsg);
        setLoading(false);
        return;
      }

      // Validación de edad mínima (18 años)
      if (formData.fecha_nacimiento) {
        const age = calculateAge(formData.fecha_nacimiento);
        
        if (age < 18) {
          const errorMsg = `La persona debe ser mayor de 18 años. Edad actual: ${age} años`;
          setError(errorMsg);
          showToast('error', 'Edad no válida', errorMsg);
          setLoading(false);
          return;
        }
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
        showToast(
          'success',
          isEditing ? 'Persona actualizada' : 'Persona registrada',
          isEditing 
            ? 'Los datos de la persona han sido actualizados correctamente'
            : 'La persona ha sido registrada exitosamente'
        );
        
        // Esperar un momento para que el usuario vea el toast antes de cerrar
        setTimeout(() => {
          onSuccess();
        }, 1500);
      } else {
        // Traducir mensajes técnicos a lenguaje más amigable
        let userFriendlyMessage = result.message || 'Ocurrió un error inesperado';
        
        // Mejorar mensajes comunes de error
        if (userFriendlyMessage.includes('cédula')) {
          userFriendlyMessage = 'Ya existe una persona registrada con este número de cédula';
        } else if (userFriendlyMessage.includes('correo')) {
          userFriendlyMessage = 'Este correo electrónico ya está registrado';
        } else if (userFriendlyMessage.includes('celular')) {
          userFriendlyMessage = 'Este número de celular ya está registrado';
        } else if (userFriendlyMessage.includes('duplicado') || userFriendlyMessage.includes('existe')) {
          userFriendlyMessage = 'Ya existe una persona con estos datos';
        }
        
        setError(userFriendlyMessage);
        showToast('error', 'Error al guardar', userFriendlyMessage);
      }
    } catch (err: any) {
      const errorMsg = 'Ocurrió un error inesperado. Por favor, intenta nuevamente';
      setError(errorMsg);
      showToast('error', 'Error', errorMsg);
      console.error('Error en formulario:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {toast.show && (
        <Toast
          type={toast.type}
          title={toast.title}
          message={toast.message}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}
      
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
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-red-700">{error}</p>
                      </div>
                    </div>
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
                      placeholder="Ej: Juan Carlos"
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
                      placeholder="Ej: Pérez González"
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
                      placeholder="Ej: 1234567890"
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
                      Fecha de Nacimiento <span className="text-xs text-gray-500">(Debe ser mayor de 18 años)</span>
                    </label>
                    <input
                      type="date"
                      name="fecha_nacimiento"
                      value={formData.fecha_nacimiento}
                      onChange={handleChange}
                      max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
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
                      placeholder="Ej: 0987654321"
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
                      placeholder="Ej: ejemplo@correo.com"
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
                      placeholder="Ej: Ecuatoriana"
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
                      placeholder="Ej: Ingeniero"
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
                      placeholder="Ej: Empresa XYZ"
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
                      placeholder="Ej: Calle Principal y Secundaria"
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
    </>
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