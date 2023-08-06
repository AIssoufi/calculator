import OperatorPad from '../renders/KeyPad/OperatorPad';
import { connect } from 'react-redux';
import { add, divide, multiply, substract, validate, show } from '../../redux/actions/generators';
import { DISPLAYS } from '../../redux/actions/types';

const mapDispatchToProps = (dispatch) => {
  return {
    onPressAddKey: () => {
      dispatch(add());
      dispatch(show(DISPLAYS.OPERAND_1));
    },
    onPressDivideKey: () => {
      dispatch(divide());
      dispatch(show(DISPLAYS.OPERAND_1));
    },
    onPressMultiplyKey: () => {
      dispatch(multiply());
      dispatch(show(DISPLAYS.OPERAND_1));
    },
    onPressSubstractKey: () => {
      dispatch(substract());
      dispatch(show(DISPLAYS.OPERAND_1));
    },
    onPressEqualKey: () => {
      dispatch(validate());
      dispatch(show(DISPLAYS.RESULT));
    }
  };
};

export const OperatorPadContainer = connect(
  null,
  mapDispatchToProps
)(OperatorPad);