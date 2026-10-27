import type en from './en'

export default {
  ui: {
    pageTitle: 'Área de pruebas de Okapi',
    title: 'Errores fáciles de entender',
    description:
      'Prueba a realizar la misma solicitud con diferentes clientes HTTP. Inspecciona la respuesta y descubre cómo Okapi convierte los fallos en errores útiles',
    darkMode: 'Modo oscuro',
    language: 'Idioma',
    adapters: 'Cliente HTTP',
    scenario: 'Escenario de solicitud',
    run: 'Enviar solicitud',
    running: 'Enviando…',
    cancel: 'Cancelar',
    clear: 'Limpiar',
    waiting: 'Esperando una respuesta…',
    success: 'Solicitud completada',
    empty: 'Sin cuerpo de respuesta.',
    ready: 'Elige un escenario y envía una solicitud.',
    mappedError: 'Error normalizado',
    raw: 'Respuesta original',
    validationErrors: 'Errores de validación',
    dismiss: 'Cerrar',
    notification: 'Notificación',
    notifications: 'Notificaciones ({hotkey})',
    service: 'Respuestas en directo de',
  },
  fields: {
    type: 'Tipo',
    kind: 'Clase',
    source: 'Origen',
    status: 'Estado',
  },
  scenarios: {
    '200': '200 · Éxito',
    '204': '204 · Sin contenido',
    '400': '400 · Solicitud incorrecta',
    '401': '401 · No autorizado',
    '403': '403 · Acceso denegado',
    '404': '404 · No encontrado',
    '409': '409 · Conflicto',
    '418': '418 · Soy una tetera',
    '422': '422 · Validación',
    '429': '429 · Demasiadas solicitudes',
    '500': '500 · Error del servidor',
    '503': '503 · Servicio no disponible',
    text: '500 · Error HTTP en texto',
    slow: 'Éxito lento · 3 segundos (prueba Cancelar)',
    timeout: 'Tiempo de espera · Límite de 1 segundo, respuesta en 3 segundos',
  },
  custom: {
    title: 'Personalización del núcleo',
    description:
      'Datos locales · Sin solicitudes de red. Estos ejemplos usan directamente las API del núcleo de Okapi.',
    example: 'Ejemplo',
    kind: 'Clase de error personalizada',
    validation: 'Analizador de validación personalizado',
    kindHelp:
      'resolveKind convierte un código de API en subscription-expired en lugar de la clase forbidden predeterminada.',
    validationHelp:
      'parseValidationErrors convierte una lista de errores de campos en un diccionario.',
    input: 'Datos de entrada',
  },
  errors: {
    network: {
      title: 'Problema de conexión',
      message: 'Comprueba tu conexión a Internet e inténtalo de nuevo.',
    },
    abort: {
      title: 'Solicitud cancelada',
      message: 'La solicitud se canceló antes de completarse.',
    },
    timeout: {
      title: 'Tiempo de espera agotado',
      message: 'La respuesta tardó demasiado. Inténtalo de nuevo.',
    },
    unauthorized: {
      title: 'Se requiere autenticación',
      message: 'Inicia sesión para continuar.',
    },
    forbidden: {
      title: 'Acceso denegado',
      message: 'No tienes permiso para realizar esta acción.',
    },
    'not-found': {
      title: 'No encontrado',
      message: 'No se ha encontrado el recurso solicitado.',
    },
    validation: {
      title: 'Revisa los datos',
      message: 'Algunos campos contienen valores no válidos.',
    },
    conflict: {
      title: 'Conflicto',
      message: 'La solicitud entra en conflicto con el estado actual del recurso.',
    },
    'rate-limited': {
      title: 'Demasiadas solicitudes',
      message: 'Espera antes de volver a intentarlo.',
    },
    business: {
      title: 'Solicitud fallida',
      message: 'No se pudo completar la solicitud.',
    },
    server: {
      title: 'Error del servidor',
      message: 'No hemos podido completar tu solicitud. Inténtalo de nuevo.',
    },
    unexpected: {
      title: 'Error inesperado',
      message: 'Se ha producido un error inesperado. Inténtalo de nuevo.',
    },
    'subscription-expired': {
      title: 'Suscripción caducada',
      message: 'Renueva tu suscripción para continuar.',
    },
  },
} satisfies typeof en
