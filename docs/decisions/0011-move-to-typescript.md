# 0011. Write the app in TypeScript, in strict mode

- Date: 2026-10-20
- Status: Accepted

## Context

The app was written in JavaScript, and nothing checked the values that cross its modules: the state of the engine, the payload of the Redux actions, the props of the components. The JSDoc of the engine described its state with a `@typedef`, which no tool read, and a wrong payload, such as `pressOperator('=')`, only showed when a test happened to cover it. Vite builds the app ([0008](0008-move-to-vite.md)) and Vitest runs its tests ([0009](0009-move-to-vitest.md)), and both already strip TypeScript without any setup.

## Decision

The pull request of #5 moved every file of `src/` to TypeScript 6.0, in strict mode:

- [`tsconfig.json`](../../tsconfig.json) checks `src/` with `strict`, emits nothing (`noEmit`), and targets ES2022, the newest version that every browser of the build supports (Firefox 114 lacks ES2023). `isolatedModules` and `verbatimModuleSyntax` make each import of a type say so, since Vite transforms each file alone;
- `pnpm typecheck` runs `tsc --noEmit`, and the CI job "Install, lint, test and build" runs it after the lint;
- ESLint applies the recommended rules of typescript-eslint to `src/`, and the `react/prop-types` rule is off, since TypeScript checks the props;
- the shared types of the engine are in `src/features/calculator/types.ts`: `CalculatorState`, `Operator`, a union of the four operator symbols, and `Digit`. The actions of the slice are typed with `PayloadAction`;
- `RootState`, `AppDispatch` and `AppStore` come from the store in `src/app/types.ts`, and the components read and update the store through the typed hooks `useAppSelector` and `useAppDispatch` of `src/app/hooks/`;
- the components declare their props in an interface, with every prop optional, with a default value or a safe fallback, as before;
- the tests that pass a wrong value on purpose, such as a missing digit, keep it, under a `@ts-expect-error` comment that says why;
- the configuration files and the commit tooling stay in JavaScript: they run in Node.js, outside `src/`.

## Alternatives considered

- TypeScript 7.0, the native port of the compiler: it checks much faster, but it has no JavaScript API yet, and typescript-eslint 8.71 supports TypeScript below 6.1 only.
- JSDoc types checked by TypeScript (`checkJs`): it keeps the `.js` files, but the types of the slice and the hooks would be written in comments, longer to read and to keep in sync than the TypeScript syntax.
- Staying on JavaScript: the tests cover the engine well, but a wrong payload or a wrong prop still reaches the browser before any test fails.

## Consequences

- The first strict check reported 92 errors. None was a bug of the app: they were missing types, the literal types that the frozen initial state gave the slice, and the elements that `querySelector` and `getElementById` may not find. `src/index.tsx` now throws a clear error when `index.html` has no `#root` element.
- The same tests pass, plus 3 for the typed hooks: 454 tests, 187 with the Node.js test runner and 267 in Vitest.
- Measured on 2026-10-20 in alternation with `9aeb689`, `pnpm typecheck` takes 1.19 s, and `pnpm lint` takes 1.97 s where it took 0.95 s, since typescript-eslint parses the TypeScript files. The bundle grows by 102 B, the error of `src/index.tsx`.
- The project has 4 more development dependencies: `typescript`, `typescript-eslint`, `@types/react` and `@types/react-dom`.
- A new file of `src/` is a `.ts` or `.tsx` file. Its types are written in TypeScript, and its JSDoc describes the values without repeating their types.
