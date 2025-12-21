<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>

## Descripción

Aplicación de mensajería en tiempo real construida con [NestJS](https://github.com/nestjs/nest), que proporciona funcionalidades de chat, canales, usuarios y autenticación mediante JWT. La aplicación utiliza WebSockets (Socket.IO) para comunicación en tiempo real y PostgreSQL como base de datos.

## Características

- 🔐 Autenticación JWT
- 💬 Mensajería en tiempo real con WebSockets
- 👥 Gestión de usuarios y canales
- 🗄️ Base de datos PostgreSQL con TypeORM
- 🛡️ Validación de datos con class-validator
- 🔄 Transformación de fechas automática
- 🌐 CORS configurado

## Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- [Node.js](https://nodejs.org/) (versión 18 o superior)
- [npm](https://www.npmjs.com/) o [yarn](https://yarnpkg.com/)
- [PostgreSQL](https://www.postgresql.org/) (versión 12 o superior)
- Git

## Instalación

1. Clona el repositorio:

```bash
git clone <url-del-repositorio>
cd WSK
```

2. Instala las dependencias:

```bash
npm install
```

3. Configura las variables de entorno:

Copia el archivo `.env.example` a `.env`:

```bash
cp .env.example .env
```

Edita el archivo `.env` con tus valores de configuración (ver sección de Variables de Entorno).

4. Crea la base de datos en PostgreSQL:

```bash
# Conecta a PostgreSQL
psql -U postgres

# Crea la base de datos
CREATE DATABASE social;

# Sal de psql
\q
```

5. Ejecuta las migraciones para crear las tablas (las migraciones ya están creadas en el proyecto):

```bash
npm run migration:run
```

Este comando aplicará todas las migraciones incluidas en el proyecto para crear la estructura completa de la base de datos.

6. (Opcional) Ejecuta el seed para poblar la base de datos con datos de ejemplo:

```bash
npm run seed
```

**Nota:** El seed elimina todos los datos existentes. Úsalo solo en desarrollo.

## Migraciones de Base de Datos

El proyecto utiliza TypeORM para gestionar las migraciones de la base de datos. Las migraciones ya están creadas y se encuentran en la carpeta `src/migrations/`.

### Migraciones Incluidas

El proyecto incluye las siguientes migraciones que crean toda la estructura de la base de datos:

1. **EnableUuidExtension**: Habilita la extensión `uuid-ossp` de PostgreSQL para generar UUIDs
2. **CreateRecordsTypeEnum**: Crea el tipo enumerado `records_type` con valores: ACTIVE, INACTIVE, DELETED
3. **CreateUsersTable**: Crea la tabla `users` con campos para email, password, name, state y timestamps
4. **CreateChannelsTable**: Crea la tabla `channels` con relación al usuario creador
5. **CreateMessagesTable**: Crea la tabla `messages` con relaciones a channels y users
6. **CreateChannelsUsersTable**: Crea la tabla de relación many-to-many entre channels y users

**Importante:** Las migraciones ya están creadas. Solo necesitas ejecutarlas para crear la estructura de la base de datos.

### Configuración Inicial de la Base de Datos

Para configurar la base de datos por primera vez, ejecuta los siguientes comandos en orden:

```bash
# 1. Ejecutar las migraciones para crear todas las tablas
npm run migration:run

# 2. (Opcional) Ejecutar el seed para poblar con datos de ejemplo
npm run seed
```

Esto creará toda la estructura de la base de datos y, opcionalmente, la poblará con datos de ejemplo para desarrollo.

### Comandos de Migración

#### Ejecutar Migraciones Pendientes

Para aplicar todas las migraciones pendientes a la base de datos:

```bash
npm run migration:run
```

Este comando ejecutará todas las migraciones que aún no se han aplicado, en el orden correcto.

#### Revertir la Última Migración

Para deshacer la última migración ejecutada:

```bash
npm run migration:revert
```

**⚠️ Advertencia:** Esto eliminará los cambios de la última migración. Úsalo con precaución, especialmente en producción.

#### Ver Estado de las Migraciones

Para ver qué migraciones se han ejecutado y cuáles están pendientes:

```bash
npm run migration:show
```

#### Crear una Nueva Migración

Para crear una nueva migración vacía (que luego debes completar manualmente):

```bash
npm run migration:create src/migrations/NombreDeTuMigracion
```

#### Generar una Migración Automáticamente

Para generar automáticamente una migración basada en los cambios en tus entidades:

```bash
npm run migration:generate src/migrations/NombreDeTuMigracion
```

**Nota:** Este comando compara tus entidades con el estado actual de la base de datos y genera la migración correspondiente.

### Flujo de Trabajo con Migraciones

1. **Primera vez (setup inicial):**
   ```bash
   # Crea la base de datos
   createdb social
   
   # Ejecuta todas las migraciones (ya están creadas en el proyecto)
   npm run migration:run
   
   # (Opcional) Ejecuta el seed para datos de ejemplo
   npm run seed
   ```

2. **Desarrollo (cuando cambias entidades):**
   ```bash
   # Genera una nueva migración basada en los cambios
   npm run migration:generate src/migrations/DescripcionDelCambio
   
   # Revisa el archivo generado y ajusta si es necesario
   
   # Ejecuta la migración
   npm run migration:run
   ```

3. **Producción:**
   ```bash
   # Asegúrate de tener DB_SYNCHRONIZE=false en .env
   # Ejecuta las migraciones pendientes
   npm run migration:run
   
   # NO ejecutes el seed en producción
   ```

### Estructura de las Migraciones

Cada migración debe implementar la interfaz `MigrationInterface` con dos métodos:

- `up()`: Define los cambios a aplicar (crear tablas, agregar columnas, etc.)
- `down()`: Define cómo revertir los cambios (eliminar tablas, quitar columnas, etc.)

Ejemplo:

```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';

export class NombreMigracion1234567890 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Código para aplicar la migración
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Código para revertir la migración
  }
}
```

### Importante

- **Nunca modifiques migraciones ya ejecutadas** en producción. Si necesitas hacer cambios, crea una nueva migración.
- **Siempre prueba las migraciones** en un entorno de desarrollo antes de aplicarlas en producción.
- **Haz backups** de la base de datos antes de ejecutar migraciones en producción.
- **Mantén `DB_SYNCHRONIZE=false`** en producción. Usa migraciones para todos los cambios de esquema.

## Seed (Poblado de Datos)

El proyecto incluye un script de seed que crea automáticamente datos de ejemplo para facilitar el desarrollo y las pruebas. El seed se encuentra en `src/seeds/seed.ts`.

### ¿Qué crea el seed?

El seed crea automáticamente:

1. **8 Usuarios de ejemplo:**
   - `admin@example.com` - Administrador (ACTIVE)
   - `juan@example.com` - Juan Pérez (ACTIVE)
   - `maria@example.com` - María García (ACTIVE)
   - `carlos@example.com` - Carlos López (ACTIVE)
   - `ana@example.com` - Ana Martínez (ACTIVE)
   - `luis@example.com` - Luis Rodríguez (ACTIVE)
   - `sofia@example.com` - Sofía Hernández (ACTIVE)
   - `diego@example.com` - Diego Fernández (INACTIVE)

   **Todas las contraseñas son:** `password123`

2. **6 Canales:**
   - **General** (global) - Canal público para todos
   - **Desarrollo** (global) - Canal público para el equipo de desarrollo
   - **Soporte** (privado) - Canal privado para el equipo de soporte
   - **Marketing** (privado) - Canal privado para marketing
   - **Ventas** (privado) - Canal privado para ventas
   - **Recursos Humanos** (privado) - Canal privado para RRHH

3. **Relaciones usuarios-canales:**
   - Todos los usuarios activos están en los canales globales
   - Usuarios específicos asignados a canales privados según su rol

4. **Mensajes de ejemplo:**
   - Mensajes de bienvenida y conversaciones de ejemplo en cada canal
   - Mensajes con fechas distribuidas en los últimos 7 días

### Ejecutar el Seed

Para ejecutar el seed y poblar la base de datos con datos de ejemplo:

```bash
npm run seed
```

**⚠️ Advertencia:** El seed **elimina todos los datos existentes** antes de insertar los nuevos. Úsalo solo en entornos de desarrollo o cuando quieras resetear la base de datos.

### Flujo Completo de Setup

Para configurar el proyecto desde cero con migraciones y seed:

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env
# Edita .env con tus valores

# 3. Crear la base de datos
createdb social

# 4. Ejecutar migraciones
npm run migration:run

# 5. Ejecutar seed (opcional, solo para desarrollo)
npm run seed
```

### Personalizar el Seed

Si quieres modificar los datos que se crean, edita el archivo `src/seeds/seed.ts`. Puedes:

- Agregar más usuarios
- Crear más canales
- Modificar las relaciones entre usuarios y canales
- Agregar más mensajes de ejemplo
- Cambiar las contraseñas por defecto

### Credenciales de Prueba

Después de ejecutar el seed, puedes usar estas credenciales para iniciar sesión:

```
Email: admin@example.com
Password: password123
```

O cualquier otro usuario del seed con la misma contraseña: `password123`

## Variables de Entorno

El proyecto requiere las siguientes variables de entorno. Puedes usar el archivo `.env.example` como referencia.

### Variables Requeridas

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `JWT_SECRET` | Clave secreta para firmar y verificar tokens JWT | `llave_secreta` |
| `PORT` | Puerto en el que se ejecutará la aplicación | `3000` |
| `DB_HOST` | Dirección del servidor de PostgreSQL | `localhost` |
| `DB_PORT` | Puerto de PostgreSQL | `5432` |
| `DB_USERNAME` | Usuario de la base de datos | `postgres` |
| `DB_PASSWORD` | Contraseña de la base de datos | `contraseña` |
| `DB_NAME` | Nombre de la base de datos | `social` |
| `DB_SCHEMA` | Esquema de la base de datos | `public` |

### Variables Opcionales

| Variable | Descripción | Valor por Defecto |
|----------|-------------|-------------------|
| `DB_SYNCHRONIZE` | Sincroniza automáticamente el esquema de la base de datos (solo desarrollo) | `false` |
| `DB_LOGGING` | Habilita el logging de consultas SQL | `false` |

### Ejemplo de archivo `.env`

```env
JWT_SECRET=tu_clave_secreta_muy_segura_aqui
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=tu_contraseña_segura
DB_NAME=social
DB_SCHEMA=public
```

**⚠️ Importante:** Nunca commitees el archivo `.env` al repositorio. El archivo `.env.example` está incluido en el repositorio como plantilla.

## Compilación y Ejecución

### Modo Desarrollo

```bash
# Inicia el servidor en modo desarrollo con hot-reload
npm run start:dev
```

La aplicación estará disponible en `http://localhost:3000` (o el puerto especificado en `PORT`).

### Modo Producción

```bash
# Compila el proyecto
npm run build

# Inicia el servidor en modo producción
npm run start:prod
```

### Modo Debug

```bash
npm run start:debug
```

## Estructura del Proyecto

```
WSK/
├── src/
│   ├── config/              # Configuraciones (base de datos, etc.)
│   ├── globals/             # Enumeraciones y constantes globales
│   ├── interceptors/        # Interceptores globales
│   ├── modules/             # Módulos de la aplicación
│   │   ├── auth/           # Módulo de autenticación
│   │   ├── channel/        # Módulo de canales
│   │   ├── message/        # Módulo de mensajes
│   │   └── user/           # Módulo de usuarios
│   ├── entity/             # Entidades compartidas
│   ├── wsk/                # Gateway de WebSockets
│   ├── app.module.ts       # Módulo principal
│   └── main.ts             # Punto de entrada de la aplicación
├── test/                   # Tests end-to-end
├── dist/                   # Código compilado (generado)
├── .env.example            # Plantilla de variables de entorno
├── .gitignore
├── package.json
└── README.md
```

## Tecnologías Utilizadas

- **NestJS**: Framework Node.js progresivo
- **TypeScript**: Lenguaje de programación
- **TypeORM**: ORM para TypeScript y JavaScript
- **PostgreSQL**: Base de datos relacional
- **Socket.IO**: Biblioteca para WebSockets
- **Passport JWT**: Estrategia de autenticación JWT
- **bcryptjs**: Encriptación de contraseñas
- **class-validator**: Validación de DTOs
- **class-transformer**: Transformación de objetos
- **Luxon**: Manejo de fechas y tiempo

## API y Endpoints

La aplicación expone los siguientes módulos principales:

- **Auth**: Autenticación y autorización
- **User**: Gestión de usuarios
- **Channel**: Gestión de canales
- **Message**: Gestión de mensajes
- **WebSocket Gateway**: Comunicación en tiempo real

## Tests

```bash
# Tests unitarios
npm run test

# Tests en modo watch
npm run test:watch

# Tests con cobertura
npm run test:cov

# Tests end-to-end
npm run test:e2e
```

## Documentación Técnica

### Configuración de Base de Datos

La aplicación utiliza TypeORM para la gestión de la base de datos. La configuración se encuentra en `src/config/database.config.ts`.

**Características:**
- Conexión a PostgreSQL
- Auto-detección de entidades
- Configuración de timezone UTC
- Validación de variables de entorno requeridas

### Autenticación

El sistema de autenticación utiliza:
- **JWT (JSON Web Tokens)** para tokens de acceso
- **Passport.js** como middleware de autenticación
- **bcryptjs** para el hash de contraseñas
- Guards para proteger rutas y WebSockets

### WebSockets

La aplicación implementa WebSockets mediante Socket.IO para:
- Mensajería en tiempo real
- Notificaciones instantáneas
- Sincronización de estado entre clientes

El gateway principal se encuentra en `src/wsk/wsk.gateway.ts`.

### Interceptores

- **DateTransformInterceptor**: Transforma automáticamente las fechas en las respuestas de la API.

### Validación

La aplicación utiliza `class-validator` y `ValidationPipe` global para:
- Validar automáticamente los DTOs
- Rechazar propiedades no permitidas
- Transformar tipos automáticamente

## Despliegue

### Preparación para Producción

1. **Configura las variables de entorno de producción:**
   - Asegúrate de usar valores seguros para `JWT_SECRET` y `DB_PASSWORD`
   - Configura `DB_SYNCHRONIZE=false` en producción
   - Configura `DB_LOGGING=false` en producción (opcional, para mejor rendimiento)

2. **Compila el proyecto:**
   ```bash
   npm run build
   ```

3. **Verifica que el directorio `dist/` contenga el código compilado**

### Despliegue en Servidor

#### Opción 1: Despliegue Manual

1. **Instala Node.js y PostgreSQL en el servidor**

2. **Clona el repositorio:**
   ```bash
   git clone <url-del-repositorio>
   cd WSK
   ```

3. **Instala dependencias:**
   ```bash
   npm install --production
   ```

4. **Configura las variables de entorno:**
   ```bash
   cp .env.example .env
   # Edita .env con los valores de producción
   ```

5. **Compila el proyecto:**
   ```bash
   npm run build
   ```

6. **Inicia la aplicación:**
   ```bash
   npm run start:prod
   ```

#### Opción 2: Usando PM2 (Recomendado)

PM2 permite gestionar procesos Node.js en producción con reinicio automático.

1. **Instala PM2 globalmente:**
   ```bash
   npm install -g pm2
   ```

2. **Inicia la aplicación con PM2:**
   ```bash
   pm2 start dist/main.js --name wsk-api
   ```

3. **Configura PM2 para iniciar al arrancar el sistema:**
   ```bash
   pm2 startup
   pm2 save
   ```

4. **Comandos útiles de PM2:**
   ```bash
   pm2 list          # Lista procesos
   pm2 logs wsk-api  # Ver logs
   pm2 restart wsk-api  # Reiniciar
   pm2 stop wsk-api     # Detener
   pm2 delete wsk-api   # Eliminar
   ```

#### Opción 3: Usando Docker (Opcional)

Crea un `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["node", "dist/main.js"]
```

Y un `docker-compose.yml`:

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    env_file:
      - .env
    depends_on:
      - db

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: contraseña
      POSTGRES_DB: social
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

### Despliegue en Plataformas Cloud

#### Heroku

1. **Instala Heroku CLI y autentica:**
   ```bash
   heroku login
   ```

2. **Crea una nueva aplicación:**
   ```bash
   heroku create tu-app-nombre
   ```

3. **Agrega el addon de PostgreSQL:**
   ```bash
   heroku addons:create heroku-postgresql:hobby-dev
   ```

4. **Configura las variables de entorno:**
   ```bash
   heroku config:set JWT_SECRET=tu_clave_secreta
   heroku config:set PORT=3000
   # Las variables de DB se configuran automáticamente con el addon
   ```

5. **Despliega:**
   ```bash
   git push heroku main
   ```

#### AWS (usando NestJS Mau)

```bash
npm install -g @nestjs/mau
mau deploy
```

#### Railway

1. Conecta tu repositorio a Railway
2. Configura las variables de entorno en el dashboard
3. Railway detectará automáticamente Node.js y desplegará

### Configuración de Nginx (Recomendado)

Si usas Nginx como reverse proxy:

```nginx
server {
    listen 80;
    server_name tu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Consideraciones de Seguridad

1. **Variables de Entorno:**
   - Nunca commitees archivos `.env` con valores reales
   - Usa secretos seguros y únicos en producción
   - Considera usar un gestor de secretos (AWS Secrets Manager, HashiCorp Vault, etc.)

2. **Base de Datos:**
   - Desactiva `DB_SYNCHRONIZE` en producción
   - Usa migraciones de TypeORM para cambios de esquema
   - Configura backups regulares

3. **JWT:**
   - Usa una clave secreta fuerte y única
   - Considera implementar refresh tokens
   - Configura tiempos de expiración apropiados

4. **CORS:**
   - Configura los orígenes permitidos según tu frontend
   - No uses `origin: '*'` en producción

5. **HTTPS:**
   - Usa HTTPS en producción
   - Configura certificados SSL/TLS

## Troubleshooting

### Error: Variables de entorno faltantes

Si ves el error `Variables de entorno faltantes: ...`, asegúrate de:
- Tener un archivo `.env` en la raíz del proyecto
- Que todas las variables requeridas estén definidas
- Que el archivo `.env` no tenga errores de sintaxis

### Error de conexión a la base de datos

- Verifica que PostgreSQL esté ejecutándose
- Confirma que las credenciales en `.env` sean correctas
- Verifica que la base de datos exista
- Revisa que el puerto no esté bloqueado por firewall

### El servidor no inicia

- Verifica que el puerto especificado en `PORT` no esté en uso
- Revisa los logs para más detalles
- Asegúrate de que todas las dependencias estén instaladas

## Recursos

- [Documentación de NestJS](https://docs.nestjs.com)
- [Documentación de TypeORM](https://typeorm.io)
- [Documentación de Socket.IO](https://socket.io/docs)
- [Canal de Discord de NestJS](https://discord.gg/G7Qnnhy)
- [Cursos de NestJS](https://courses.nestjs.com/)

## Soporte

NestJS es un proyecto open source con licencia MIT. Puede crecer gracias a los sponsors y el apoyo de increíbles colaboradores.

## Licencia

NestJS está [licenciado bajo MIT](https://github.com/nestjs/nest/blob/master/LICENSE).
