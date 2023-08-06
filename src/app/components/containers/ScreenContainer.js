import { Screen } from '../renders';
import { connect } from 'react-redux';
import { DISPLAYS } from '../../redux/actions/types';

const getResult = (keyPad, screen) => {
  switch(screen.display)  {
    case DISPLAYS.RESULT:
      return keyPad.result;
    case DISPLAYS.INPUT:
      return keyPad.input;
    case DISPLAYS.OPERAND_1:
      return keyPad.operand1;
    case DISPLAYS.OPERAND_2:
      return keyPad.operand2;
    default:
      return keyPad.input;
  }
};

const mapStateToProps = (state) => {
  return {
    result: getResult(state.keyPad, state.screen)
  };
};

export const ScreenContainer = connect(
  mapStateToProps,
  null
)(Screen);

