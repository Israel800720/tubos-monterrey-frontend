# React + TypeScript + Vite

Esta plantilla proporciona una configuración mínima para trabajar con React en Vite con HMR y algunas reglas de ESLint.

Actualmente, hay dos plugins oficiales disponibles:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) utiliza [Babel](https://babeljs.io/) para Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) utiliza [SWC](https://swc.rs/) para Fast Refresh

## Ampliando la configuración de ESLint

Si estás desarrollando una aplicación para producción, se recomienda actualizar la configuración para habilitar reglas de lint con reconocimiento de tipos:

- Configura la propiedad `parserOptions` en el nivel superior de la siguiente manera:

```js
export default tseslint.config({
  languageOptions: {
    // otras opciones...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

- Reemplaza  `tseslint.configs.recommended` to `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
- Opcionalmente agrega `...tseslint.configs.stylisticTypeChecked`
- Instala [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) y actualiza la configuración:

```js
// eslint.config.js
import react from 'eslint-plugin-react'

export default tseslint.config({
  // Establece la versión de React
  settings: { react: { version: '18.3' } },
  plugins: {
    // Agrega el plugin de React
    react,
  },
  rules: {
    // otras reglas...
    // Habilita sus reglas recomendadas
    ...react.configs.recommended.rules,
    ...react.configs['jsx-runtime'].rules,
  },
})
```
