import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      app: {
        title: 'Simpler Fuel',
        tagline: 'Track your fuel consumption'
      },
      auth: {
        signIn: 'Sign In',
        signUp: 'Sign Up',
        signOut: 'Sign Out',
        email: 'Email',
        password: 'Password',
        createAccount: 'Create Account',
        alreadyHaveAccount: 'Already have an account? Sign in',
        dontHaveAccount: "Don't have an account? Sign up",
        checkEmail: 'Check your email for the confirmation link!'
      },
      nav: {
        dashboard: 'Dashboard',
        addEntry: 'Add Entry',
        history: 'History',
        stats: 'Statistics',
        settings: 'Settings',
        back: 'Back'
      },
      dashboard: {
        addEntryDesc: 'Record a new fuel entry',
        historyDesc: 'View all fuel entries',
        statsDesc: 'View consumption trends',
        settingsDesc: 'Configure preferences'
      },
      entry: {
        add: 'Add Fuel Entry',
        date: 'Date',
        odometer: 'Odometer',
        fuel: 'Fuel Amount',
        notes: 'Notes',
        notesOptional: 'Notes (optional)',
        notesPlaceholder: 'e.g., Full tank, Shell station',
        save: 'Save Entry',
        saving: 'Saving...',
        delete: 'Delete',
        confirmDelete: 'Are you sure you want to delete this entry?'
      },
      history: {
        title: 'Fuel History',
        noEntries: 'No fuel entries yet',
        addFirst: 'Add Your First Entry'
      },
      stats: {
        title: 'Statistics',
        avgConsumption: 'Average Consumption',
        bestConsumption: 'Best Consumption',
        totalDistance: 'Total Distance',
        totalFuel: 'Total Fuel',
        consumptionHistory: 'Consumption History',
        needMoreEntries: 'Add at least 2 fuel entries to see statistics'
      },
      settings: {
        title: 'Settings',
        unitsDisplay: 'Units & Display',
        distanceUnit: 'Distance Unit',
        volumeUnit: 'Volume Unit',
        consumptionFormat: 'Consumption Display Format',
        language: 'Language',
        saveSettings: 'Save Settings',
        account: 'Account',
        confirmSignOut: 'Are you sure you want to sign out?'
      },
      units: {
        km: 'Kilometers (km)',
        mi: 'Miles (mi)',
        liters: 'Liters (L)',
        galUS: 'Gallons US (gal)',
        galUK: 'Gallons UK (gal)',
        kmPerL: 'Kilometers per Liter (km/L)',
        lPer100km: 'Liters per 100km (L/100km)',
        mpgUS: 'Miles per Gallon US (mpg)',
        mpgUK: 'Miles per Gallon UK (mpg)'
      },
      common: {
        loading: 'Loading...',
        error: 'An error occurred',
        success: 'Success'
      }
    }
  },
  es: {
    translation: {
      app: {
        title: 'Simpler Fuel',
        tagline: 'Registra tu consumo de combustible'
      },
      auth: {
        signIn: 'Iniciar Sesión',
        signUp: 'Registrarse',
        signOut: 'Cerrar Sesión',
        email: 'Correo Electrónico',
        password: 'Contraseña',
        createAccount: 'Crear Cuenta',
        alreadyHaveAccount: '¿Ya tienes cuenta? Inicia sesión',
        dontHaveAccount: '¿No tienes cuenta? Regístrate',
        checkEmail: '¡Revisa tu correo para el enlace de confirmación!'
      },
      nav: {
        dashboard: 'Panel',
        addEntry: 'Agregar',
        history: 'Historial',
        stats: 'Estadísticas',
        settings: 'Ajustes',
        back: 'Volver'
      },
      dashboard: {
        addEntryDesc: 'Registrar nueva carga',
        historyDesc: 'Ver todas las cargas',
        statsDesc: 'Ver tendencias de consumo',
        settingsDesc: 'Configurar preferencias'
      },
      entry: {
        add: 'Agregar Carga',
        date: 'Fecha',
        odometer: 'Odómetro',
        fuel: 'Cantidad de Combustible',
        notes: 'Notas',
        notesOptional: 'Notas (opcional)',
        notesPlaceholder: 'ej., Tanque lleno, Gasolinera Shell',
        save: 'Guardar',
        saving: 'Guardando...',
        delete: 'Eliminar',
        confirmDelete: '¿Estás seguro de eliminar esta entrada?'
      },
      history: {
        title: 'Historial',
        noEntries: 'No hay registros aún',
        addFirst: 'Agrega tu Primera Carga'
      },
      stats: {
        title: 'Estadísticas',
        avgConsumption: 'Consumo Promedio',
        bestConsumption: 'Mejor Consumo',
        totalDistance: 'Distancia Total',
        totalFuel: 'Combustible Total',
        consumptionHistory: 'Historial de Consumo',
        needMoreEntries: 'Agrega al menos 2 registros para ver estadísticas'
      },
      settings: {
        title: 'Ajustes',
        unitsDisplay: 'Unidades y Visualización',
        distanceUnit: 'Unidad de Distancia',
        volumeUnit: 'Unidad de Volumen',
        consumptionFormat: 'Formato de Consumo',
        language: 'Idioma',
        saveSettings: 'Guardar Ajustes',
        account: 'Cuenta',
        confirmSignOut: '¿Estás seguro de cerrar sesión?'
      },
      units: {
        km: 'Kilómetros (km)',
        mi: 'Millas (mi)',
        liters: 'Litros (L)',
        galUS: 'Galones US (gal)',
        galUK: 'Galones UK (gal)',
        kmPerL: 'Kilómetros por Litro (km/L)',
        lPer100km: 'Litros por 100km (L/100km)',
        mpgUS: 'Millas por Galón US (mpg)',
        mpgUK: 'Millas por Galón UK (mpg)'
      },
      common: {
        loading: 'Cargando...',
        error: 'Ocurrió un error',
        success: 'Éxito'
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
