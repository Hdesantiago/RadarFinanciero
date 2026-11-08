// Temas de búsqueda especializados para GDELT y clasificación temática.
// Cada tema define: la consulta GDELT (sintaxis DOC API), la categoría
// financiera asignada y palabras clave para detección de país/tema.

export const TEMAS_BUSQUEDA = [
  {
    id: 'crisis-deuda-soberana',
    categoria: 'Crisis de deuda soberana',
    consultaGdelt: '"sovereign debt crisis" OR "deuda soberana" OR "default de deuda" OR "reestructuración de deuda"',
    palabrasClave: ['deuda soberana', 'sovereign debt', 'default', 'reestructuración', 'restructuring', 'impago']
  },
  {
    id: 'deuda-francia',
    categoria: 'Endeudamiento público',
    consultaGdelt: '"France" AND ("public debt" OR "dette publique" OR "déficit")',
    palabrasClave: ['francia', 'france', 'dette publique'],
    paisFijo: 'Francia'
  },
  {
    id: 'deuda-japon',
    categoria: 'Endeudamiento público',
    consultaGdelt: '"Japan" AND ("public debt" OR "government debt" OR "deuda pública")',
    palabrasClave: ['japón', 'japan', 'deuda pública'],
    paisFijo: 'Japón'
  },
  {
    id: 'deficit-fiscal-europeo',
    categoria: 'Déficit fiscal',
    consultaGdelt: '"fiscal deficit" OR "déficit fiscal" OR "budget deficit" AND ("Europe" OR "Europa" OR "eurozone")',
    palabrasClave: ['déficit fiscal', 'fiscal deficit', 'budget deficit', 'eurozona']
  },
  {
    id: 'crisis-bancaria',
    categoria: 'Crisis bancaria',
    consultaGdelt: '"banking crisis" OR "crisis bancaria" OR "bank run" OR "corrida bancaria" OR "bank failure"',
    palabrasClave: ['crisis bancaria', 'banking crisis', 'bank run', 'corrida', 'quiebra bancaria']
  },
  {
    id: 'bonos-soberanos',
    categoria: 'Bonos soberanos',
    consultaGdelt: '"sovereign bonds" OR "bonos soberanos" OR "government bonds" OR "yield" AND "sovereign"',
    palabrasClave: ['bonos soberanos', 'sovereign bonds', 'government bonds', 'rendimiento', 'yield']
  },
  {
    id: 'riesgo-impago',
    categoria: 'Crisis de deuda soberana',
    consultaGdelt: '"default risk" OR "riesgo de impago" OR "credit default" OR "debt default"',
    palabrasClave: ['riesgo de impago', 'default risk', 'impago', 'credit default']
  },
  {
    id: 'credito-privado',
    categoria: 'Crédito privado',
    consultaGdelt: '"private credit" OR "crédito privado" OR "private debt" OR "direct lending"',
    palabrasClave: ['crédito privado', 'private credit', 'private debt', 'direct lending']
  },
  {
    id: 'crisis-inmobiliaria',
    categoria: 'Crisis inmobiliaria',
    consultaGdelt: '"housing crisis" OR "crisis inmobiliaria" OR "real estate crisis" OR "property market crash"',
    palabrasClave: ['crisis inmobiliaria', 'housing crisis', 'real estate', 'burbuja inmobiliaria']
  },
  {
    id: 'bancos-centrales',
    categoria: 'Bancos centrales',
    consultaGdelt: '"central bank" OR "banco central" OR "Federal Reserve" OR "ECB" OR "BCE" OR "monetary policy"',
    palabrasClave: ['banco central', 'central bank', 'federal reserve', 'bce', 'ecb', 'política monetaria']
  },
  {
    id: 'fuga-capitales',
    categoria: 'Mercados financieros',
    consultaGdelt: '"capital flight" OR "fuga de capitales" OR "capital outflow" OR "salida de capitales"',
    palabrasClave: ['fuga de capitales', 'capital flight', 'capital outflow', 'salida de capitales']
  },
  {
    id: 'riesgo-sistemico',
    categoria: 'Riesgo sistémico',
    consultaGdelt: '"systemic risk" OR "riesgo sistémico" OR "financial stability" OR "estabilidad financiera"',
    palabrasClave: ['riesgo sistémico', 'systemic risk', 'estabilidad financiera', 'financial stability']
  },
  {
    id: 'inflacion',
    categoria: 'Inflación',
    consultaGdelt: '"inflation" OR "inflación" OR "price index" OR "IPC" OR "consumer prices"',
    palabrasClave: ['inflación', 'inflation', 'ipc', 'precios al consumidor', 'consumer prices']
  },
  {
    id: 'reservas-internacionales',
    categoria: 'Reservas internacionales',
    consultaGdelt: '"foreign reserves" OR "reservas internacionales" OR "international reserves" OR "FX reserves"',
    palabrasClave: ['reservas internacionales', 'foreign reserves', 'international reserves', 'fx reserves']
  },
  {
    id: 'problemas-liquidez',
    categoria: 'Riesgo sistémico',
    consultaGdelt: '"liquidity crisis" OR "crisis de liquidez" OR "liquidity problem" OR "funding stress"',
    palabrasClave: ['crisis de liquidez', 'liquidity crisis', 'liquidez', 'funding stress']
  },
  {
    id: 'calificaciones-crediticias',
    categoria: 'Finanzas corporativas',
    consultaGdelt: '"credit rating" OR "calificación crediticia" OR "rating downgrade" OR "S&P" OR "Moody\'s" OR "Fitch"',
    palabrasClave: ['calificación crediticia', 'credit rating', 'rating', 'downgrade', 's&p', 'moody', 'fitch']
  }
];

