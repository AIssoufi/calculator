import Opérateur from '../composant/pavé/opérateur/Opérateur';
import { connect } from 'react-redux';
import { addtionner, diviser, multiplier, soustraire, valider, affcher, ChoixAffichage } from '../actions';

const mapDispatchToProps = (dispatch) => {
  return {
    onClcikOpérateurAddition: () => {
      dispatch(addtionner());
      dispatch(affcher(ChoixAffichage.MONTRER_RESULTAT));
    },
    onClcikOpérateurDivision: () => {
      dispatch(diviser());
      dispatch(affcher(ChoixAffichage.MONTRER_RESULTAT));
    },
    onClcikOpérateurMultiplier: () => {
      dispatch(multiplier());
      dispatch(affcher(ChoixAffichage.MONTRER_RESULTAT));
    },
    onClcikOpérateurSoustraire: () => {
      dispatch(soustraire());
      dispatch(affcher(ChoixAffichage.MONTRER_RESULTAT));
    },
    onClcikOpérateurValider: () => {
      dispatch(valider());
      dispatch(affcher(ChoixAffichage.MONTRER_RESULTAT));
    }
  };
};

const OpérateurContainer = connect(
  null,
  mapDispatchToProps
)(Opérateur);

export default OpérateurContainer;