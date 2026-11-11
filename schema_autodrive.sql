-- ======================================================================================
-- PROYECTO: AutoDrive - Sistema de Gestión de Alquiler de Vehículos
-- BASE DE DATOS: Microsoft SQL Server
-- AUTORES: Jorge Vásquez, Esteyesí Martínez, Glimmer Méndez, Dodany Pichardo
-- UNIVERSIDAD: Universidad Autónoma de Santo Domingo (UASD)
-- ======================================================================================

IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'AutoDriveDB')
BEGIN
    CREATE DATABASE AutoDriveDB;
END
GO

USE AutoDriveDB;
GO

-- 1. TABLAS DE CATÁLOGOS Y CONFIGURACIÓN
-- ======================================================================================
IF OBJECT_ID(N'dbo.TiposDocumento', N'U') IS NULL
CREATE TABLE dbo.TiposDocumento (
    IdTipoDocumento INT IDENTITY(1,1) PRIMARY KEY,
    Nombre VARCHAR(30) NOT NULL UNIQUE,
    Descripcion VARCHAR(100) NULL,
    Activo BIT DEFAULT 1
);
GO

IF OBJECT_ID(N'dbo.Roles', N'U') IS NULL
CREATE TABLE dbo.Roles (
    IdRol INT IDENTITY(1,1) PRIMARY KEY,
    NombreRol VARCHAR(50) NOT NULL UNIQUE,
    Descripcion VARCHAR(150) NULL
);
GO

IF OBJECT_ID(N'dbo.Usuarios', N'U') IS NULL
CREATE TABLE dbo.Usuarios (
    IdUsuario INT IDENTITY(1,1) PRIMARY KEY,
    IdRol INT NOT NULL FOREIGN KEY REFERENCES dbo.Roles(IdRol),
    NombreCompleto VARCHAR(100) NOT NULL,
    Username VARCHAR(50) NOT NULL UNIQUE,
    PasswordHash VARCHAR(255) NOT NULL,
    Email VARCHAR(100) NOT NULL UNIQUE,
    Activo BIT DEFAULT 1,
    FechaCreacion DATETIME DEFAULT GETDATE()
);
GO

-- 2. GESTIÓN DE CLIENTES
-- ======================================================================================
IF OBJECT_ID(N'dbo.Clientes', N'U') IS NULL
CREATE TABLE dbo.Clientes (
    IdCliente INT IDENTITY(1,1) PRIMARY KEY,
    IdTipoDocumento INT NOT NULL FOREIGN KEY REFERENCES dbo.TiposDocumento(IdTipoDocumento),
    NumeroDocumento VARCHAR(25) NOT NULL UNIQUE,
    Nombre VARCHAR(60) NOT NULL,
    Apellido VARCHAR(60) NOT NULL,
    Telefono VARCHAR(20) NOT NULL,
    Email VARCHAR(100) NOT NULL,
    NumeroLicencia VARCHAR(30) NOT NULL UNIQUE,
    FechaVencimientoLicencia DATE NOT NULL,
    Nacionalidad VARCHAR(50) DEFAULT 'República Dominicana',
    Direccion VARCHAR(200) NULL,
    Activo BIT DEFAULT 1,
    FechaRegistro DATETIME DEFAULT GETDATE()
);
GO

-- 3. FLOTA VEHICULAR Y CLASIFICACIÓN
-- ======================================================================================
IF OBJECT_ID(N'dbo.CategoriasVehiculo', N'U') IS NULL
CREATE TABLE dbo.CategoriasVehiculo (
    IdCategoria INT IDENTITY(1,1) PRIMARY KEY,
    Nombre VARCHAR(50) NOT NULL UNIQUE,
    TarifaDiariaBase DECIMAL(12,2) NOT NULL CHECK (TarifaDiariaBase > 0),
    DepositoGarantia DECIMAL(12,2) NOT NULL CHECK (DepositoGarantia >= 0),
    Descripcion VARCHAR(200) NULL
);
GO

