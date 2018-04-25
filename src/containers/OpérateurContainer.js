import Opérateur from '../composant/pavé/opérateur/Opérateur';
import { connect } from 'react-redux';
import { addtionner, diviser, multiplier, soustraire, valider, affcher, ChoixAffichage } from '../actions';

const mapDispatchToProps = (dispatch) => {
  return {
    onClcikOpérateurAddition: () => {
      dispatch(addtionner());
      dispatch(affcher(ChoixAffichage.MONTRER_OPERANDE_1));
    },
    onClcikOpérateurDivision: () => {
      dispatch(diviser());
      dispatch(affcher(ChoixAffichage.MONTRER_OPERANDE_1));
    },
    onClcikOpérateurMultiplier: () => {
      dispatch(multiplier());
      dispatch(affcher(ChoixAffichage.MONTRER_OPERANDE_1));
    },
    onClcikOpérateurSoustraire: () => {
      dispatch(soustraire());
      dispatch(affcher(ChoixAffichage.MONTRER_OPERANDE_1));
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