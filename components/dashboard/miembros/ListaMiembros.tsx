// components/dashboard/miembros/ListaMiembros.tsx
'use client';

import { useState, useEffect } from 'react';
import { personasService, Persona } from '@/lib/services/personasService';
import FormPersona from '@/components/dashboard/miembros/FormPersona';
import VerPersona from '@/components/dashboard/miembros/VerPersona';

interface ListaMiembrosProps {
  userRole: string;
}

export default function ListaMiembros({ userRole }: ListaMiembrosProps) {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [filteredPersonas, setFilteredPersonas] = useState<Persona[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Estados para los modales
  const [personaToEdit, setPersonaToEdit] = useState<Persona | undefined>();
  const [personaToView, setPersonaToView] = useState<Persona | undefined>();
  const [showEditForm, setShowEditForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);

  const handleEdit = (persona: Persona) => {
    setPersonaToEdit(persona);
    setShowEditForm(true);
  };

  const handleView = (persona: Persona) => {
    setPersonaToView(persona);
    setShowViewModal(true);
  };

  useEffect(() => {
    cargarPersonas();
  }, []);

  useEffect(() => {
    // Filtrar personas cuando cambia el término de búsqueda
    if (searchTerm.trim() === '') {
      setFilteredPersonas(personas);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = personas.filter(persona =>
        persona.nombres.toLowerCase().includes(term) ||
        persona.apellidos.toLowerCase().includes(term) ||
        persona.numero_cedula.includes(term) ||
        persona.correo_electronico?.toLowerCase().includes(term)
      );
      setFilteredPersonas(filtered);
    }
    setCurrentPage(1);
  }, [searchTerm, personas]);

  const cargarPersonas = async () => {
    setLoading(true);
    setError('');

    try {
      const result = await personasService.getAll();

      if (result.success && result.data) {
        setPersonas(result.data);
        setFilteredPersonas(result.data);
        console.log('✅ Personas cargadas:', result.total);
      } else {
        setError(result.message || 'Error al cargar personas');
      }
    } catch (err: any) {
      setError(err.message || 'Error inesperado');
    } finally {
      setLoading(false);
    }
  };

  // Paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPersonas.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPersonas.length / itemsPerPage);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          <span className="ml-3 text-gray-600">Cargando miembros...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
            <button
              onClick={cargarPersonas}
              className="cursor-pointer mt-2 text-sm text-red-600 hover:text-red-800 font-medium"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow">
        {/* Barra de búsqueda y filtros */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar por nombre, cédula o correo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                />
                <svg
                  className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            <button
              onClick={cargarPersonas}
              className="cursor-pointer px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
          <div className="mt-2 text-sm text-gray-600">
            Mostrando {currentItems.length} de {filteredPersonas.length} miembros
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cédula
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombres
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Apellidos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Correo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Celular
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentItems.map((persona) => (
                <tr key={persona.id_persona} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    {persona.numero_cedula}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {persona.nombres}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {persona.apellidos}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {persona.correo_electronico || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {persona.celular || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleView(persona)}
                      className="cursor-pointer text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Ver
                    </button>
                    {(userRole.toLowerCase() === 'pastor' || userRole.toLowerCase() === 'lider') && (
                      <button
                        onClick={() => handleEdit(persona)}
                        className="cursor-pointer text-red-600 hover:text-red-900"
                      >
                        Editar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Sin resultados */}
        {currentItems.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="mt-2 text-sm text-gray-500">
              {searchTerm ? 'No se encontraron resultados' : 'No hay miembros registrados'}
            </p>
          </div>
        )}

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="cursor-pointer px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <span className="text-sm text-gray-700">
              Página {currentPage} de {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="cursor-pointer px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        )}
      </div>

      {/* Modal de Visualización */}
      {showViewModal && personaToView && (
        <VerPersona
          persona={personaToView}
          onClose={() => {
            setShowViewModal(false);
            setPersonaToView(undefined);
          }}
        />
      )}

      {/* Formulario de Edición */}
      {showEditForm && personaToEdit && (
        <FormPersona
          persona={personaToEdit}
          onSuccess={() => {
            setShowEditForm(false);
            setPersonaToEdit(undefined);
            cargarPersonas();
          }}
          onCancel={() => {
            setShowEditForm(false);
            setPersonaToEdit(undefined);
          }}
        />
      )}
    </>
  );
}