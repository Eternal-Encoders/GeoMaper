export function getOrigin() {
    return import.meta.env.VITE_HOST ? `https://${import.meta.env.VITE_HOST}` : 'https://dev.how-to-navigate.ru/api'
}