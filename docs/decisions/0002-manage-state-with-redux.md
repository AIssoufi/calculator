# 0002. Manage the calculator state with Redux

- Date: 2018-04-22
- Status: Accepted

## Context

The calculator state (the number on the screen, the pending operator, the running total) is read by the screen and changed by three keypads: the digits, the operators and the functions. Until then, the app was a static layout with no state (`c471932`, `05ff2f9`): the keys did nothing yet.

## Decision

When the keys were wired up, Redux 4 and React Redux 5 came to hold the state in one store (`c1dfffb` added them to `package.json`, and `0c17f50` to `0cc6e6a` wrote the logic, from 2018-04-21 to 2018-04-26). Reducers compute the next state from the actions sent by the keypads, and container components connect the presentational components to the store.

[0004](0004-move-to-redux-toolkit.md) later replaced the hand-written actions and reducers with Redux Toolkit, on the same Redux store.

## Alternatives considered

The commits record no other option. React component state, lifted to the common parent `Calculatrice`, was not taken; it works for a tree this small, at the cost of passing callbacks through every keypad.

## Consequences

- Every key press is an action, and the state changes in one place.
- The project gained two dependencies, `redux` and `react-redux`, and the action types, action creators and reducers that Redux needed at the time.
