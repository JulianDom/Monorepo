/**
 * Traducciones en Español (default)
 */
export const es = {
  // Common
  common: {
    save: 'Guardar',
    cancel: 'Cancelar',
    delete: 'Eliminar',
    edit: 'Editar',
    create: 'Crear',
    search: 'Buscar',
    filter: 'Filtrar',
    loading: 'Cargando...',
    noResults: 'No se encontraron resultados',
    confirm: 'Confirmar',
    back: 'Volver',
    next: 'Siguiente',
    previous: 'Anterior',
    actions: 'Acciones',
    yes: 'Sí',
    no: 'No',
    all: 'Todos',
    none: 'Ninguno',
    select: 'Seleccionar',
    close: 'Cerrar',
    refresh: 'Actualizar',
    export: 'Exportar',
    import: 'Importar',
    download: 'Descargar',
    upload: 'Subir',
  },

  // Auth
  auth: {
    login: 'Iniciar sesión',
    logout: 'Cerrar sesión',
    register: 'Registrarse',
    email: 'Correo electrónico',
    password: 'Contraseña',
    forgotPassword: '¿Olvidaste tu contraseña?',
    rememberMe: 'Recordarme',
    loginSuccess: 'Sesión iniciada correctamente',
    loginError: 'Credenciales inválidas',
    logoutSuccess: 'Sesión cerrada correctamente',
  },

  // Validation
  validation: {
    required: 'Este campo es requerido',
    email: 'Ingresa un correo electrónico válido',
    minLength: 'Mínimo {{min}} caracteres',
    maxLength: 'Máximo {{max}} caracteres',
    min: 'El valor mínimo es {{min}}',
    max: 'El valor máximo es {{max}}',
    pattern: 'Formato inválido',
    passwordMismatch: 'Las contraseñas no coinciden',
  },

  // Errors
  errors: {
    generic: 'Ha ocurrido un error inesperado',
    network: 'Error de conexión. Verifica tu internet.',
    notFound: '{{entity}} no encontrado',
    unauthorized: 'No tienes permisos para esta acción',
    forbidden: 'Acceso denegado',
    serverError: 'Error del servidor. Intenta más tarde.',
  },

  // Success messages
  success: {
    created: '{{entity}} creado correctamente',
    updated: '{{entity}} actualizado correctamente',
    deleted: '{{entity}} eliminado correctamente',
    saved: '{{entity}} guardado correctamente',
  },

  // Confirmation dialogs
  confirm: {
    deleteTitle: '¿Eliminar {{entity}}?',
    deleteDescription:
      'Esta acción no se puede deshacer. El {{entity}} será eliminado permanentemente.',
    unsavedChangesTitle: '¿Descartar cambios?',
    unsavedChangesDescription:
      'Tienes cambios sin guardar. ¿Estás seguro de que quieres salir?',
  },

  // Pagination
  pagination: {
    showing: 'Mostrando',
    of: 'de',
    results: 'resultados',
    page: 'Página',
    itemsPerPage: 'Items por página',
    goToPage: 'Ir a página',
  },

  // Table
  table: {
    noData: 'No hay datos para mostrar',
    loading: 'Cargando datos...',
    error: 'Error al cargar datos',
    sortAsc: 'Ordenar ascendente',
    sortDesc: 'Ordenar descendente',
  },

  // Dates
  dates: {
    today: 'Hoy',
    yesterday: 'Ayer',
    tomorrow: 'Mañana',
    daysAgo: 'hace {{count}} días',
    hoursAgo: 'hace {{count}} horas',
    minutesAgo: 'hace {{count}} minutos',
    justNow: 'Justo ahora',
  },

  // File upload
  upload: {
    dragDrop: 'Arrastra archivos aquí o haz clic para seleccionar',
    maxSize: 'Tamaño máximo: {{size}}',
    invalidType: 'Tipo de archivo no permitido',
    tooLarge: 'El archivo excede el tamaño máximo',
    uploading: 'Subiendo...',
    uploaded: 'Archivo subido correctamente',
    error: 'Error al subir archivo',
  },
} as const;

export type Translations = typeof es;
