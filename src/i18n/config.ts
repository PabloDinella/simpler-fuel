import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      app: {
        title: 'Simpler Fuel',
        tagline: 'Track your fuel consumption',
        localOnly: 'Local Only'
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
        settingsDesc: 'Configure preferences',
        activeVehicle: 'Active Vehicle'
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
        confirmDelete: 'Are you sure you want to delete this entry?',
        lastRecorded: 'Last recorded',
        odometerLowerThanLast:
          'Odometer must be greater than or equal to the last recorded value ({{value}} {{unit}}).',
        saveFailed: 'Failed to save entry. Please try again.',
        deleteFailed: 'Failed to delete entry'
      },
      history: {
        title: 'Fuel History',
        noEntries: 'No fuel entries yet',
        noEntriesForVehicle: 'No fuel entries yet for {{vehicle}}',
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
        appearance: 'Appearance',
        theme: 'Theme',
        themeLight: 'Light',
        themeDark: 'Dark',
        themeSystem: 'System',
        themeDescription: 'Choose your preferred color scheme',
        saveSettings: 'Save Settings',
        saveFailed: 'Failed to save settings',
        account: 'Account',
        confirmSignOut: 'Are you sure you want to sign out?',
        localOnlyMode: 'Currently using Local Only mode',
        localOnlyDesc: 'Your data is stored on this device only. Create an account to enable cloud sync.',
        createAccountBtn: 'Create Account & Enable Cloud Sync',
        accountBenefits: 'Benefits of creating an account:',
        benefit1: 'Automatic cloud backup of all your fuel entries',
        benefit2: 'Sync across multiple devices (phone, tablet, computer)',
        benefit3: 'Real-time updates when you add entries on any device',
        benefit4: 'Never lose your data, even if you clear browser cache',
        signUpNow: 'Sign Up Now',
        maybeLater: 'Maybe later',
        cloudSyncEnabled: 'Cloud sync enabled',
        signedInAs: 'Signed in as',
        dataPrivacy: 'Data & Privacy',
        deleteAccountBtn: 'Delete Account & Data',
        deleteAccountDesc: 'Permanently delete your account and all associated data'
      },
      vehicles: {
        title: 'Vehicles',
        selectVehicle: 'Vehicle',
        name: 'Vehicle Name',
        namePlaceholder: 'e.g., Family Car',
        notes: 'Vehicle Notes',
        notesPlaceholder: 'e.g., Diesel, city commute',
        create: 'Create Vehicle',
        createFailed: 'Failed to create vehicle',
        setActive: 'Set Active',
        active: 'Active',
        activeList: 'Active Vehicles',
        archivedList: 'Archived Vehicles',
        archive: 'Archive',
        archiveFailed: 'Failed to archive vehicle',
        unarchive: 'Unarchive',
        unarchiveFailed: 'Failed to unarchive vehicle',
        switchFailed: 'Failed to switch active vehicle',
        cannotArchiveLast: 'Cannot archive the last active vehicle',
        nameRequired: 'Vehicle name is required',
        noneAvailable: 'No vehicles available'
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
        tagline: 'Registra tu consumo de combustible',
        localOnly: 'Solo Local'
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
        settingsDesc: 'Configurar preferencias',
        activeVehicle: 'Vehículo Activo'
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
        confirmDelete: '¿Estás seguro de eliminar esta entrada?',
        lastRecorded: 'Último registro',
        odometerLowerThanLast:
          'El odómetro debe ser mayor o igual al último valor registrado ({{value}} {{unit}}).',
        saveFailed: 'No se pudo guardar la entrada. Inténtalo de nuevo.',
        deleteFailed: 'No se pudo eliminar la entrada'
      },
      history: {
        title: 'Historial',
        noEntries: 'No hay registros aún',
        noEntriesForVehicle: 'No hay cargas para {{vehicle}}',
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
        appearance: 'Apariencia',
        theme: 'Tema',
        themeLight: 'Claro',
        themeDark: 'Oscuro',
        themeSystem: 'Sistema',
        themeDescription: 'Elige tu esquema de color preferido',
        saveSettings: 'Guardar Ajustes',
        saveFailed: 'No se pudieron guardar los ajustes',
        account: 'Cuenta',
        confirmSignOut: '¿Estás seguro de cerrar sesión?',
        localOnlyMode: 'Usando modo Local Solamente',
        localOnlyDesc: 'Tus datos se almacenan solo en este dispositivo. Crea una cuenta para habilitar la sincronización en la nube.',
        createAccountBtn: 'Crear Cuenta y Habilitar Sincronización',
        accountBenefits: 'Beneficios de crear una cuenta:',
        benefit1: 'Respaldo automático en la nube de todas tus cargas',
        benefit2: 'Sincroniza entre múltiples dispositivos (teléfono, tableta, computadora)',
        benefit3: 'Actualizaciones en tiempo real al agregar entradas en cualquier dispositivo',
        benefit4: 'Nunca pierdas tus datos, incluso si borras el caché del navegador',
        signUpNow: 'Registrarse Ahora',
        maybeLater: 'Quizás después',
        cloudSyncEnabled: 'Sincronización habilitada',
        signedInAs: 'Conectado como',
        dataPrivacy: 'Datos y Privacidad',
        deleteAccountBtn: 'Eliminar Cuenta y Datos',
        deleteAccountDesc: 'Eliminar permanentemente tu cuenta y todos los datos asociados'
      },
      vehicles: {
        title: 'Vehículos',
        selectVehicle: 'Vehículo',
        name: 'Nombre del Vehículo',
        namePlaceholder: 'ej., Auto Familiar',
        notes: 'Notas del Vehículo',
        notesPlaceholder: 'ej., Diésel, uso urbano',
        create: 'Crear Vehículo',
        createFailed: 'No se pudo crear el vehículo',
        setActive: 'Activar',
        active: 'Activo',
        activeList: 'Vehículos Activos',
        archivedList: 'Vehículos Archivados',
        archive: 'Archivar',
        archiveFailed: 'No se pudo archivar el vehículo',
        unarchive: 'Desarchivar',
        unarchiveFailed: 'No se pudo desarchivar el vehículo',
        switchFailed: 'No se pudo cambiar el vehículo activo',
        cannotArchiveLast: 'No se puede archivar el último vehículo activo',
        nameRequired: 'El nombre del vehículo es obligatorio',
        noneAvailable: 'No hay vehículos disponibles'
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
  },
  pt: {
    translation: {
      app: {
        title: 'Simpler Fuel',
        tagline: 'Acompanhe seu consumo de combustível',
        localOnly: 'Apenas Local'
      },
      auth: {
        signIn: 'Entrar',
        signUp: 'Cadastrar',
        signOut: 'Sair',
        email: 'E-mail',
        password: 'Senha',
        createAccount: 'Criar Conta',
        alreadyHaveAccount: 'Já tem uma conta? Entre',
        dontHaveAccount: 'Não tem uma conta? Cadastre-se',
        checkEmail: 'Verifique seu e-mail para o link de confirmação!'
      },
      nav: {
        dashboard: 'Painel',
        addEntry: 'Adicionar',
        history: 'Histórico',
        stats: 'Estatísticas',
        settings: 'Configurações',
        back: 'Voltar'
      },
      dashboard: {
        addEntryDesc: 'Registrar novo abastecimento',
        historyDesc: 'Ver todos os abastecimentos',
        statsDesc: 'Ver tendências de consumo',
        settingsDesc: 'Configurar preferências',
        activeVehicle: 'Veículo Ativo'
      },
      entry: {
        add: 'Adicionar Abastecimento',
        date: 'Data',
        odometer: 'Odômetro',
        fuel: 'Quantidade de Combustível',
        notes: 'Notas',
        notesOptional: 'Notas (opcional)',
        notesPlaceholder: 'ex., Tanque cheio, Posto Shell',
        save: 'Salvar',
        saving: 'Salvando...',
        delete: 'Excluir',
        confirmDelete: 'Tem certeza que deseja excluir esta entrada?',
        lastRecorded: 'Último registro',
        odometerLowerThanLast:
          'O odômetro deve ser maior ou igual ao último valor registrado ({{value}} {{unit}}).',
        saveFailed: 'Falha ao salvar o registro. Tente novamente.',
        deleteFailed: 'Falha ao excluir o registro'
      },
      history: {
        title: 'Histórico',
        noEntries: 'Nenhum registro ainda',
        noEntriesForVehicle: 'Ainda não há registros para {{vehicle}}',
        addFirst: 'Adicione seu Primeiro Abastecimento'
      },
      stats: {
        title: 'Estatísticas',
        avgConsumption: 'Consumo Médio',
        bestConsumption: 'Melhor Consumo',
        totalDistance: 'Distância Total',
        totalFuel: 'Combustível Total',
        consumptionHistory: 'Histórico de Consumo',
        needMoreEntries: 'Adicione pelo menos 2 registros para ver estatísticas'
      },
      settings: {
        title: 'Configurações',
        unitsDisplay: 'Unidades e Visualização',
        distanceUnit: 'Unidade de Distância',
        volumeUnit: 'Unidade de Volume',
        consumptionFormat: 'Formato de Consumo',
        language: 'Idioma',
        appearance: 'Aparência',
        theme: 'Tema',
        themeLight: 'Claro',
        themeDark: 'Escuro',
        themeSystem: 'Sistema',
        themeDescription: 'Escolha seu esquema de cores preferido',
        saveSettings: 'Salvar Configurações',
        saveFailed: 'Falha ao salvar configurações',
        account: 'Conta',
        confirmSignOut: 'Tem certeza que deseja sair?',
        localOnlyMode: 'Usando modo Local Apenas',
        localOnlyDesc: 'Seus dados estão armazenados apenas neste dispositivo. Crie uma conta para habilitar sincronização na nuvem.',
        createAccountBtn: 'Criar Conta e Habilitar Sincronização',
        accountBenefits: 'Benefícios de criar uma conta:',
        benefit1: 'Backup automático na nuvem de todos os seus abastecimentos',
        benefit2: 'Sincronize entre vários dispositivos (telefone, tablet, computador)',
        benefit3: 'Atualizações em tempo real ao adicionar entradas em qualquer dispositivo',
        benefit4: 'Nunca perca seus dados, mesmo se limpar o cache do navegador',
        signUpNow: 'Cadastrar Agora',
        maybeLater: 'Talvez depois',
        cloudSyncEnabled: 'Sincronização habilitada',
        signedInAs: 'Conectado como',
        dataPrivacy: 'Dados e Privacidade',
        deleteAccountBtn: 'Excluir Conta e Dados',
        deleteAccountDesc: 'Excluir permanentemente sua conta e todos os dados associados'
      },
      vehicles: {
        title: 'Veículos',
        selectVehicle: 'Veículo',
        name: 'Nome do Veículo',
        namePlaceholder: 'ex., Carro da Família',
        notes: 'Notas do Veículo',
        notesPlaceholder: 'ex., Diesel, uso urbano',
        create: 'Criar Veículo',
        createFailed: 'Falha ao criar veículo',
        setActive: 'Definir Ativo',
        active: 'Ativo',
        activeList: 'Veículos Ativos',
        archivedList: 'Veículos Arquivados',
        archive: 'Arquivar',
        archiveFailed: 'Falha ao arquivar veículo',
        unarchive: 'Desarquivar',
        unarchiveFailed: 'Falha ao desarquivar veículo',
        switchFailed: 'Falha ao trocar o veículo ativo',
        cannotArchiveLast: 'Não é possível arquivar o último veículo ativo',
        nameRequired: 'Nome do veículo é obrigatório',
        noneAvailable: 'Nenhum veículo disponível'
      },
      units: {
        km: 'Quilômetros (km)',
        mi: 'Milhas (mi)',
        liters: 'Litros (L)',
        galUS: 'Galões US (gal)',
        galUK: 'Galões UK (gal)',
        kmPerL: 'Quilômetros por Litro (km/L)',
        lPer100km: 'Litros por 100km (L/100km)',
        mpgUS: 'Milhas por Galão US (mpg)',
        mpgUK: 'Milhas por Galão UK (mpg)'
      },
      common: {
        loading: 'Carregando...',
        error: 'Ocorreu um erro',
        success: 'Sucesso'
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: navigator.language.split('-')[0], // Use browser language, will be overridden by DB setting
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
