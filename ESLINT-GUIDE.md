# 🔧 ESLint & Prettier - Guía Rápida

## ⚡ Comandos principales

### Frontend
```bash
cd frontend
npm run lint           # Revisar problemas
npm run lint:fix       # Arreglar automáticamente
npm run lint:strict    # Cero tolerancia a warnings
npm run code-quality   # ESLint + Prettier
```

### Backend
```bash
cd backend
npm run lint           # Revisar problemas
npm run lint:fix       # Arreglar automáticamente
npm run code-quality   # ESLint + Prettier
```

## 🎯 Reglas principales activadas

- ✅ Variables no usadas → Warning
- ✅ Console.log → Warning (frontend), permitido (backend)
- ✅ Prefer const → Error
- ✅ No debugger → Warning
- ✅ Código inalcanzable → Error
- ✅ Template literals → Warning
- ✅ Seguridad básica → Error

## 📝 Notas importantes

- Los archivos `.eslintignore` se movieron a `_to_delete/` (ahora usa `ignores` en config)
- Configuración simplificada para evitar problemas de type information
- VS Code configurado para formatear automáticamente al guardar
