import { Problem } from '../types/problem';
import { DSASpeedDrill } from '../types/dsaDrill';

export const getDrillTests = (problem: Problem, drill: DSASpeedDrill) => {
  return drill.visibleTestsOnly ? problem.tests.visible : [...problem.tests.visible, ...problem.tests.hidden];
};
