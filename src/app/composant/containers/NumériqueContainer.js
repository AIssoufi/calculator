import { connect } from 'react-redux';

import Numérique from '../renders/pavé/numérique/Numérique';
import { appuyerSur, affcher } from '../../redux/actions/générateurs';
import { ChoixAffichage } from '../../redux/actions/types';

const mapDispatchToProps = (dispatch) => {
  return {
    appuyerLaToucheNumérique: (chiffre) => {
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