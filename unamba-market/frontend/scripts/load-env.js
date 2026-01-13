#!/usr/bin/env node

/**
 * Script para cargar variables de entorno desde .env
 * y crear el archivo environment.ts dinámicamente
 */

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Cargar variables del archivo .env
const envPath = path.join(__dirname, '..', '.env');
const envLocalPath = path.join(__dirname, '..', '.env.local');

let envVars = {};

// Primero cargar .env
if (fs.existsSync(envPath)) {
    const envConfig = dotenv.parse(fs.readFileSync(envPath));
    envVars = { ...envVars, ...envConfig };
    console.log('✅ Variables cargadas desde .env');
}

// Después cargar .env.local (sobrescribe .env)
if (fs.existsSync(envLocalPath)) {
    const envLocalConfig = dotenv.parse(fs.readFileSync(envLocalPath));
    envVars = { ...envVars, ...envLocalConfig };
    console.log('✅ Variables cargadas desde .env.local');
}

// Variables por defecto si no existen
const defaultVars = {
    API_URL: 'http://localhost:8080',
    API_BASE_URL: 'http://localhost:8080/api',
    UPLOAD_URL: 'http://localhost:8080/uploads',
    PRODUCTION: 'false'
};

// Combinar con valores por defecto
envVars = { ...defaultVars, ...envVars };

// Crear contenido del archivo environment.ts
const environmentContent = `// Archivo generado automáticamente desde .env
// NO EDITES ESTE ARCHIVO MANUALMENTE
// Edita el archivo .env en la raíz del proyecto

export const environment = {
  production: ${envVars.PRODUCTION === 'true' ? 'true' : 'false'},
  apiUrl: '${envVars.API_URL || 'http://localhost:8080'}',
  apiBaseUrl: '${envVars.API_BASE_URL || 'http://localhost:8080/api'}',
  uploadUrl: '${envVars.UPLOAD_URL || 'http://localhost:8080/uploads'}'
};
`;

// Escribir el archivo environment.ts
const environmentPath = path.join(__dirname, '..', 'src', 'environments', 'environment.ts');
const environmentDir = path.dirname(environmentPath);

// Crear directorio si no existe
if (!fs.existsSync(environmentDir)) {
    fs.mkdirSync(environmentDir, { recursive: true });
}

fs.writeFileSync(environmentPath, environmentContent);
console.log('✅ Archivo environment.ts generado exitosamente');
console.log('📍 Ubicación:', environmentPath);

// Mostrar variables cargadas
console.log('\n📋 Variables de entorno cargadas:');
console.log('  API_URL:', envVars.API_URL);
console.log('  API_BASE_URL:', envVars.API_BASE_URL);
console.log('  UPLOAD_URL:', envVars.UPLOAD_URL);
console.log('  PRODUCTION:', envVars.PRODUCTION);
console.log('');
