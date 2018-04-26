import Opérateur from '../renders/pavé/opérateur/Opérateur';
import { connect } from 'react-redux';
import { addtionner, diviser, multiplier, soustraire, valider, affcher } from '../../redux/actions/générateurs';
import { ChoixAffichage } from '../../redux/actions/types';

const mapDispatchToProps = (dispatch) => {
  return {
    appuyerLaToucheAddition: () => {
      dispatch(addtionner());
      dispatch(affcher(ChoixAffichage.MONTRER_OPERANDE_1));
    },
    appuyerLaToucheDivision: () => {
      dispatch(diviser());
      dispatch(affcher(ChoixAffichage.MONTRER_OPERANDE_1));
    },
    appuyerLaToucheMultiplier: () => {
      dispatch(multiplier());
      dispatch(affcher(ChoixAffichage.MONTRER_OPERANDE_1));
    },
    appuyerLaToucheSoustraire: () => {
      dispatch(soustraire());
      dispatch(affcher(ChoixAffichage.MONTRER_OPERANDE_1));
    },
    appuyerLaToucheÉgale: () => {
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