IF OBJECT_ID(N'dbo.Marcas', N'U') IS NULL
CREATE TABLE dbo.Marcas (
    IdMarca INT IDENTITY(1,1) PRIMARY KEY,
    Nombre VARCHAR(50) NOT NULL UNIQUE
);
GO

IF OBJECT_ID(N'dbo.Modelos', N'U') IS NULL
CREATE TABLE dbo.Modelos (
    IdModelo INT IDENTITY(1,1) PRIMARY KEY,
    IdMarca INT NOT NULL FOREIGN KEY REFERENCES dbo.Marcas(IdMarca),
    Nombre VARCHAR(60) NOT NULL,
    CONSTRAINT UQ_Marca_Modelo UNIQUE(IdMarca, Nombre)
);
GO

IF OBJECT_ID(N'dbo.Vehiculos', N'U') IS NULL
CREATE TABLE dbo.Vehiculos (
    IdVehiculo INT IDENTITY(1,1) PRIMARY KEY,
    IdModelo INT NOT NULL FOREIGN KEY REFERENCES dbo.Modelos(IdModelo),
    IdCategoria INT NOT NULL FOREIGN KEY REFERENCES dbo.CategoriasVehiculo(IdCategoria),
    Placa VARCHAR(15) NOT NULL UNIQUE,
    ChasisVIN VARCHAR(30) NOT NULL UNIQUE,
    Anio INT NOT NULL CHECK (Anio BETWEEN 1990 AND 2030),
    Color VARCHAR(30) NOT NULL,
    Transmision VARCHAR(20) NOT NULL CHECK (Transmision IN ('Automática', 'Mecánica')),
    TipoCombustible VARCHAR(20) NOT NULL CHECK (TipoCombustible IN ('Gasolina', 'Gasoil/Diésel', 'Híbrido', 'Eléctrico', 'GLP')),
    CapacidadPasajeros INT DEFAULT 5 CHECK (CapacidadPasajeros > 0),
    KilometrajeActual INT NOT NULL DEFAULT 0 CHECK (KilometrajeActual >= 0),
    NivelCombustible VARCHAR(20) NOT NULL DEFAULT 'Full' CHECK (NivelCombustible IN ('Full', '3/4', '1/2', '1/4', 'Reserva')),
    Estado VARCHAR(20) NOT NULL DEFAULT 'Disponible' CHECK (Estado IN ('Disponible', 'Alquilado', 'Mantenimiento', 'Inactivo')),
    FechaRegistro DATETIME DEFAULT GETDATE()
);
GO

-- 4. OPCIONES DE SEGUROS Y ADICIONALES
-- ======================================================================================
IF OBJECT_ID(N'dbo.OpcionesSeguro', N'U') IS NULL
CREATE TABLE dbo.OpcionesSeguro (
    IdSeguro INT IDENTITY(1,1) PRIMARY KEY,
    Nombre VARCHAR(60) NOT NULL UNIQUE,
    CostoDiario DECIMAL(10,2) NOT NULL CHECK (CostoDiario >= 0),
    Cobertura VARCHAR(250) NOT NULL,
    DeduciblePorcentaje DECIMAL(5,2) DEFAULT 0.00
);
GO

IF OBJECT_ID(N'dbo.Adicionales', N'U') IS NULL
CREATE TABLE dbo.Adicionales (
    IdAdicional INT IDENTITY(1,1) PRIMARY KEY,
    Nombre VARCHAR(60) NOT NULL UNIQUE,
    CostoDiario DECIMAL(10,2) NOT NULL CHECK (CostoDiario >= 0),
    Descripcion VARCHAR(150) NULL
);
GO

