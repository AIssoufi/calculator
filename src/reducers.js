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
};

function pave(state = initialState, action) {
  switch(action.type) {
    case ADDITIONNER:
      return {
        ...state,
        resultat: state.resultat + state.saisiIntermédiaire,
        saisiIntermédiaire: 0
      };
    case DIVISER:
      return {
        ...state,
        resultat: state.resultat / state.saisiIntermédiaire,
        saisiIntermédiaire: 0
      };
    case MULTIPLIER:
      return {
        ...state,
        resultat: state.resultat * state.saisiIntermédiaire,
        saisiIntermédiaire: 0
      };
    case SOUSTRAIRE:
      return {
        ...state,
        resultat: state.resultat - state.saisiIntermédiaire,
        saisiIntermédiaire: 0
      };
    case VALIDER: // touche égale
      return {
        ...state,
        afficher: ChoixAffichage.MONTRER_RESULTAT
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
        saisiIntermédiaire: 0
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