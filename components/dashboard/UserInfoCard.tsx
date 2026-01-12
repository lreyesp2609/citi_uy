// components/dashboard/UserInfoCard.tsx
'use client';

interface User {
  usuario: string;
  nombre: string;
  correo?: string;
  cedula?: string;
  celular?: string;
  direccion?: string;
  genero?: string;
  profesion?: string;
  nivel_estudio?: string;
  rol: string;
}

interface UserInfoCardProps {
  user: User;
}

export default function UserInfoCard({ user }: UserInfoCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6 mb-8">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Mi Información</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-500">Usuario</p>
          <p className="font-medium text-gray-800">{user.usuario}</p>
        </div>
        {user.correo && (
          <div>
            <p className="text-sm text-gray-500">Correo</p>
            <p className="font-medium text-gray-800">{user.correo}</p>
          </div>
        )}
        {user.cedula && (
          <div>
            <p className="text-sm text-gray-500">Cédula</p>
            <p className="font-medium text-gray-800">{user.cedula}</p>
          </div>
        )}
        {user.celular && (
          <div>
            <p className="text-sm text-gray-500">Celular</p>
            <p className="font-medium text-gray-800">{user.celular}</p>
          </div>
        )}
        {user.direccion && (
          <div>
            <p className="text-sm text-gray-500">Dirección</p>
            <p className="font-medium text-gray-800">{user.direccion}</p>
          </div>
        )}
        {user.genero && (
          <div>
            <p className="text-sm text-gray-500">Género</p>
            <p className="font-medium text-gray-800">{user.genero}</p>
          </div>
        )}
        {user.profesion && (
          <div>
            <p className="text-sm text-gray-500">Profesión</p>
            <p className="font-medium text-gray-800">{user.profesion}</p>
          </div>
        )}
        {user.nivel_estudio && (
          <div>
            <p className="text-sm text-gray-500">Nivel de Estudio</p>
            <p className="font-medium text-gray-800">{user.nivel_estudio}</p>
          </div>
        )}
      </div>
    </div>
  );
}