import { connect } from 'react-redux';

import NumberPad from '../renders/KeyPad/NumberPad';
import { pressOn, show } from '../../redux/actions/generators';
import { DISPLAYS } from '../../redux/actions/types';

const mapDispatchToProps = (dispatch) => {
  return {
    onPressNumberKey: (number) => {
      dispatch(pressOn(number));
      dispatch(show(DISPLAYS.INPUT));
    }
  }
};

export const NumberPadContainer = connect(
  null,
  mapDispatchToProps
)(NumberPad);