import Numérique from '../composant/pavé/numérique/Numérique';
import { connect } from 'react-redux';
import { appuyerSur, affcher, ChoixAffichage } from './../actions';

const mapDispatchToProps = (dispatch) => {
  return {
    onTouchNumeriqueClick: (chiffre) => {
      dispatch(appuyerSur(chiffre));
      dispatch(affcher(ChoixAffichage.MONTRER_SAISI_INTERMEDIAIRE));
    }
  }
};


const NumériqueContainer = connect(
  null,
  mapDispatchToProps
)(Numérique);

export default NumériqueContainer;