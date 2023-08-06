import { connect } from 'react-redux';
import { deleteAll, reverseSign, percentage } from '../../redux/actions/generators';
import FunctionPad from '../renders/KeyPad/FunctionPad';

const mapStateToProps = (state) => {
  return {
    keyPad: state.keyPad,
    display: state.screen.display
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onPressPercentKey: screen => {
      dispatch(percentage(screen));
    },
    onPressReverseSignKey: screen => {
      dispatch(reverseSign(screen));
    },
    onPressDeleteAllKey: () => {
      dispatch(deleteAll());
    }
  }
};

export const FunctionContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(FunctionPad);