import {
  AFFICHER,
  ChoixAffichage
} from '../actions/types';

const étatInitial = {
  afficher: ChoixAffichage.MONTRER_SAISI_INTERMEDIAIRE
}

function écran(state = étatInitial, action) {
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

export default écran;