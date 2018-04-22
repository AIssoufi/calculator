import { combineReducers } from 'redux';
import {
  AFFICHER,
  ADDITIONNER,
  APPUYER_SUR,
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
  afficher: ChoixAffichage.MONTRER_SAISI_INTERMEDIAIRE
};

function operation(state = initialState, action) {
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
    default:
      return state;
  }
}

function ecran(state = initialState, action) {
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

function numerique(state = initialState, action) {
  switch(action.type) {
    case APPUYER_SUR:
      return {
        ...state,
        saisiIntermédiaire: ( '' + state.saisiIntermédiaire + action.unChiffre ) * 1
      };
    default:
      return state;
  }
};

function fonction(state = initialState, action) {
  switch(action.type) {
    case REINITIALISER:
      return {
        ...state,
        resultat: 0,
        saisiIntermédiaire: 0,
        afficher: ChoixAffichage.MONTRER_SAISI_INTERMEDIAIRE
      };
    default:
      return state;
  }
};

const reduceurCalculatrice = combineReducers({
  operation,
  ecran,
  numerique,
  fonction
});

export default reduceurCalculatrice;