-- 5. CONTRATOS DE ALQUILER Y OPERACIONES
-- ======================================================================================
IF OBJECT_ID(N'dbo.ContratosAlquiler', N'U') IS NULL
CREATE TABLE dbo.ContratosAlquiler (
    IdContrato INT IDENTITY(1,1) PRIMARY KEY,
    NumeroContrato VARCHAR(25) NOT NULL UNIQUE,
    IdCliente INT NOT NULL FOREIGN KEY REFERENCES dbo.Clientes(IdCliente),
    IdVehiculo INT NOT NULL FOREIGN KEY REFERENCES dbo.Vehiculos(IdVehiculo),
    IdUsuario INT NOT NULL FOREIGN KEY REFERENCES dbo.Usuarios(IdUsuario),
    IdSeguro INT NOT NULL FOREIGN KEY REFERENCES dbo.OpcionesSeguro(IdSeguro),
    FechaInicio DATETIME NOT NULL,
    FechaFinEsperada DATETIME NOT NULL,
    FechaRetornoReal DATETIME NULL,
    KmSalida INT NOT NULL,
    KmRetorno INT NULL,
    NivelCombustibleSalida VARCHAR(20) NOT NULL,
    NivelCombustibleRetorno VARCHAR(20) NULL,
    DiasRenta INT NOT NULL CHECK (DiasRenta > 0),
    TarifaDiariaAplicada DECIMAL(12,2) NOT NULL,
    MontoBaseRenta DECIMAL(12,2) NOT NULL,
    MontoSeguro DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    MontoAdicionales DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    SubTotal DECIMAL(12,2) NOT NULL,
    TasaITBIS DECIMAL(5,2) NOT NULL DEFAULT 18.00,
    MontoITBIS DECIMAL(12,2) NOT NULL,
    MontoTotal DECIMAL(12,2) NOT NULL,
    DepositoGarantia DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    Estado VARCHAR(20) NOT NULL DEFAULT 'Vigente' CHECK (Estado IN ('Vigente', 'Finalizado', 'Cancelado', 'En Mora')),
    FechaCreacion DATETIME DEFAULT GETDATE(),
    CONSTRAINT CK_Fechas_Contrato CHECK (FechaFinEsperada >= FechaInicio)
);
GO

IF OBJECT_ID(N'dbo.ContratoAdicionales', N'U') IS NULL
CREATE TABLE dbo.ContratoAdicionales (
    IdContrato INT NOT NULL FOREIGN KEY REFERENCES dbo.ContratosAlquiler(IdContrato),
    IdAdicional INT NOT NULL FOREIGN KEY REFERENCES dbo.Adicionales(IdAdicional),
    CostoDiarioAplicado DECIMAL(10,2) NOT NULL,
    SubTotal DECIMAL(10,2) NOT NULL,
    PRIMARY KEY (IdContrato, IdAdicional)
);
GO

-- 6. INSPECCIONES DE VEHÍCULOS (CHECK-IN / RETORNO)
-- ======================================================================================
IF OBJECT_ID(N'dbo.Inspecciones', N'U') IS NULL
CREATE TABLE dbo.Inspecciones (
    IdInspeccion INT IDENTITY(1,1) PRIMARY KEY,
    IdContrato INT NOT NULL FOREIGN KEY REFERENCES dbo.ContratosAlquiler(IdContrato),
    TipoInspeccion VARCHAR(20) NOT NULL CHECK (TipoInspeccion IN ('Salida', 'Retorno')),
    FechaInspeccion DATETIME DEFAULT GETDATE(),
    Kilometraje INT NOT NULL,
    NivelCombustible VARCHAR(20) NOT NULL,
    TieneGolpes BIT DEFAULT 0,
    TieneRayones BIT DEFAULT 0,
    InteriorLimpio BIT DEFAULT 1,
    RuedaRepuesto BIT DEFAULT 1,
    KitHerramientas BIT DEFAULT 1,
    CargosAdicionales DECIMAL(10,2) DEFAULT 0.00,
    Observaciones VARCHAR(300) NULL,
    IdUsuarioInspector INT NOT NULL FOREIGN KEY REFERENCES dbo.Usuarios(IdUsuario)
);
GO