// Palabras clave para detección de país a partir del texto.
export const PAISES_PALABRAS = {
  'Francia': ['francia', 'france', 'parís', 'paris', 'francés', 'french'],
  'Japón': ['japón', 'japan', 'tokio', 'tokyo', 'japonés', 'japanese', 'yen'],
  'México': ['méxico', 'mexico', 'banxico', 'peso mexicano', 'cdmx'],
  'Estados Unidos': ['estados unidos', 'united states', 'ee.uu.', 'eeuu', 'washington', 'federal reserve', 'fed', 'dólar', 'dollar'],
  'Alemania': ['alemania', 'germany', 'berlín', 'berlin', 'bundesbank'],
  'España': ['españa', 'spain', 'madrid'],
  'Italia': ['italia', 'italy', 'roma', 'rome'],
  'Reino Unido': ['reino unido', 'united kingdom', 'uk', 'londres', 'london', 'boe'],
  'Argentina': ['argentina', 'buenos aires', 'peso argentino'],
  'Brasil': ['brasil', 'brazil', 'brasilia', 'real brasileño'],
  'China': ['china', 'beijing', 'pekín', 'yuan', 'pboc'],
  'Zona euro': ['zona euro', 'eurozone', 'euro area', 'bce', 'ecb', 'eurozona'],
  'Ucrania': ['ucrania', 'ukraine', 'kiev', 'kyiv'],
  'Rusia': ['rusia', 'russia', 'moscú', 'moscow', 'rublo', 'ruble'],
  'Turquía': ['turquía', 'turkey', 'ankara', 'lira'],
  'Grecia': ['grecia', 'greece', 'atenas', 'athens'],
  'Venezuela': ['venezuela', 'caracas', 'bolívar'],
  'Colombia': ['colombia', 'bogotá', 'bogota'],
  'Chile': ['chile', 'santiago'],
  'Perú': ['perú', 'peru', 'lima']
};

// Regiones por país para el índice de países.
export const REGION_POR_PAIS = {
  'Francia': 'Europa', 'Japón': 'Asia', 'México': 'América del Norte',
  'Estados Unidos': 'América del Norte', 'Alemania': 'Europa', 'España': 'Europa',
  'Italia': 'Europa', 'Reino Unido': 'Europa', 'Argentina': 'América del Sur',
  'Brasil': 'América del Sur', 'China': 'Asia', 'Zona euro': 'Europa',
  'Ucrania': 'Europa', 'Rusia': 'Europa/Asia', 'Turquía': 'Europa/Asia',
  'Grecia': 'Europa', 'Venezuela': 'América del Sur', 'Colombia': 'América del Sur',
  'Chile': 'América del Sur', 'Perú': 'América del Sur'
};
