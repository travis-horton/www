import React from 'react';

/*
 * The teaching half. Each level opens with one of these and only then offers
 * the drill — a level that jumps straight to questions is a flashcard deck, not
 * a course.
 *
 * Keyed by level id, rendered without props so nothing here needs prop-types.
 */

const CountingTable = () => (
  <table className="lesson__table">
    <thead>
      <tr>
        <th>base six</th>
        <th>name</th>
        <th>(decimal)</th>
      </tr>
    </thead>
    <tbody>
      {[
        ['1–5', 'one … five', '1–5'],
        ['10', 'six', '6'],
        ['11', 'seven', '7'],
        ['15', 'eleven', '11'],
        ['20', 'dozen', '12'],
        ['23', 'dozen-three', '15'],
        ['30', 'thirsy', '18'],
        ['40', 'foursy', '24'],
        ['50', 'fifsy', '30'],
        ['55', 'fifsy-five', '35'],
        ['100', 'nif', '36'],
      ].map(([digits, name, dec]) => (
        <tr key={digits}>
          <td><code>{digits}</code></td>
          <td>{name}</td>
          <td className="lesson__dim">{dec}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

const One = () => (
  <div className="lesson">
    <p>
      Base six has six digits and no more: 0, 1, 2, 3, 4, 5. There is no digit
      for six — exactly the way decimal has no digit for ten.
    </p>
    <p>
      So six is written <code>10</code>. That is the entire idea, and everything
      else follows from it.
    </p>
    <p>
      But nobody says &quot;one zero.&quot; Six gets its own word:
      {' '}
      <strong>six</strong>
      . The next five numbers keep the words you already use — seven, eight,
      nine, ten, eleven — which are irregular in the same forgivable way English
      already makes eleven and twelve irregular.
    </p>
    <p>
      Then comes the good part.
      {' '}
      <strong>A dozen is written 20.</strong>
      {' '}
      A dozen has always felt like a round number, and this is why: in base six
      it genuinely is one. Three more round numbers follow —
      {' '}
      <strong>thirsy</strong>
      ,
      {' '}
      <strong>foursy</strong>
      ,
      {' '}
      <strong>fifsy</strong>
      {' '}
      — and they combine the way you would guess: dozen-one, thirsy-four,
      fifsy-five.
    </p>
    <CountingTable />
    <p className="lesson__dim">
      Fifsy-five is the largest two-digit number there is. After it, everything
      starts over — which is level two.
    </p>
  </div>
);

const Two = () => (
  <div className="lesson">
    <p>
      <code>100</code> in base six is thirty-six, and it has its own name:
      {' '}
      <strong>nif</strong>
      . It is to base six what a hundred is to decimal — the point where you
      stop counting units and start counting groups.
    </p>
    <p>
      And because a nif is exactly two digits wide, big numbers are read
      {' '}
      <strong>in pairs</strong>
      , not digit by digit. Take the top pair, say
      {' '}
      <em>nif</em>
      , then take the bottom pair:
    </p>
    <p className="lesson__example">
      <code>3251</code>
      {' → '}
      <code>32</code>
      {' | '}
      <code>51</code>
      {' → '}
      thirsy-two nif fifsy-one
    </p>
    <p>
      That is the whole trick, and it is why the pair-words from level one had
      to come first. You are never reading four digits; you are reading two
      small numbers with a word between them.
    </p>
    <p>
      A leading pair of exactly one is spoken bare, the way you say &quot;a
      hundred&quot; rather than &quot;one hundred&quot;: <code>100</code> is
      just
      {' '}
      <em>nif</em>
      . And <code>1000</code> is
      {' '}
      <em>six nif</em>
      , because its top pair is
      {' '}
      <code>10</code>
      , which is six.
    </p>
    <p>
      Above four digits the same idea repeats one level up: <code>10000</code>
      {' '}
      is a
      {' '}
      <strong>unexian</strong>
      , and numbers group into four-digit blocks, each block read as its own
      pair-nif-pair.
    </p>
  </div>
);

const Three = () => (
  <div className="lesson">
    <p>
      The arithmetic you already know is unchanged. Every algorithm is the same.
      The only thing that moves is
      {' '}
      <strong>where the wall is</strong>
      : you carry at six instead of at ten.
    </p>
    <p>
      Three plus four is seven, which is written
      {' '}
      <code>11</code>
      . One six, one left over. Nothing mysterious happened — you just crossed
      the wall earlier than you are used to.
    </p>
    <p className="lesson__example">
      <code>5</code>
      {' + '}
      <code>4</code>
      {' + '}
      <code>3</code>
      {' = '}
      <code>20</code>
      {' — a dozen exactly'}
    </p>
    <p>
      That one is worth doing slowly, because twelve is two full sixes and
      nothing left over, so the ones column lands on zero and both sixes carry.
      Carry slips almost always happen on sums like this one.
    </p>
    <p>
      Subtraction borrows the same way, except what you borrow is a six. If the
      ones column would go negative, take one six from the column to its left —
      it arrives worth six, not ten.
    </p>
  </div>
);

const Four = () => (
  <div className="lesson">
    <p>
      Here is the argument for base six that actually convinces people.
    </p>
    <p>
      <strong>The times table is tiny.</strong>
      {' '}
      Decimal makes children memorise up to 9 × 9 = 81. In base six the whole
      table tops out at 5 × 5 =
      {' '}
      <code>41</code>
      {' '}
      — twenty-five facts instead of eighty-one, and most of them are ones you
      would work out anyway.
    </p>
    <p>
      <strong>Thirds are clean.</strong>
      {' '}
      Six is 2 × 3, so it divides evenly by both. One third is
      {' '}
      <code>0.2</code>
      {' '}
      exactly. In decimal, one third is 0.333… forever, because ten is 2 × 5 and
      there is no three in it. Halves, thirds and sixths all come out exact.
    </p>
    <p>
      That is not a party trick — thirds turn up constantly, and a base that
      cannot write them is a base that rounds.
    </p>
    <p className="lesson__dim">
      Division here is always exact; nothing in this level has a remainder.
    </p>
  </div>
);

const Five = () => (
  <div className="lesson">
    <p>
      A
      {' '}
      <strong>complement</strong>
      {' '}
      is what a number needs to reach nif. It looks like subtraction, and it is
      — but doing it as subtraction is the slow way, and the whole point is that
      there is a reflex instead.
    </p>
    <p className="lesson__example">
      nif −
      {' '}
      <code>XY</code>
      {' = ('}
      five − X
      {')('}
      six − Y
      {')'}
    </p>
    <p>
      Subtract the first digit from
      {' '}
      <strong>five</strong>
      , the second from
      {' '}
      <strong>six</strong>
      . So nif − <code>23</code> is
      {' '}
      <code>33</code>
      : five minus two is three, six minus three is three.
    </p>
    <p>
      The reason it works is that
      {' '}
      <code>55</code>
      {' '}
      plus one is
      {' '}
      <code>100</code>
      . You are really taking the number away from fifsy-five, which never
      borrows, and then adding the one back on the end.
    </p>
    <p>
      One edge case: when the last digit is already zero there is nothing to add
      back, so nif −
      {' '}
      <code>X0</code>
      {' '}
      is just
      {' '}
      <code>(six − X)0</code>
      .
    </p>
    <p>
      This level also buries complements inside longer chains, which is where
      the reflex earns its keep — mid-chain you do not have room to stop and do
      a full subtraction.
    </p>
  </div>
);

export const LESSONS = {
  1: One,
  2: Two,
  3: Three,
  4: Four,
  5: Five,
};

export default LESSONS;