-- 7. FACTURACIÓN Y COMPROBANTES FISCALES (DGII)
-- ======================================================================================
IF OBJECT_ID(N'dbo.Facturas', N'U') IS NULL
CREATE TABLE dbo.Facturas (
    IdFactura INT IDENTITY(1,1) PRIMARY KEY,
    IdContrato INT NOT NULL UNIQUE FOREIGN KEY REFERENCES dbo.ContratosAlquiler(IdContrato),
    NumeroFactura VARCHAR(30) NOT NULL UNIQUE,
    NCF VARCHAR(19) NOT NULL UNIQUE,
    TipoNCF VARCHAR(20) NOT NULL DEFAULT 'B02' CHECK (TipoNCF IN ('B01', 'B02', 'B14', 'B15')),
    FechaEmision DATETIME DEFAULT GETDATE(),
    SubTotal DECIMAL(12,2) NOT NULL,
    ITBIS DECIMAL(12,2) NOT NULL,
    CargosExtra DECIMAL(12,2) DEFAULT 0.00,
    TotalFacturado DECIMAL(12,2) NOT NULL,
    Estado VARCHAR(20) DEFAULT 'Emitida' CHECK (Estado IN ('Emitida', 'Pagada', 'Anulada'))
);
GO

IF OBJECT_ID(N'dbo.Pagos', N'U') IS NULL
CREATE TABLE dbo.Pagos (
    IdPago INT IDENTITY(1,1) PRIMARY KEY,
    IdFactura INT NOT NULL FOREIGN KEY REFERENCES dbo.Facturas(IdFactura),
    MetodoPago VARCHAR(30) NOT NULL CHECK (MetodoPago IN ('Efectivo', 'Tarjeta de Crédito', 'Tarjeta de Débito', 'Transferencia')),
    Monto DECIMAL(12,2) NOT NULL CHECK (Monto > 0),
    Referencia VARCHAR(50) NULL,
    FechaPago DATETIME DEFAULT GETDATE()
);
GO

-- 8. MANTENIMIENTO DE FLOTA
-- ======================================================================================
IF OBJECT_ID(N'dbo.Mantenimientos', N'U') IS NULL
CREATE TABLE dbo.Mantenimientos (
    IdMantenimiento INT IDENTITY(1,1) PRIMARY KEY,
    IdVehiculo INT NOT NULL FOREIGN KEY REFERENCES dbo.Vehiculos(IdVehiculo),
    TipoMantenimiento VARCHAR(30) NOT NULL CHECK (TipoMantenimiento IN ('Preventivo', 'Correctivo', 'Inspección General', 'Cambio Neumáticos')),
    Descripcion VARCHAR(250) NOT NULL,
    KilometrajeServicio INT NOT NULL,
    CostoTotal DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    FechaIngreso DATE NOT NULL,
    FechaSalida DATE NULL,
    TallerResponsable VARCHAR(100) NOT NULL,
    Estado VARCHAR(20) DEFAULT 'En Proceso' CHECK (Estado IN ('En Proceso', 'Completado', 'Cancelado'))
);
GO

-- 9. DATOS SEMILLA / CATÁLOGOS INICIALES
-- ======================================================================================
INSERT INTO dbo.TiposDocumento (Nombre, Descripcion) VALUES 
('Cédula de Identidad', 'Cédula de Identidad y Electoral Dominicana'),
('Pasaporte', 'Pasaporte Internacional Extranjero');

INSERT INTO dbo.Roles (NombreRol, Descripcion) VALUES 
('Administrador', 'Control total administrativo y fiscal del sistema'),
('Agente de Renta', 'Gestión de reservas, contratos y entrega de flota'),
('Auditor', 'Revisión contable, facturación y reportes de rentabilidad');

INSERT INTO dbo.Usuarios (IdRol, NombreCompleto, Username, PasswordHash, Email) VALUES 
(1, 'Administrador AutoDrive', 'admin', 'e10adc3949ba59abbe56e057f20f883e', 'admin@autodrive.com.do'),
(2, 'Jorge Vásquez', 'jvasquez', 'e10adc3949ba59abbe56e057f20f883e', 'jorge@autodrive.com.do');

