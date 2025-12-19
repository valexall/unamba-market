# UNAMBA Market

Sistema de marketplace universitario desarrollado con Spring Boot y Angular.

## 🚀 Tecnologías

### Backend
- **Java 21**
- **Spring Boot 4.0.0**
- **Spring Security + JWT**
- **Spring Data JPA**
- **MariaDB**
- **Maven**

### Frontend
- **Angular 20.3.0**
- **TypeScript 5.9.2**
- **Bootstrap 5.3.8**
- **RxJS 7.8.0**

## 📋 Requisitos Previos

- Java 21 o superior
- Node.js 18+ y npm
- MariaDB 10.x
- Maven 3.x

## ⚙️ Configuración

### 1. Base de Datos

Crear la base de datos en MariaDB:

```sql
CREATE DATABASE dbmarketunamba;
```

### 2. Backend

1. Copia el archivo de configuración de ejemplo:
   ```bash
   cd backend/src/main/resources
   cp application.properties.example application.properties
   ```

2. Edita `application.properties` con tus credenciales:
   ```properties
   spring.datasource.url=jdbc:mariadb://localhost:3306/dbmarketunamba
   spring.datasource.username=TU_USUARIO
   spring.datasource.password=TU_PASSWORD
   app.jwt.secretKey=TU_SECRET_KEY
   ```

3. Compila y ejecuta:
   ```bash
   cd backend
   mvn clean install
   mvn spring-boot:run
   ```

El backend estará disponible en `http://localhost:8080`

### 3. Frontend

1. Copia el archivo de entorno de ejemplo:
   ```bash
   cd frontend/src/environments
   cp environment.example.ts environment.ts
   ```

2. Edita `environment.ts` con la URL de tu backend:
   ```typescript
   export const environment = {
     production: false,
     apiUrl: 'http://localhost:8080'
   };
   ```

3. Instala dependencias y ejecuta:
   ```bash
   cd frontend
   npm install
   npm start
   ```

El frontend estará disponible en `http://localhost:4200`

## 📁 Estructura del Proyecto

```
unamba-market/
├── backend/           # API REST con Spring Boot
│   ├── src/
│   │   └── main/
│   │       ├── java/
│   │       └── resources/
│   └── pom.xml
└── frontend/          # Aplicación Angular
    ├── src/
    │   └── app/
    └── package.json
```

## 🔒 Seguridad

- Autenticación basada en JWT
- Contraseñas encriptadas con BCrypt
- Validación de datos en backend y frontend
- Protección CORS configurada

## 📝 API Endpoints

### Autenticación
- `POST /auth/register` - Registro de usuario
- `POST /auth/login` - Inicio de sesión

### Productos
- `GET /product` - Listar productos
- `POST /product` - Crear producto
- `GET /product/{id}` - Obtener producto
- `PUT /product/{id}` - Actualizar producto
- `DELETE /product/{id}` - Eliminar producto

### Categorías
- `GET /category` - Listar categorías

### Favoritos
- `GET /favorite` - Listar favoritos
- `POST /favorite` - Agregar favorito
- `DELETE /favorite/{id}` - Eliminar favorito

### Chat
- `GET /chat` - Obtener conversaciones
- `POST /chat` - Enviar mensaje

## 👥 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es parte del curso de desarrollo de software de UNAMBA.

## 👤 Autores

Desarrollado por estudiantes de UNAMBA.
