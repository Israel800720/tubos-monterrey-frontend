import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { Cliente, SolicitudCredito, User, AdminState } from '../types';

// Tipos para el contexto
interface AppState {
  // Estado de autenticación del cliente
  clienteAutenticado: Cliente | null;
  isClienteLoggedIn: boolean;
  
  // Estado de autenticación del admin
  admin: AdminState;
  
  // Estado de solicitudes
  solicitudes: SolicitudCredito[];
  
  // Estado de carga
  loading: boolean;
  error: string | null;
}

type AppAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'LOGIN_CLIENTE'; payload: Cliente }
  | { type: 'LOGOUT_CLIENTE' }
  | { type: 'LOGIN_ADMIN'; payload: User }
  | { type: 'LOGOUT_ADMIN' }
  | { type: 'SET_CLIENTES_DATABASE'; payload: Cliente[] }
  | { type: 'ADD_SOLICITUD'; payload: SolicitudCredito }
  | { type: 'UPDATE_SOLICITUD'; payload: { id: string; updates: Partial<SolicitudCredito> } }
  | { type: 'RESET_DATABASE' }
  | { type: 'LOAD_DATA' };

// Estado inicial
const initialState: AppState = {
  clienteAutenticado: null,
  isClienteLoggedIn: false,
  admin: {
    isAuthenticated: false,
    user: null,
    clientesDatabase: [],
    solicitudes: []
  },
  solicitudes: [],
  loading: false,
  error: null
};

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
      
    case 'SET_ERROR':
      return { ...state, error: action.payload };
      
    case 'LOGIN_CLIENTE':
      return {
        ...state,
        clienteAutenticado: action.payload,
        isClienteLoggedIn: true,
        error: null
      };
      
    case 'LOGOUT_CLIENTE':
      return {
        ...state,
        clienteAutenticado: null,
        isClienteLoggedIn: false
      };
      
    case 'LOGIN_ADMIN':
      return {
        ...state,
        admin: {
          ...state.admin,
          isAuthenticated: true,
          user: action.payload
        },
        error: null
      };
      
    case 'LOGOUT_ADMIN':
      return {
        ...state,
        admin: {
          ...initialState.admin
        }
      };
      
    case 'SET_CLIENTES_DATABASE':
      return {
        ...state,
        admin: {
          ...state.admin,
          clientesDatabase: action.payload
        }
      };
      
    case 'ADD_SOLICITUD':
      const newSolicitudes = [...state.solicitudes, action.payload];
      return {
        ...state,
        solicitudes: newSolicitudes,
        admin: {
          ...state.admin,
          solicitudes: newSolicitudes
        }
      };
      
    case 'UPDATE_SOLICITUD':
      const updatedSolicitudes = state.solicitudes.map(s => 
        s.id === action.payload.id 
          ? { ...s, ...action.payload.updates }
          : s
      );
      return {
        ...state,
        solicitudes: updatedSolicitudes,
        admin: {
          ...state.admin,
          solicitudes: updatedSolicitudes
        }
      };
      
    case 'RESET_DATABASE':
      return {
        ...state,
        admin: {
          ...state.admin,
          clientesDatabase: [],
          solicitudes: []
        },
        solicitudes: []
      };
      
    case 'LOAD_DATA':
      // Cargar datos desde localStorage
      const savedData = loadFromLocalStorage();
      return {
        ...state,
        ...savedData
      };
      
    default:
      return state;
  }
}

// Contexto
const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  actions: {
    loginCliente: (numeroCliente: string, rfc: string) => Promise<boolean>;
    logoutCliente: () => void;
    loginAdmin: (email: string, password: string) => Promise<boolean>;
    logoutAdmin: () => void;
    cargarClientesDesdeExcel: (file: File) => Promise<void>;
    agregarSolicitud: (solicitud: SolicitudCredito) => void;
    actualizarSolicitud: (id: string, updates: Partial<SolicitudCredito>) => void;
    resetearBaseDatos: () => void;
  };
} | null>(null);

// Hook para usar el contexto
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp debe ser usado dentro de AppProvider');
  }
  return context;
}

// Funciones de localStorage
function saveToLocalStorage(state: AppState) {
  try {
    const dataToSave = {
      admin: state.admin,
      solicitudes: state.solicitudes.map(s => ({
        ...s,
        fechaCreacion: s.fechaCreacion.toISOString()
      }))
    };
    localStorage.setItem('tubos-monterrey-app', JSON.stringify(dataToSave));
  } catch (error) {
    console.error('Error guardando en localStorage:', error);
  }
}