INSERT INTO dbo.CategoriasVehiculo (Nombre, TarifaDiariaBase, DepositoGarantia, Descripcion) VALUES 
('Compacto Económico', 2200.00, 10000.00, 'Vehículo eficiente para ciudad, bajo consumo de combustible'),
('Sedán Confort', 3000.00, 12000.00, 'Espacioso, baúl amplio, comodidad en carretera'),
('SUV Premium', 4800.00, 20000.00, 'Tracción integral, confort superior y espacio para toda la familia'),
('Camioneta / Pickup 4x4', 5500.00, 25000.00, 'Alta capacidad de carga, potencia todo terreno para trabajos y aventuras');

INSERT INTO dbo.Marcas (Nombre) VALUES ('Toyota'), ('Honda'), ('Hyundai'), ('Nissan'), ('Ford');

INSERT INTO dbo.Modelos (IdMarca, Nombre) VALUES 
(1, 'Corolla'), (1, 'RAV4'), (1, 'Hilux 4x4'),
(2, 'Civic'), (2, 'CR-V'),
(3, 'Tucson'), (3, 'Elantra'),
(4, 'Frontier 4x4'),
(5, 'Explorer');

INSERT INTO dbo.OpcionesSeguro (Nombre, CostoDiario, Cobertura, DeduciblePorcentaje) VALUES 
('Seguro Básico Obligatorio', 450.00, 'Responsabilidad Civil hacia terceros y daños a la propiedad', 20.00),
('Seguro Full Cobertura', 950.00, 'Colisión, vuelco, robo parcial/total y asistencia vial 24/7', 10.00),
('Protección Total Cero Deducible', 1400.00, 'Cobertura 100% integral sin deducible ante cualquier siniestro', 0.00);

INSERT INTO dbo.Adicionales (Nombre, CostoDiario, Descripcion) VALUES 
('GPS Navegador Garmin', 250.00, 'Navegación satelital sin necesidad de datos móviles'),
('Silla de Bebé / Asiento Infantil', 200.00, 'Asiento homologado de seguridad para niños'),
('Conductor Adicional Autorizado', 350.00, 'Habilitación de un segundo conductor en la póliza');

INSERT INTO dbo.Vehiculos (IdModelo, IdCategoria, Placa, ChasisVIN, Anio, Color, Transmision, TipoCombustible, KilometrajeActual, NivelCombustible, Estado) VALUES 
(2, 3, 'G-584912', '2T3RFREV8KC102938', 2023, 'Blanco Perla', 'Automática', 'Gasolina', 28450, 'Full', 'Disponible'),
(1, 2, 'A-492104', '4T1B11HK5JU749102', 2022, 'Gris Plata', 'Automática', 'Gasolina', 42100, 'Full', 'Disponible'),
(3, 4, 'L-839201', 'MROEB8CD901847192', 2024, 'Negro Ébano', 'Automática', 'Gasoil/Diésel', 15200, 'Full', 'Disponible'),
(5, 3, 'G-619283', '1FM5K8F84MGA82910', 2023, 'Rojo Borgoña', 'Automática', 'Gasolina', 33700, '3/4', 'Alquilado'),
(6, 3, 'G-309182', 'KM8J33A48NU918234', 2021, 'Azul Marino', 'Automática', 'Gasolina', 58000, '1/2', 'Mantenimiento');

INSERT INTO dbo.Clientes (IdTipoDocumento, NumeroDocumento, Nombre, Apellido, Telefono, Email, NumeroLicencia, FechaVencimientoLicencia, Direccion) VALUES 
(1, '001-1827491-3', 'Manuel', 'Rosario Méndez', '809-555-0182', 'manuel.rosario@email.com', 'LIC-9481920', '2028-09-15', 'Av. Enriquillo #42, Barahona, RD'),
(1, '402-2918273-1', 'Laura', 'Guzmán Peña', '829-555-8392', 'laura.guzman@email.com', 'LIC-1029481', '2027-11-20', 'Calle Delmonte y Tejada #18, Barahona, RD');

PRINT 'Base de datos AutoDriveDB estructurada e inicializada exitosamente.';
GO
