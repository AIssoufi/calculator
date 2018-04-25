import Écran from '../composant/écran/Écran';
import { connect } from 'react-redux';
import { ChoixAffichage } from '../actions';

const getResultat = (pave, ecran) => {
  switch(ecran.afficher)  {
    case ChoixAffichage.MONTRER_RESULTAT:
      return pave.resultat;
    case ChoixAffichage.MONTRER_SAISI_INTERMEDIAIRE:
      return pave.saisiIntermédiaire;
    case ChoixAffichage.MONTRER_OPERANDE_1:
      return pave.opérande1;
    case ChoixAffichage.MONTRER_OPERANDE_2:
      return pave.opérande2;
    default:
      return pave.saisiIntermédiaire;
  }
};

const mapStateToProps = (state) => {
  return {
    resultat: getResultat(state.pave, state.ecran)
  };
};

const ÉcranContainer = connect(
  mapStateToProps,
  null
)(Écran);

export default ÉcranContainer;

