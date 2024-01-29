import React, {ReactElement, useState} from 'react';

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
  toBaseLine: boolean,
};
const Digit = ({
  value, digit, numStart, toBaseLine
}: drawDigitProps): ReactElement => {
  const digitsPlace = Math.log2(digit);
  return (
    <line
      x1={numStart.x + (3 - digitsPlace) * SCALE}
      y1={numStart.y + (toBaseLine ? 4 : 3) * SCALE}
      x2={numStart.x + (3 - digitsPlace) * SCALE}
      y2={numStart.y + (4 - (1 + (3 * +value))) * SCALE}
      stroke="black"
      strokeWidth={SCALE * .75}
    />
  );
};

const Hex = ({
  value, startVec, showMoreSigBits,
}) => {
  return (
    <>
      {(showMoreSigBits || value > 7) &&
        <Digit
          value={(value % 16) > 7}
          digit={8}
          numStart={startVec}
          toBaseLine={false}
        />
      }
      {(showMoreSigBits || value > 3) &&
        <Digit
          value={(value % 8) > 3}
          digit={4}
          numStart={startVec}
          toBaseLine={showMoreSigBits || value > 7}
        />
      }
      {(showMoreSigBits || value > 1) &&
        <Digit
          value={(value % 4) > 1}
          digit={2}
          numStart={startVec}
          toBaseLine={showMoreSigBits || value > 3}
        />
      }
      <Digit
        value={(value % 2) > 0}
        digit={1}
        numStart={startVec}
        toBaseLine={true}
      />
    </>
  );
};

const BinaryNumber = ({
  startVec, value,
}) => {
  const hexDigits = value ? Math.ceil((1 + Math.floor(Math.log2(value)))/4) : 1;

  return (
    <>
    {[...Array(hexDigits).keys()].map(idx => {
      const thisHexValue = Math.floor(value / Math.pow(16, idx) % 16);
      const digits = thisHexValue ? Math.floor(Math.log2(thisHexValue)) : 0;
      const thisHexStartX = startVec.x + (SCALE * (hexDigits - idx - 1) * 4);
      const hideMoreSigBits = idx === hexDigits - 1;
      const startX = thisHexStartX + (
        hideMoreSigBits ? (SCALE * (3 - digits)) : SCALE
      );
      const endX = thisHexStartX + (SCALE * 3);
      const curveStartX = startX - SCALE + (
        hideMoreSigBits && digits ? SCALE : 0
      );

      return (
        <>
          <line
            x1={startX}
            y1={startVec.y + (SCALE * 4)}
            x2={endX}
            y2={startVec.y + (SCALE * 4)}
            stroke="black"
            strokeWidth={SCALE * .75}
          />
          <path
            d={
              `
                M ${curveStartX},${startVec.y + (4 * SCALE) - (SCALE)}
                C ${curveStartX}, ${startVec.y + (4 * SCALE)}
                ${curveStartX}, ${startVec.y + (4 * SCALE)}
                ${startX}, ${startVec.y + (4 * SCALE)}
              `
            }
            fill="none"
            strokeWidth={SCALE * .75}
          />
          <Hex
            value={thisHexValue}
            startVec={{x: thisHexStartX, y: startVec.y}}
            showMoreSigBits={!hideMoreSigBits}
          />
        </>
      )
    })}
    </>
  );
};

export const BinaryNumerals = () => {
  const [value, setValue] = useState(0);
  return (
    <div>
      <input 
        value={value}
        onChange={e => {
          if (!isNaN(e.target.value)) setValue(e.target.value)
        }}
      />
      <hr />
      <svg viewBox={`0 0 ${SIZE} ${SIZE * 8}`}>
        <text x="2" y={14}>{value}</text>
        <BinaryNumber startVec={{x: 6, y: SCALE * 10}} value={value}/>
        {[...Array(16).keys()].map(idx => (
          <>
            <text x={14} y={40 + 6 * SCALE + (SCALE * (6 * idx))}>{idx}</text>
            <BinaryNumber startVec={{x: 6, y: 42 + (SCALE * (6 * idx))}} value={idx}/>
          </>
        ))}
      </svg>
    </div>
  );
};
