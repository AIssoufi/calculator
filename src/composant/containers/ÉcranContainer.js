import Écran from '../renders/écran/Écran';
import { connect } from 'react-redux';
import { ChoixAffichage } from '../../redux/actions/types';

const getRésultat = (pavé, écran) => {
  switch(écran.afficher)  {
    case ChoixAffichage.MONTRER_RESULTAT:
      return pavé.resultat;
    case ChoixAffichage.MONTRER_SAISI_INTERMEDIAIRE:
      return pavé.saisiIntermédiaire;
    case ChoixAffichage.MONTRER_OPERANDE_1:
      return pavé.opérande1;
    case ChoixAffichage.MONTRER_OPERANDE_2:
      return pavé.opérande2;
    default:
      return pavé.saisiIntermédiaire;
  }
};

const mapStateToProps = (état) => {
  return {
    résultat: getRésultat(état.pavé, état.écran)
  };
};

const ÉcranContainer = connect(
  mapStateToProps,
  null
)(Écran);

export default ÉcranContainer;

