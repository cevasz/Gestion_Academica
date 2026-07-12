# 🤝 Guía de Contribución

¡Gracias por tu interés en contribuir al Sistema de Digitalización Institucional! Esta guía te ayudará a empezar.

## 📋 Tabla de Contenidos

- [Código de Conducta](#código-de-conducta)
- [¿Cómo puedo contribuir?](#cómo-puedo-contribuir)
- [Configuración del Entorno](#configuración-del-entorno)
- [Proceso de Desarrollo](#proceso-de-desarrollo)
- [Estándares de Código](#estándares-de-código)
- [Proceso de Pull Request](#proceso-de-pull-request)

---

## 📜 Código de Conducta

Este proyecto se adhiere a un Código de Conducta. Al participar, se espera que mantengas este código. Por favor reporta comportamientos inaceptables a los mantenedores del proyecto.

## 🚀 ¿Cómo puedo contribuir?

### Reportar Bugs

Si encuentras un bug:

1. Verifica que no haya sido reportado anteriormente en [Issues](https://github.com/cevasz/Modulo_Academico/issues)
2. Si no existe, crea un nuevo issue con:
   - Descripción clara del problema
   - Pasos para reproducirlo
   - Comportamiento esperado vs actual
   - Screenshots si es relevante
   - Información del entorno (navegador, OS, versión)

### Sugerir Mejoras

Para sugerir nuevas funcionalidades:

1. Abre un issue con la etiqueta "enhancement"
2. Describe claramente:
   - El problema que resuelve
   - La solución propuesta
   - Alternativas consideradas
   - Impacto en usuarios existentes

### Contribuir Código

1. Haz fork del repositorio
2. Crea una rama desde `main`: `git checkout -b feature/mi-nueva-funcionalidad`
3. Realiza tus cambios
4. Asegúrate de que el código cumple los estándares
5. Commit con mensajes descriptivos
6. Push a tu fork
7. Abre un Pull Request

---

## ⚙️ Configuración del Entorno

### Prerrequisitos

- Node.js 18+
- npm o yarn
- Cuenta en Supabase
- Git

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/cevasz/Modulo_Academico.git
cd Modulo_Academico

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Edita .env con tus credenciales de Supabase

# Iniciar servidor de desarrollo
npm run dev
```

### Configurar Base de Datos

1. Crea un proyecto en [Supabase](https://supabase.com)
2. Ejecuta el archivo `supabase_schema.sql` en el SQL Editor
3. Sigue la guía en `GUIA_SUPABASE.md`
4. Configura Storage según `supabase_storage_setup.md`

---

## 🔄 Proceso de Desarrollo

### Ramas

- `main` - Código en producción (protegida)
- `develop` - Rama de desarrollo (integración)
- `feature/*` - Nuevas funcionalidades
- `bugfix/*` - Corrección de bugs
- `hotfix/*` - Correcciones urgentes en producción

### Flujo de Trabajo

1. **Crear rama desde main**
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feature/nombre-descriptivo
   ```

2. **Desarrollar**
   - Escribe código limpio y documentado
   - Sigue los estándares del proyecto
   - Prueba localmente

3. **Commit**
   ```bash
   git add .
   git commit -m "tipo: descripción breve"
   ```

4. **Push y PR**
   ```bash
   git push origin feature/nombre-descriptivo
   ```
   Luego abre un Pull Request en GitHub

---

## 📏 Estándares de Código

### JavaScript/React

- Usa **camelCase** para variables y funciones
- Usa **PascalCase** para componentes
- Usa `const` por defecto, `let` cuando sea necesario, evita `var`
- Componentes funcionales con hooks
- Destructuring de props
- PropTypes o TypeScript (futuro)

```jsx
// ✅ Bueno
const MiComponente = ({ nombre, edad }) => {
  const [estado, setEstado] = useState(false);

  return (
    <div className="mi-clase">
      {nombre}
    </div>
  );
};

// ❌ Malo
function mi_componente(props) {
  var x = true;
  return <div>{props.nombre}</div>
}
```

### CSS/Tailwind

- Usa clases de Tailwind en lugar de CSS custom cuando sea posible
- Agrupa clases relacionadas
- Usa `className` consistente

```jsx
// ✅ Bueno
<button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
  Click
</button>

// ❌ Malo
<button className="px-4 bg-indigo-600 py-2 rounded-lg text-white hover:bg-indigo-700 transition">
  Click
</button>
```

### Commits

Sigue [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - Nueva funcionalidad
- `fix:` - Corrección de bug
- `docs:` - Solo documentación
- `style:` - Formato, sin cambios de código
- `refactor:` - Refactorización
- `test:` - Agregar tests
- `chore:` - Mantenimiento

Ejemplos:
```
feat: agregar módulo de asistencia
fix: corregir validación de teléfono
docs: actualizar README con instrucciones
refactor: optimizar consultas de Supabase
```

---

## 🔍 Proceso de Pull Request

### Checklist antes de PR

- [ ] El código compila sin errores
- [ ] Funciona localmente sin bugs
- [ ] Sigue los estándares de código
- [ ] Documentación actualizada si es necesario
- [ ] Commit messages son descriptivos
- [ ] No hay conflictos con `main`

### Template de PR

```markdown
## Descripción
[Descripción clara de los cambios]

## Tipo de cambio
- [ ] Bug fix
- [ ] Nueva funcionalidad
- [ ] Breaking change
- [ ] Documentación

## ¿Cómo probarlo?
1. Paso 1
2. Paso 2
3. ...

## Screenshots
[Si aplica]

## Checklist
- [ ] Mi código sigue los estándares
- [ ] He revisado mi propio código
- [ ] He comentado código complejo
- [ ] He actualizado la documentación
- [ ] Mis cambios no generan warnings
```

### Revisión

- Los PRs serán revisados por mantenedores
- Se pueden solicitar cambios
- Una vez aprobado, será merged a `main`
- El PR será cerrado automáticamente

---

## 🧪 Testing

Actualmente el proyecto no tiene tests automatizados. Contribuciones para agregar testing son bienvenidas:

- Unit tests con Jest
- Component tests con React Testing Library
- E2E tests con Cypress o Playwright

---

## 📖 Documentación

Si agregas una nueva funcionalidad:

1. Actualiza el README correspondiente
2. Agrega comentarios en el código
3. Crea ejemplos de uso si es complejo
4. Actualiza CHANGELOG.md

---

## ❓ ¿Necesitas Ayuda?

- Abre un issue con la etiqueta "question"
- Revisa la documentación existente
- Contacta a los mantenedores

---

## 🎉 ¡Gracias por Contribuir!

Cada contribución, sin importar su tamaño, es valiosa. ¡Gracias por hacer este proyecto mejor!

---

## 📞 Contacto

- **Issues:** [GitHub Issues](https://github.com/cevasz/Modulo_Academico/issues)
- **Discussions:** [GitHub Discussions](https://github.com/cevasz/Modulo_Academico/discussions)

---

**Mantenedores del Proyecto**
- [@cevasz](https://github.com/cevasz)
