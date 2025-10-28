import { PatientMap } from '@/components/maps/PatientMap';
import { SymptomsForm } from '@/components/patient/SymptomsForm';
import { Alert } from '@/components/ui/Alert';
import { useAuth } from '@/hooks/useAuth';
import { Clock, MapPin, Stethoscope } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PatientHome: React.FC = () => {
  const { firestoreUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleServiceRequest = async (serviceData: {
    symptoms: string;
    urgency: 'low' | 'medium' | 'high';
    location: {
      latitude: number;
      longitude: number;
      address: string;
    };
  }) => {
    setLoading(true);
    setError('');

    try {
      // Simular llamada a Cloud Function requestService
      // En producción, esto sería una llamada HTTP a tu Cloud Function
      const response = await fetch('/api/requestService', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...serviceData,
          patientId: firestoreUser?.uid,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al solicitar el servicio');
      }

      const { serviceId } = await response.json();

      // Redirección inmediata a la página de espera
      navigate(`/patient/request/${serviceId}/waiting`);
    } catch (err: any) {
      setError(err.message || 'Error al solicitar el servicio');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <div className='bg-white shadow-sm border-b border-gray-200'>
        <div className='px-4 py-4'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-xl font-semibold text-gray-900'>Hola, {firestoreUser?.profile?.name}</h1>
              <p className='text-sm text-gray-600'>¿Necesitas atención médica?</p>
            </div>
            <div className='flex items-center space-x-2 text-blue-600'>
              <Stethoscope className='h-5 w-5' />
              <span className='text-sm font-medium'>Medlink</span>
            </div>
          </div>
        </div>
      </div>

      <div className='px-4 py-6 space-y-6'>
        {/* Información rápida */}
        <div className='grid grid-cols-2 gap-4'>
          <div className='card text-center'>
            <MapPin className='h-8 w-8 text-blue-600 mx-auto mb-2' />
            <h3 className='font-medium text-gray-900'>Ubicación</h3>
            <p className='text-sm text-gray-600'>Detectada automáticamente</p>
          </div>
          <div className='card text-center'>
            <Clock className='h-8 w-8 text-green-600 mx-auto mb-2' />
            <h3 className='font-medium text-gray-900'>Tiempo</h3>
            <p className='text-sm text-gray-600'>Respuesta rápida</p>
          </div>
        </div>

        {/* Error Alert */}
        {error && <Alert type='error' message={error} />}

        {/* Mapa */}
        <div className='card p-0 overflow-hidden'>
          <div className='h-64'>
            <PatientMap
              onLocationSelect={(location) => {
                // El mapa puede permitir seleccionar ubicación manualmente
                console.log('Ubicación seleccionada:', location);
              }}
            />
          </div>
        </div>

        {/* Formulario de síntomas */}
        <div className='card'>
          <h2 className='text-lg font-semibold text-gray-900 mb-4'>Describe tus síntomas</h2>
          <SymptomsForm onSubmit={handleServiceRequest} loading={loading} />
        </div>

        {/* Información adicional */}
        <div className='card bg-blue-50 border-blue-200'>
          <h3 className='font-medium text-blue-900 mb-2'>💡 Consejos importantes</h3>
          <ul className='text-sm text-blue-800 space-y-1'>
            <li>• Describe tus síntomas con detalle</li>
            <li>• Selecciona la urgencia apropiada</li>
            <li>• Mantén tu ubicación actualizada</li>
            <li>• El doctor llegará en 15-30 minutos</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PatientHome;
