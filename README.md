# AutoDrive - Sistema de Gestión de Alquiler de Vehículos 🚗💨

Sistema integral de gestión de reservas, control de flota vehicular, contratos, inspecciones y facturación con comprobantes fiscales para agencias de alquiler de vehículos (Rent-a-Car).

---

## 👥 Equipo de Desarrollo (UASD - Grupo 5)
* **Jorge Antonio Vásquez Peña**
* **Esteyesí Martínez**
* **Glimmer Méndez**
* **Dodany Pichardo**

---

## 🚀 Características Principales

* **Control de Flota en Tiempo Real:** Seguimiento de odómetro, combustible, placas dominicanas, categoría y estados (*Disponible*, *Alquilado*, *Mantenimiento*).
* **Gestión de Reservas y Contratos:** Cotización automática de días de renta, cálculo de pólizas de seguro (Básico, Full, Cero Deducible), cargos adicionales (GPS, conductor adicional, silla de bebé) e impuestos (**ITBIS 18%**).
* **Check-in / Retorno e Inspección:** Auditoría del estado de entrega del vehículo, revisión de odómetro final, combustible y registro de incidencias o daños.
* **Directorio de Clientes:** Registro y validación de clientes por Cédula / Pasaporte y Licencia de conducir vigente.
* **Facturación Fiscal:** Generación de comprobantes tipo Consumidor Final (B02) y Crédito Fiscal (B01) listos para impresión física o PDF.
* **Persistencia Integrada:** Capa de almacenamiento local sincronizada y lista para conectar a la API REST y base de datos SQL Server.

---

## 🛠️ Stack Tecnológico

* **Frontend:** HTML5 Semántico, CSS3 Moderno (Dark Mode / Automotive UI, Flexbox, CSS Grid), JavaScript ES6+ (Modular & Event-Driven).
* **Backend:** Diseñado para consumir API RESTful (Node.js / Express o C# ASP.NET Core).
* **Base de Datos:** Microsoft SQL Server (Esquema relacional normalizado con integridad referencial, vistas e índices).

---

## 📁 Estructura del Repositorio

```text
Proyecto_AutoDrive/
│
├── index.html                  # Interfaz principal SPA del sistema
├── css/
│   └── styles.css              # Estilos visuales, temas y reglas de impresión
├── js/
│   └── app.js                  # Lógica de negocio, estado, validaciones y cálculos
├── database/
│   └── schema_autodrive.sql    # Script DDL completo para Microsoft SQL Server
├── .gitignore                  # Exclusiones de control de versiones
└── README.md                   # Documentación oficial del proyecto
```

---

## ⚙️ Puesta en Marcha

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/Glimer04/Proyecto_AutoDrive.git
   cd Proyecto_AutoDrive
   ```

2. **Configuración de la Base de Datos:**
   * Abrir **SQL Server Management Studio (SSMS)**.
   * Abrir y ejecutar el script `database/schema_autodrive.sql`.
   * Verificar la creación de la base de datos `AutoDriveDB` y la inserción de los catálogos y datos iniciales.

3. **Ejecutar la Aplicación Web:**
   * Abrir el archivo `index.html` en cualquier navegador web moderno (Chrome, Edge, Firefox).
   * Opcional: Ejecutar mediante una extensión de servidor local como *Live Server* en VS Code.

---

## 📄 Licencia
Proyecto desarrollado con fines académicos para la Universidad Autónoma de Santo Domingo (UASD).
