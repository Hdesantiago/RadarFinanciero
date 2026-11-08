// Configuración central de RADAR FINANCIERO.

export const APP = {
  nombre: 'RADAR FINANCIERO',
  subtitulo: 'Inteligencia financiera internacional',
  version: '0.1.0',
  fase: 1
};

export const CATEGORIAS = [
  'Crisis de deuda soberana',
  'Endeudamiento público',
  'Déficit fiscal',
  'Crisis bancaria',
  'Bancos centrales',
  'Inflación',
  'Tasas de interés',
  'Bonos soberanos',
  'Mercados financieros',
  'Riesgo sistémico',
  'Crédito privado',
  'Crisis inmobiliaria',
  'Petróleo y materias primas',
  'Reservas internacionales',
  'Comercio internacional',
  'Devaluaciones',
  'Economía mundial',
  'Finanzas corporativas',
  'Regulación financiera',
  'Inteligencia artificial y economía'
];

export const MENU = [
  { id: 'dashboard', titulo: 'Dashboard', icono: 'bi-speedometer2', ruta: '#/dashboard' },
  { id: 'noticias', titulo: 'Noticias mundiales', icono: 'bi-globe-americas', ruta: '#/noticias' },
  { id: 'radar', titulo: 'Noticias poco difundidas', icono: 'bi-broadcast-pin', ruta: '#/radar' },
  { id: 'crisis', titulo: 'Crisis financieras', icono: 'bi-exclamation-triangle', ruta: '#/crisis' },
  { id: 'paises', titulo: 'Países', icono: 'bi-flag', ruta: '#/paises' },
  { id: 'investigaciones', titulo: 'Investigaciones', icono: 'bi-journal-text', ruta: '#/investigaciones' },
  { id: 'favoritos', titulo: 'Favoritos', icono: 'bi-star', ruta: '#/favoritos' },
  { id: 'biblioteca', titulo: 'Mi biblioteca', icono: 'bi-collection', ruta: '#/biblioteca' },
  { id: 'configuracion', titulo: 'Configuración', icono: 'bi-gear', ruta: '#/configuracion' }
];

// Elementos visibles en la navegación inferior para teléfonos.
export const MENU_INFERIOR = ['dashboard', 'noticias', 'radar', 'crisis', 'favoritos'];

export const RUTAS_DATOS = {
  noticias: `${import.meta.env.BASE_URL}data/news.json`,
  fuentes: `${import.meta.env.BASE_URL}data/sources.json`
};
