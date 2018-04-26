import {
  ADDITIONNER,
  APPUYER_SUR_UNE_TOUCHE_NUMÉRIQUE,
  DIVISER,
  MULTIPLIER,
  TOUT_ÉFFACER,
  SOUSTRAIRE,
  VALIDER,
  POURCENTAGE,
  INVERSER_LE_SIGNE,
  ChoixAffichage
} from '../actions/types';

const étatInitial = {
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

function pavé(state = étatInitial, action) {
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
    case APPUYER_SUR_UNE_TOUCHE_NUMÉRIQUE:
      const nouveauSaisi = state.saisiIntermédiaire + action.unChiffre;
      return {
        ...state,
        saisiIntermédiaire: action.unChiffre === '.' ? '' + nouveauSaisi : parseFloat(nouveauSaisi) 
      };
    case TOUT_ÉFFACER:
      return {
        ...state,
        resultat: 0,
        saisiIntermédiaire: 0,
        opérande1: 0,
        opérande2: 0
      };
    case POURCENTAGE:
      return {
        ...state,
        resultat: (action.typeAffichage === ChoixAffichage.MONTRER_RESULTAT) ? state.resultat / 100 : state.resultat,
        saisiIntermédiaire: (action.typeAffichage === ChoixAffichage.MONTRER_SAISI_INTERMEDIAIRE)  ? state.saisiIntermédiaire / 100 : state.saisiIntermédiaire,
        opérande1: (action.typeAffichage === ChoixAffichage.MONTRER_OPERANDE_1) ? state.opérande1 / 100 : state.opérande1,
        opérande2: (action.typeAffichage === ChoixAffichage.MONTRER_OPERANDE_2) ? state.opérande2 / 100 : state.opérande2
      };
    case INVERSER_LE_SIGNE:
      return {
        ...state,
        resultat: (action.typeAffichage === ChoixAffichage.MONTRER_RESULTAT) ? state.resultat * -1 : state.resultat,
        saisiIntermédiaire: (action.typeAffichage === ChoixAffichage.MONTRER_SAISI_INTERMEDIAIRE) ?  -1 * state.saisiIntermédiaire : state.saisiIntermédiaire,
        opérande1: (action.typeAffichage === ChoixAffichage.MONTRER_OPERANDE_1) ? state.opérande1 * -1 : state.opérande1,
        opérande2: (action.typeAffichage === ChoixAffichage.MONTRER_OPERANDE_2) ? state.opérande2 * -1 : state.opérande2
      };
    default:
      return state;
  }
}

export default pavé;