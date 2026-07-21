import { createApp } from 'vue'
import { createI18n } from 'vue-i18n'
import App from './App.vue'

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages: {
    en: {
      error: {
        api: {
          title: {
            unauthorized: 'Authentication required',
            forbidden: 'Access denied',
            'not-found': 'Not found',
            validation: 'Check the form',
            'rate-limited': 'Too many requests',
            server: 'Server error',
            network: 'Connection problem',
            unexpected: 'Something went wrong',
          },
          messages: {
            unauthorized: 'Sign in to continue',
            forbidden: 'You do not have permission to perform this action',
            'not-found': 'The requested resource could not be found',
            validation: 'Some fields contain invalid values',
            'rate-limited': 'Please wait before trying again',
            server: 'We could not complete your request. Please try again',
            network: 'Check your internet connection and try again',
            unexpected: 'An unexpected error occurred. Please try again',
          }
        }
      }
    },
    es: {
      error: {
        api: {
          title: {
            unauthorized: 'Se requiere autenticación',
            forbidden: 'Acceso denegado',
            'not-found': 'No encontrado',
            validation: 'Revisa el formulario',
            'rate-limited': 'Demasiadas solicitudes',
            server: 'Error del servidor',
            network: 'Problema de conexión',
            unexpected: 'Ha habido un error',
          },
          messages: {
            unauthorized: 'Inicia sesión para continuar',
            forbidden: 'No tienes permiso para realizar esta acción',
            'not-found': 'No se ha encontrado el recurso solicitado',
            validation: 'Algunos campos contienen valores no válidos',
            'rate-limited': 'Por favor, espera un momento antes de volver a intentarlo',
            server: 'No hemos podido completar tu solicitud. Inténtalo de nuevo',
            network: 'Comprueba tu conexión a Internet e inténtalo de nuevo',
            unexpected: 'Se ha producido un error inesperado. Inténtalo de nuevo',
          }
        }
      }
    }
  }
})

const app = createApp(App)

app.use(i18n)
app.mount('#app')
