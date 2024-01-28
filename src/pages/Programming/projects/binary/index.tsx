import React, {ReactElement} from 'react';

import './styles.css';

const SIZE = 100;
const SCALE = 2;

type Vector = {
  x: number,
  y: number,
};
type drawDigitProps = {
  value: boolean,
  digit: number,
  numStart: Vector,
};
const Digit = ({
  value, digit, numStart,
}: drawDigitProps): ReactElement => {
  const digitsPlace = Math.log2(digit);
  return (
    <line
      x1={numStart.x + (3 - digitsPlace) * SCALE}
      y1={numStart.y + (4 - (digit == 8 ? 1 : 0)) * SCALE}
      x2={numStart.x + (3 - digitsPlace) * SCALE}
      y2={numStart.y + (4 - (1 + (3 * +value))) * SCALE}
      stroke="black"
      stroke-width={SCALE * .75}
    />
  );
};

const Hex = ({
  value, startVec,
}) => {
  return (
    <>
      <Digit value={(value % 16) > 7} digit={8} numStart={startVec} />
      <Digit value={(value % 8) > 3} digit={4} numStart={startVec} />
      <Digit value={(value % 4) > 1} digit={2} numStart={startVec} />
      <Digit value={(value % 2) > 0} digit={1} numStart={startVec} />
    </>
  );
};

const BinaryNumber = ({
  startVec, value
}) => {
  if (value < 16) {
    return (
      <>
        <line
          x1={startVec.x + 1}
          y1={startVec.y + (SCALE * 4)}
          x2={startVec.x + (SCALE * 3)}
          y2={startVec.y + (SCALE * 4)}
          stroke="black"
          stroke-width={SCALE * .75}
        />
        <path
          d={
            `
              M ${startVec.x},${startVec.y + (4 * SCALE) - (SCALE)}
              C ${startVec.x}, ${startVec.y + (4 * SCALE)}
              ${startVec.x}, ${startVec.y + (4 * SCALE)}
              ${startVec.x + SCALE}, ${startVec.y + (4 * SCALE)}
            `
          }
          fill="none"
          stroke-width={SCALE * .75}
        />
        <Hex value={value} startVec={startVec} />
      </>
    );
  }
};

export const BinaryNumerals = () => {
  return (
    <div>
      <svg viewBox={`0 0 ${SIZE} ${SIZE * 8}`}>
        {[...Array(16).keys()].map(idx => (
          <>
          <text x="4" y={5 * SCALE + (SCALE * (5 * idx))}>{idx}</text>
          <BinaryNumber startVec={{x: 20, y: 2 + (SCALE * (5 * idx))}} value={idx}/>
          </>
        ))}
      </svg>
    </div>
  );
};