function loadFromLocalStorage(): Partial<AppState> {
  try {
    const saved = localStorage.getItem('tubos-monterrey-app');
    if (!saved) return {};
    
    const data = JSON.parse(saved);
    return {
      admin: data.admin || initialState.admin,
      solicitudes: (data.solicitudes || []).map((s: any) => ({
        ...s,
        fechaCreacion: new Date(s.fechaCreacion)
      }))
    };
  } catch (error) {
    console.error('Error cargando desde localStorage:', error);
    return {};
  }
}

// Provider del contexto
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Cargar datos al inicializar
  useEffect(() => {
    dispatch({ type: 'LOAD_DATA' });
  }, []);

  // Guardar en localStorage cuando cambie el estado
  useEffect(() => {
    if (state.admin.isAuthenticated || state.solicitudes.length > 0) {
      saveToLocalStorage(state);
    }
  }, [state.admin, state.solicitudes]);

  // Acciones
  const actions = {
    // Login de cliente
    loginCliente: async (numeroCliente: string, rfc: string): Promise<boolean> => {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      try {
        const response = await fetch('http://localhost:3001/api/auth/cliente', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ numeroCliente, rfc })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
          // Convertir la respuesta del backend al formato esperado por el frontend
          const cliente: Cliente = {
            id: data.data.cliente.id.toString(),
            codigoSN: data.data.cliente.codigo_sn,
            nombreSN: data.data.cliente.nombre_sn,
            rfc: data.data.cliente.rfc,
            codigoCondicionesPago: data.data.cliente.codigo_condiciones_pago || '',
            codigoGrupo: data.data.cliente.codigo_grupo || ''
          };
          dispatch({ type: 'LOGIN_CLIENTE', payload: cliente });
          return true;
        } else {
          dispatch({ 
            type: 'SET_ERROR', 
            payload: data.message || 'No encontramos su número de cliente y/o RFC en nuestra base de datos, lo que significa que no cumple con la primera condición para solicitar una línea de crédito: ser un cliente activo con al menos 3 meses de antigüedad. Para comenzar a generar su historial, le recomendamos realizar compras de contado durante los próximos 3 meses. Una vez cumplido este periodo, podrá aplicar a una línea de crédito conforme a nuestras políticas. Si tiene alguna duda o requiere más información, no dude en contactarnos: 📞 Teléfono: 55 5078 7700 📱 WhatsApp: 55 4144 8919 ✉️ Email: tubosmty@tubosmonterrey.com.mx Estamos aquí para apoyarlo.'
          });
          return false;
        }
      } catch (error) {
        console.error('Error al autenticar cliente:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Error de conexión. Verifique que el servidor esté disponible.' });
        return false;
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    },

    // Logout de cliente
    logoutCliente: () => {
      dispatch({ type: 'LOGOUT_CLIENTE' });
    },

    // Login de admin
    loginAdmin: async (email: string, password: string): Promise<boolean> => {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      try {
        const response = await fetch('http://localhost:3001/api/auth/admin', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
          const adminUser: User = {
            id: data.data.user.id.toString(),
            email: data.data.user.email,
            role: data.data.user.role,
            name: data.data.user.name
          };
          dispatch({ type: 'LOGIN_ADMIN', payload: adminUser });
          return true;
        } else {
          dispatch({ type: 'SET_ERROR', payload: data.message || 'Credenciales incorrectas' });
          return false;
        }
      } catch (error) {
        console.error('Error al autenticar admin:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Error de conexión. Verifique que el servidor esté disponible.' });
        return false;
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    },

    // Logout de admin
    logoutAdmin: () => {
      dispatch({ type: 'LOGOUT_ADMIN' });
    },

    // Cargar clientes desde Excel o JSON
    cargarClientesDesdeExcel: async (file: File): Promise<void> => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        let clientes;
        
        if (file.name.endsWith('.json')) {
          // Cargar desde JSON (para datos de ejemplo)
          const text = await file.text();
          clientes = JSON.parse(text);
        } else {
          // Cargar desde Excel
          const { leerArchivoExcel } = await import('../utils/excel');
          clientes = await leerArchivoExcel(file);
        }
        
        dispatch({ type: 'SET_CLIENTES_DATABASE', payload: clientes });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: 'Error al procesar archivo' });
        throw error;
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    },

    // Agregar solicitud
    agregarSolicitud: (solicitud: SolicitudCredito) => {
      dispatch({ type: 'ADD_SOLICITUD', payload: solicitud });
    },

    // Actualizar solicitud
    actualizarSolicitud: (id: string, updates: Partial<SolicitudCredito>) => {
      dispatch({ type: 'UPDATE_SOLICITUD', payload: { id, updates } });
    },

    // Resetear base de datos
    resetearBaseDatos: () => {
      dispatch({ type: 'RESET_DATABASE' });
      localStorage.removeItem('tubos-monterrey-app');
    }
  };

  return (
    <AppContext.Provider value={{ state, dispatch, actions }}>
      {children}
    </AppContext.Provider>
  );
}
