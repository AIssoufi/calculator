import { connect } from 'react-redux';
import { toutÉffacer, inverserSigne, pourcentage } from '../../redux/actions/générateurs';
import Fonction from '../renders/pavé/fonction/Fonction';

const mapStateToProps = (état) => {
  return {
    état
  };
};

const mapDispatchToProps = dispatch => {
  return {
    appuyerLaTouchePourcentage: écran => {
      dispatch(pourcentage(écran));
    },
    appuyerLaToucheInverserSigne: écran => {
      dispatch(inverserSigne(écran));
    },
    appuyerLaToucheÉffacer: () => {
      dispatch(toutÉffacer());
    }
  }
};

const FonctionContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Fonction);

export default FonctionContainer;