-- Script para agregar IDENTITY a la tabla T_Permisos
USE [IntelTaskUCR]
GO

-- Paso 1: Crear tabla temporal con IDENTITY
CREATE TABLE [dbo].[T_Permisos_TEMP](
    [CN_Id_permiso] [int] IDENTITY(1,1) NOT NULL,
    [CT_Titulo_permiso] [text] NULL,
    [CT_Descripcion_permiso] [text] NOT NULL,
    [CN_Id_estado] [tinyint] NOT NULL,
    [CT_Descripcion_rechazo] [text] NULL,
    [CF_Fecha_hora_registro] [datetime] NOT NULL,
    [CF_Fecha_hora_inicio_permiso] [datetime] NOT NULL,
    [CF_Fecha_hora_fin_permiso] [datetime] NOT NULL,
    [CN_Usuario_creador] [int] NOT NULL,
    CONSTRAINT [PK_T_Permisos_TEMP] PRIMARY KEY CLUSTERED 
    (
        [CN_Id_permiso] ASC
    )
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

-- Paso 2: Copiar datos existentes (si los hay)
SET IDENTITY_INSERT [dbo].[T_Permisos_TEMP] ON;
INSERT INTO [dbo].[T_Permisos_TEMP] (
    [CN_Id_permiso], [CT_Titulo_permiso], [CT_Descripcion_permiso], [CN_Id_estado],
    [CT_Descripcion_rechazo], [CF_Fecha_hora_registro], [CF_Fecha_hora_inicio_permiso],
    [CF_Fecha_hora_fin_permiso], [CN_Usuario_creador]
)
SELECT 
    [CN_Id_permiso], [CT_Titulo_permiso], [CT_Descripcion_permiso], [CN_Id_estado],
    [CT_Descripcion_rechazo], [CF_Fecha_hora_registro], [CF_Fecha_hora_inicio_permiso],
    [CF_Fecha_hora_fin_permiso], [CN_Usuario_creador]
FROM [dbo].[T_Permisos];
SET IDENTITY_INSERT [dbo].[T_Permisos_TEMP] OFF;

-- Paso 3: Eliminar restricciones de la tabla original
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_T_Adjuntos_X_Permisos_T_Permisos')
    ALTER TABLE [dbo].[T_Adjuntos_X_Permisos] DROP CONSTRAINT [FK_T_Adjuntos_X_Permisos_T_Permisos];

IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_T_Permisos_T_Usuarios')
    ALTER TABLE [dbo].[T_Permisos] DROP CONSTRAINT [FK_T_Permisos_T_Usuarios];

IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK__T_Permiso__CN_Es__151B244E')
    ALTER TABLE [dbo].[T_Permisos] DROP CONSTRAINT [FK__T_Permiso__CN_Es__151B244E];

-- Paso 4: Eliminar tabla original
DROP TABLE [dbo].[T_Permisos];

-- Paso 5: Renombrar tabla temporal
EXEC sp_rename 'T_Permisos_TEMP', 'T_Permisos';

-- Paso 6: Recrear restricciones
ALTER TABLE [dbo].[T_Permisos] WITH CHECK ADD CONSTRAINT [FK__T_Permiso__CN_Es__151B244E] FOREIGN KEY([CN_Id_estado])
REFERENCES [dbo].[T_Estados] ([CN_Id_estado]);

ALTER TABLE [dbo].[T_Permisos] CHECK CONSTRAINT [FK__T_Permiso__CN_Es__151B244E];

ALTER TABLE [dbo].[T_Permisos] WITH CHECK ADD CONSTRAINT [FK_T_Permisos_T_Usuarios] FOREIGN KEY([CN_Usuario_creador])
REFERENCES [dbo].[T_Usuarios] ([CN_Id_usuario]);

ALTER TABLE [dbo].[T_Permisos] CHECK CONSTRAINT [FK_T_Permisos_T_Usuarios];

-- Recrear FK de adjuntos si existe la tabla
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'T_Adjuntos_X_Permisos')
BEGIN
    ALTER TABLE [dbo].[T_Adjuntos_X_Permisos] WITH CHECK ADD CONSTRAINT [FK_T_Adjuntos_X_Permisos_T_Permisos] FOREIGN KEY([CN_Id_permiso])
    REFERENCES [dbo].[T_Permisos] ([CN_Id_permiso]);
    
    ALTER TABLE [dbo].[T_Adjuntos_X_Permisos] CHECK CONSTRAINT [FK_T_Adjuntos_X_Permisos_T_Permisos];
END

PRINT 'Tabla T_Permisos actualizada correctamente con IDENTITY';
