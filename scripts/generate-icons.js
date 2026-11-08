/*
 * Generador de iconos de RADAR FINANCIERO.
 * Crea los PNG de la PWA (192, 512 y maskable) y el favicon.ico
 * sin dependencias externas (codificador PNG propio con zlib de Node).
 *
 * Uso: npm run generate:icons
 */

import zlib from 'node:zlib';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIR_ICONOS = path.join(__dirname, '..', 'public', 'icons');
const DIR_PUBLIC = path.join(__dirname, '..', 'public');

// ---------- Codificador PNG mínimo ----------

const TABLA_CRC = (() => {
  const tabla = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    tabla[n] = c >>> 0;
  }
  return tabla;
})();

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc = TABLA_CRC[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function bloque(tipo, datos) {
  const salida = Buffer.alloc(12 + datos.length);
  salida.writeUInt32BE(datos.length, 0);
  salida.write(tipo, 4, 'ascii');
  datos.copy(salida, 8);
  salida.writeUInt32BE(crc32(salida.subarray(4, 8 + datos.length)), 8 + datos.length);
  return salida;
}

function codificarPng(ancho, alto, rgba) {
  const crudo = Buffer.alloc((ancho * 4 + 1) * alto);
  for (let y = 0; y < alto; y++) {
    const inicioFila = y * (ancho * 4 + 1);
    crudo[inicioFila] = 0; // Filtro: ninguno
    rgba.copy(crudo, inicioFila + 1, y * ancho * 4, (y + 1) * ancho * 4);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(ancho, 0);
  ihdr.writeUInt32BE(alto, 4);
  ihdr[8] = 8; // Profundidad de bits
  ihdr[9] = 6; // Color RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    bloque('IHDR', ihdr),
    bloque('IDAT', zlib.deflateSync(crudo, { level: 9 })),
    bloque('IEND', Buffer.alloc(0))
  ]);
}

// ---------- Dibujo del icono (radar) ----------

const FONDO = [11, 18, 32]; // #0b1220
const VERDE = [34, 197, 94]; // #22c55e
const VERDE_TENUE = [22, 80, 48];
const AMBAR = [240, 185, 11]; // #f0b90b

function pintarPixel(rgba, ancho, x, y, color, alfa = 1) {
  const i = (y * ancho + x) * 4;
  rgba[i] = Math.round(color[0] * alfa + rgba[i] * (1 - alfa));
  rgba[i + 1] = Math.round(color[1] * alfa + rgba[i + 1] * (1 - alfa));
  rgba[i + 2] = Math.round(color[2] * alfa + rgba[i + 2] * (1 - alfa));
  rgba[i + 3] = 255;
}

function generarIcono(tamano) {
  const rgba = Buffer.alloc(tamano * tamano * 4);
  const centro = tamano / 2;
  const anillo = tamano * 0.012;
  const radios = [0.16, 0.3, 0.44].map((r) => r * tamano);
  const anguloBarrido = -Math.PI / 4; // 45° hacia arriba-derecha

  for (let y = 0; y < tamano; y++) {
    for (let x = 0; x < tamano; x++) {
      pintarPixel(rgba, tamano, x, y, FONDO);
      const dx = x - centro;
      const dy = y - centro;
      const distancia = Math.hypot(dx, dy);

      // Anillos concéntricos
      for (const radio of radios) {
        if (Math.abs(distancia - radio) <= anillo) {
          pintarPixel(rgba, tamano, x, y, VERDE, 0.9);
        }
      }

      // Ejes tenues
      if ((Math.abs(dx) <= anillo * 0.6 || Math.abs(dy) <= anillo * 0.6) && distancia <= radios[2]) {
        pintarPixel(rgba, tamano, x, y, VERDE_TENUE, 0.5);
      }

      // Línea de barrido del radar
      const angulo = Math.atan2(dy, dx);
      let diferencia = Math.abs(angulo - anguloBarrido);
      diferencia = Math.min(diferencia, 2 * Math.PI - diferencia);
      if (diferencia <= 0.02 && distancia <= radios[2]) {
        pintarPixel(rgba, tamano, x, y, VERDE, 1);
      }

      // Estela del barrido
      if (diferencia > 0.02 && diferencia <= 0.6 && distancia <= radios[2]) {
        const detras = Math.sin(angulo - anguloBarrido) < 0;
        if (detras) {
          pintarPixel(rgba, tamano, x, y, VERDE, 0.12 * (1 - diferencia / 0.6));
        }
      }
    }
  }

  // "Blips" de objetivos detectados
  const blips = [
    { x: 0.62, y: 0.3, r: 0.035, color: AMBAR },
    { x: 0.35, y: 0.58, r: 0.028, color: VERDE },
    { x: 0.58, y: 0.68, r: 0.024, color: VERDE }
  ];
  for (const blip of blips) {
    const bx = Math.round(blip.x * tamano);
    const by = Math.round(blip.y * tamano);
    const br = Math.max(2, Math.round(blip.r * tamano));
    for (let y = by - br; y <= by + br; y++) {
      for (let x = bx - br; x <= bx + br; x++) {
        if (x >= 0 && y >= 0 && x < tamano && y < tamano && Math.hypot(x - bx, y - by) <= br) {
          pintarPixel(rgba, tamano, x, y, blip.color, 1);
        }
      }
    }
  }

  return codificarPng(tamano, tamano, rgba);
}

// ---------- favicon.ico (PNG incrustado) ----------

function generarIco(png32) {
  const cabecera = Buffer.alloc(6);
  cabecera.writeUInt16LE(0, 0); // Reservado
  cabecera.writeUInt16LE(1, 2); // Tipo: icono
  cabecera.writeUInt16LE(1, 4); // 1 imagen

  const entrada = Buffer.alloc(16);
  entrada[0] = 32; // Ancho
  entrada[1] = 32; // Alto
  entrada[2] = 0; // Paleta
  entrada[3] = 0; // Reservado
  entrada.writeUInt16LE(1, 4); // Planos
  entrada.writeUInt16LE(32, 6); // Bits por píxel
  entrada.writeUInt32LE(png32.length, 8);
  entrada.writeUInt32LE(22, 12); // Desplazamiento

  return Buffer.concat([cabecera, entrada, png32]);
}

// ---------- Ejecución ----------

fs.mkdirSync(DIR_ICONOS, { recursive: true });

const archivos = [
  { nombre: 'icon-192.png', tamano: 192 },
  { nombre: 'icon-512.png', tamano: 512 },
  { nombre: 'icon-maskable-512.png', tamano: 512 }
];

for (const { nombre, tamano } of archivos) {
  fs.writeFileSync(path.join(DIR_ICONOS, nombre), generarIcono(tamano));
  console.log(`✔ ${nombre} (${tamano}x${tamano})`);
}

fs.writeFileSync(path.join(DIR_PUBLIC, 'favicon.ico'), generarIco(generarIcono(32)));
console.log('✔ favicon.ico (32x32)');
console.log('Iconos generados correctamente.');
