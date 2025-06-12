import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './contexts/AppContext';
import { LoginCliente } from './components/auth/LoginCliente';
import { LoginAdmin } from './components/auth/LoginAdmin';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { SelectorTipoPersona } from './components/SelectorTipoPersona';
import { FormularioPersonaFisica } from './components/forms/FormularioPersonaFisica';
import { FormularioPersonaMoral } from './components/forms/FormularioPersonaMoral';
import { Toaster } from './components/ui/sonner';
import { 
  TipoPersona, 
  FormularioPersonaFisica as TFormularioPersonaFisica,
  FormularioPersonaMoral as TFormularioPersonaMoral,
  SolicitudCredito 
} from './types';
import { generarPDFSolicitud, descargarPDF } from './utils/pdf';
import { toast } from 'sonner';

// Componente para manejar el hash de la URL
function useHashNavigation() {
  const [currentHash, setCurrentHash] = useState(window.location.hash);

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentHash(window.location.hash);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return currentHash;
}

// Componente principal de la aplicación
function AppContent() {
  const { state, actions } = useApp();
  const [tipoPersonaSeleccionado, setTipoPersonaSeleccionado] = useState<TipoPersona | null>(null);
  const [mostrandoFormulario, setMostrandoFormulario] = useState(false);
  const hash = useHashNavigation();

  // Cargar datos iniciales de ejemplo si no hay clientes en la BD
  useEffect(() => {
    if (state.admin.clientesDatabase.length === 0) {
      // Cargar datos de ejemplo
      fetch('/data/clientes_ejemplo.json')
        .then(response => response.json())
        .then(data => {
          // Simular cargar desde Excel usando los datos JSON
          const mockFile = new File([JSON.stringify(data)], 'example.json');
          actions.cargarClientesDesdeExcel(mockFile);
        })
        .catch(error => {
          console.error('Error cargando datos de ejemplo:', error);
        });
    }
  }, [state.admin.clientesDatabase.length, actions]);

  // Manejar envío de formulario
  const handleSubmitFormulario = async (
    formulario: TFormularioPersonaFisica | TFormularioPersonaMoral,
    archivos: File[]
  ) => {
    try {
      // Generar folio único
      const folio = `TM-${Date.now()}`;
      
      // Simular URLs de archivos (en producción serían URLs de Cloudinary)
      const archivosUrls = archivos.map((archivo, index) => 
        `archivo_${folio}_${index + 1}_${archivo.name}`
      );

      // Crear solicitud
      const solicitud: SolicitudCredito = {
        id: `solicitud-${Date.now()}`,
        folio,
        tipoPersona: tipoPersonaSeleccionado!,
        cliente: state.clienteAutenticado!,
        formulario,
        archivos: archivosUrls,
        fechaCreacion: new Date(),
        estado: 'PENDIENTE'
      };

      // Generar PDF
      const pdfBytes = await generarPDFSolicitud(
        state.clienteAutenticado!,
        formulario,
        tipoPersonaSeleccionado!,
        folio,
        archivosUrls
      );

      // Descargar PDF
      descargarPDF(pdfBytes, `solicitud_credito_${folio}.pdf`);

      // Guardar solicitud
      actions.agregarSolicitud(solicitud);

      // Simular envío de email (en producción usaría Resend)
      console.log('Email enviado a ijimenez@tubosmonterrey.com.mx', {
        folio,
        cliente: state.clienteAutenticado!.nombreSN,
        archivos: archivosUrls
      });

      toast.success(
        `Solicitud enviada exitosamente. Folio: ${folio}. Se ha descargado un PDF con los detalles.`,
        { duration: 10000 }
      );

      // Resetear estado
      setMostrandoFormulario(false);
      setTipoPersonaSeleccionado(null);
      
    } catch (error) {
      console.error('Error enviando solicitud:', error);
      toast.error('Error al enviar la solicitud. Por favor intente nuevamente.');
      throw error;
    }
  };

  // Manejar cancelación de formulario
  const handleCancelFormulario = () => {
    if (confirm('¿Está seguro de cancelar? Se perderán todos los datos ingresados.')) {
      setMostrandoFormulario(false);
      setTipoPersonaSeleccionado(null);
    }
  };

  // Manejar selección de tipo de persona
  const handleSeleccionarTipoPersona = (tipo: TipoPersona) => {
    setTipoPersonaSeleccionado(tipo);
    setMostrandoFormulario(true);
  };

  // Determinar qué componente mostrar
  if (hash === '#admin') {
    if (state.admin.isAuthenticated) {
      return <AdminDashboard />;
    } else {
      return <LoginAdmin />;
    }
  }

  // Flujo de clientes
  if (!state.isClienteLoggedIn) {
    return <LoginCliente />;
  }

  if (mostrandoFormulario && tipoPersonaSeleccionado && state.clienteAutenticado) {
    if (tipoPersonaSeleccionado === 'FISICA') {
      return (
        <FormularioPersonaFisica
          cliente={state.clienteAutenticado}
          onSubmit={handleSubmitFormulario}
          onCancel={handleCancelFormulario}
        />
      );
    } else {
      return (
        <FormularioPersonaMoral
          cliente={state.clienteAutenticado}
          onSubmit={handleSubmitFormulario}
          onCancel={handleCancelFormulario}
        />
      );
    }
  }

  if (state.clienteAutenticado) {
    return (
      <SelectorTipoPersona
        cliente={state.clienteAutenticado}
        onSeleccionar={handleSeleccionarTipoPersona}
      />
    );
  }

  return <LoginCliente />;
}

// Componente principal con Provider
function App() {
  return (
    <AppProvider>
      <div className="min-h-screen bg-gray-50">
        <AppContent />
        <Toaster />
      </div>
    </AppProvider>
  );
}

export default App;
