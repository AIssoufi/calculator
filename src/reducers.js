import { combineReducers } from 'redux';
import {
  AFFICHER,
  ADDITIONNER,
  APPUYER_SUR_UNE_TOUCHE_NUMERIQUE,
  DIVISER,
  MULTIPLIER,
  REINITIALISER,
  SOUSTRAIRE,
  VALIDER,
  ChoixAffichage
} from './actions';

const initialState = {
  resultat: 0,
  saisiIntermédiaire: 0,
  opérande1: 0,
  opérande2: 0,
  opérateur: '+'
};

function claculer({ opérateur, opérande1, opérande2 }) {
  switch(opérateur) {
    case '+':
      return opérande1 + opérande2;
    case '-':
      return opérande1 - opérande2;
    case '*':
      return opérande1 * opérande2;
    case '/':
      return opérande1 / opérande2;
    default:
      return 0;
  }
}

function pave(state = initialState, action) {
  switch(action.type) {
    case ADDITIONNER:
      return (state.opérande1 && state.opérande2) ? {
        ...state,
        resultat: claculer(state),
        opérande1: claculer(state),
        opérande2: 0,
        opérateur: '+'
      } : {
        ...state,
        opérande1: (!state.opérande1) ? state.saisiIntermédiaire : state.opérande1,
        opérande2: (state.opérande1 && !state.opérande2) ? state.saisiIntermédiaire : state.opérande2,
        saisiIntermédiaire: 0,
        opérateur: '+'
      };
    case DIVISER:
    return (state.opérande1 && state.opérande2) ? {
      ...state,
      resultat: claculer(state),
      opérande1: claculer(state),
      opérande2: 0,
      opérateur: '/'
    } : {
      ...state,
      opérande1: (!state.opérande1) ? state.saisiIntermédiaire : state.opérande1,
      opérande2: (state.opérande1 && !state.opérande2) ? state.saisiIntermédiaire : state.opérande2,
      saisiIntermédiaire: 0,
      opérateur: '/'
    };
    case MULTIPLIER:
      return (state.opérande1 && state.opérande2) ? {
        ...state,
        resultat: claculer(state),
        opérande1: claculer(state),
        opérande2: 0,
        opérateur: '*'
      } : {
        ...state,
        opérande1: (!state.opérande1) ? state.saisiIntermédiaire : state.opérande1,
        opérande2: (state.opérande1 && !state.opérande2) ? state.saisiIntermédiaire : state.opérande2,
        saisiIntermédiaire: 0,
        opérateur: '*'
      };
    case SOUSTRAIRE:
      return (state.opérande1 && state.opérande2) ? {
        ...state,
        resultat: claculer(state),
        opérande1: claculer(state),
        opérande2: 0,
        opérateur: '-'
      } : {
        ...state,
        opérande1: (!state.opérande1) ? state.saisiIntermédiaire : state.opérande1,
        opérande2: (state.opérande1 && !state.opérande2) ? state.saisiIntermédiaire : state.opérande2,
        saisiIntermédiaire: 0,
        opérateur: '-'
      };
    case VALIDER: // touche égale
      return {
        ...state,
        resultat: claculer((!state.opérande2) ? {
          ...state,
          opérande2: state.saisiIntermédiaire
        }: state),
        opérande1: claculer((!state.opérande2) ? {
          ...state,
          opérande2: state.saisiIntermédiaire
        }: state),
        opérande2: 0,
        saisiIntermédiaire: 0
      };
    case APPUYER_SUR_UNE_TOUCHE_NUMERIQUE:
      return {
        ...state,
        saisiIntermédiaire: ( '' + state.saisiIntermédiaire + action.unChiffre ) * 1
      };
    case REINITIALISER:
      return {
        ...state,
        resultat: 0,
        saisiIntermédiaire: 0,
        opérande1: 0,
        opérande2: 0
      };
    default:
      return state;
  }
}

function ecran(state = { afficher: ChoixAffichage.MONTRER_SAISI_INTERMEDIAIRE }, action) {
   switch(action.type) {
     case AFFICHER:
       return {
         ...state,
         afficher: action.typeAffichage,
       };
     default:
       return state;
   }
};

const reduceurCalculatrice = combineReducers({
  pave,
  ecran
});

export default reduceurCalculatrice;