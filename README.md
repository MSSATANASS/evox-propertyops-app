# PropertyOps by Evox

PropertyOps es una aplicación autónoma para administrar propiedades, tareas de mantenimiento, gastos, reportes mensuales y portales de propietarios. El proyecto sirve el frontend React/Vite y la API Node/Express desde un mismo origen en producción, con SQLite persistente y autenticación local mediante sesiones HttpOnly.

## Stack

| Capa          | Tecnología                                                      |
| ------------- | --------------------------------------------------------------- |
| Interfaz      | React 19, TypeScript, Vite, Tailwind CSS y React Router         |
| API           | Node.js 22.13+, Express 5 y Zod                                 |
| Persistencia  | SQLite integrado mediante `node:sqlite`                         |
| Autenticación | `crypto.scrypt`, tokens de sesión aleatorios y cookies HttpOnly |
| Operación     | Docker Compose, volumen persistente en `/data`                  |

## Desarrollo local

Requiere Node.js 22.13 o posterior y pnpm. Instala las dependencias y copia el archivo de entorno de ejemplo:

```bash
pnpm install
cp .env.example .env
```

Para levantar la interfaz con Vite y el backend en procesos separados, ejecuta `pnpm dev:server` en una terminal y `pnpm dev` en otra. El proxy de Vite envía `/api` al servidor local en `127.0.0.1:3000`, por lo que el navegador mantiene un origen único. Para probar la salida de producción, usa `pnpm build`, `pnpm build:server` y después `pnpm start`.

El servidor crea las migraciones SQLite al abrir la base de datos. No inserta datos automáticamente. El seed de demostración se ejecuta de forma explícita y es idempotente:

```bash
pnpm seed:demo
```

El primer administrador también se crea de forma explícita. Suministra las variables únicamente durante ese comando y elimínalas de la sesión después:

```bash
ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD='use-a-long-random-password' pnpm bootstrap:admin
```

El comando rechaza contraseñas ausentes y no crea un segundo administrador. No imprimas ni almacenes los valores de bootstrap en el repositorio.

## Pruebas y comprobaciones

La suite usa un pool de Vitest compatible con `node:sqlite`:

```bash
pnpm test
pnpm exec tsc -b
pnpm build
pnpm build:server
pnpm lint
```

El artefacto del frontend se escribe en `dist/` y el backend compilado en `dist-server/`. El endpoint de salud no requiere sesión:

```bash
curl -fsS http://127.0.0.1:3000/api/health
```

La respuesta incluye `status`, `version` y `schemaVersion`. Las rutas administrativas requieren una sesión local válida.

## Docker

Construye y ejecuta el servicio con el binding local seguro definido en Compose:

```bash
docker compose build
docker compose up -d
curl -fsS http://127.0.0.1:8080/api/health
docker compose logs -f propertyops
docker compose down
```

El contenedor se llama `propertyops-standalone`, corre como un usuario Node no root, expone el puerto interno `3000` y monta `/opt/propertyops/data:/data`. Compose publica inicialmente únicamente `127.0.0.1:8080:3000`; no modifica otros contenedores ni servicios del host.

El archivo `docker-compose.yml` contiene solo configuración no secreta. La contraseña inicial se debe suministrar mediante el comando de bootstrap dentro del host o mediante un mecanismo de secretos aprobado; nunca se debe añadir al compose ni al repositorio.

## Backup y restauración

La base de datos de producción vive en `/opt/propertyops/data/propertyops.sqlite`. Detén temporalmente el contenedor antes de copiar el archivo para obtener un backup consistente:

```bash
docker compose stop propertyops
sudo cp /opt/propertyops/data/propertyops.sqlite "/opt/propertyops/data/propertyops.sqlite.$(date +%Y%m%d%H%M%S).bak"
docker compose start propertyops
```

Para restaurar un backup, conserva primero una copia del archivo actual, detén el servicio, reemplaza el archivo SQLite por el backup verificado y arranca de nuevo:

```bash
docker compose stop propertyops
sudo cp /opt/propertyops/data/propertyops.sqlite /opt/propertyops/data/propertyops.sqlite.before-restore.bak
sudo cp /opt/propertyops/data/propertyops.sqlite.YYYYMMDDHHMMSS.bak /opt/propertyops/data/propertyops.sqlite
docker compose start propertyops
curl -fsS http://127.0.0.1:8080/api/health
```

## Rollback de la imagen

Antes de reemplazar una imagen, conserva la versión que está funcionando. Para volver atrás, selecciona el commit o tag anterior, reconstruye y recrea únicamente el servicio `propertyops`:

```bash
git checkout <commit-verificado>
docker compose build propertyops
docker compose up -d propertyops
curl -fsS http://127.0.0.1:8080/api/health
```

No ejecutes `docker compose down` sobre otros proyectos del host ni elimines el volumen de datos durante un rollback. La migración SQLite es idempotente y la base debe conservarse.

## Configuración

Las variables disponibles están documentadas en `.env.example`:

| Variable              |                     Default | Uso                                           |
| --------------------- | --------------------------: | --------------------------------------------- |
| `PORT`                |                      `3000` | Puerto interno del proceso Node               |
| `DATABASE_PATH`       | `./data/propertyops.sqlite` | Archivo SQLite persistente                    |
| `SESSION_TTL_SECONDS` |                     `28800` | Duración de una sesión                        |
| `COOKIE_SECURE`       |                     `false` | Activa `Secure` cuando existe HTTPS confiable |
| `NODE_ENV`            |               `development` | Entorno de ejecución                          |
