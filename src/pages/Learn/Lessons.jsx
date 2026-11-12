import React from 'react';

import { seximalName, toDigits } from './seximal';

/*
 * The teaching half. Each level opens with one of these and only then offers
 * the drill — a level that jumps straight to questions is a flashcard deck, not
 * a course.
 *
 * Keyed by level id, rendered without props so nothing here needs prop-types.
 */

// The whole two-digit count, one row per sixes digit. Built from the engine,
// so the table can never disagree with what the drill accepts.
const CountTable = () => (
  <table className="lesson__table lesson__count">
    <thead>
      <tr>
        <th>base six</th>
        <th>names</th>
        <th>(decimal)</th>
      </tr>
    </thead>
    <tbody>
      {[0, 1, 2, 3, 4, 5].map((sixes) => {
        const from = Math.max(sixes * 6, 1);
        const to = sixes * 6 + 5;
        const names = [];
        for (let n = from; n <= to; n += 1) names.push(seximalName(n));
        return (
          <tr key={sixes}>
            <td>
              <code>{`${toDigits(from)}–${toDigits(to)}`}</code>
            </td>
            <td>
              {names.map((name, i) => (
                <React.Fragment key={name}>
                  {i > 0 && ', '}
                  <span className="lesson__name">{name}</span>
                </React.Fragment>
              ))}
            </td>
            <td className="lesson__dim">{`${from}–${to}`}</td>
          </tr>
        );
      })}
    </tbody>
  </table>
);

// A numeral with its little base-six marker.
const S = ({ children }) => (
  <>
    <code>{children}</code>
    <sub>6</sub>
  </>
);

const SEXIMAL_NET = 'https://www.seximal.net/words';

/*
 * Level 1, rewritten 26.1111 from the 26.1102 draft and Travis's rulings
 * M-546..550: first person, a personal (non-standard) set credited to
 * seximal.net, the count through 55s6, the drill in staged rounds.
 * Draft copy for Travis's markup.
 */
const One = () => (
  <div className="lesson">
    <h2>Whose words these are</h2>
    <p>
      Base six is ordinary math. Saying its numbers out loud is not: nobody has
      agreed how to do it. The names on this page are{' '}
      <strong>my personal set, and they are not standard</strong>. A math
      textbook won&apos;t use them, and most people have never heard them.
    </p>
    <p>
      Almost all of them come from jan Misali&apos;s{' '}
      <a href={SEXIMAL_NET}>seximal.net</a>: <em>thirsy</em>, <em>foursy</em>,{' '}
      <em>fifsy</em> and <em>nif</em> are the site&apos;s words, not mine. Where
      I differ: I say <em>dozen</em> for <S>20</S>, where the site says twelve,
      and I hyphenate (dozen-one, not dozen one). There&apos;s more on that at
      the bottom of the page.
    </p>

    <h2>What base six is</h2>
    <p>
      You already know how a number system works, because you use one every day.
      Ordinary counting, decimal, has ten digits, 0 through 9. When it runs out
      of digits it writes <code>10</code>, which means &quot;one group of ten,
      and nothing left over.&quot;
    </p>
    <p>
      Base six does the same thing, sooner. It has six digits: 0, 1, 2, 3, 4 and
      5. There is no digit for six, the same way decimal has no digit for ten.
      So six is written <code>10</code>: one group of six, and nothing left
      over.
    </p>
    <p>
      That&apos;s the whole idea. On this page a small 6 after a number means
      it&apos;s written in base six, so <S>10</S> is six and a plain 10 is ten.
    </p>

    <h2>Why bother</h2>
    <p>
      I&apos;m not expecting anyone to switch, and you don&apos;t need a reason
      beyond curiosity. But three things won me over:
    </p>
    <ul>
      <li>
        Fractions come out clean. A half is <S>0.3</S> and a third is <S>0.2</S>
        , both exact. In decimal a third is 0.333… forever.
      </li>
      <li>
        The times table is tiny. It stops at 5 × 5, which is <S>41</S> (decimal
        25).
      </li>
      <li>Two hands count much further. More on that below.</li>
    </ul>
    <p>
      And trying it shows you which parts of arithmetic are about numbers, and
      which are only habit.
    </p>

    <h2>One to eleven</h2>
    <p>
      The first five numbers are the same as always: 1, 2, 3, 4, 5. Same digits,
      same words. Then six is written <S>10</S>, and the next five keep the
      words you already use:
    </p>
    <p className="lesson__example">
      <S>10</S> six · <S>11</S> seven · <S>12</S> eight · <S>13</S> nine ·{' '}
      <S>14</S> ten · <S>15</S> eleven
    </p>
    <p>
      Read the two digits as a count: the first says how many sixes, the second
      how many are left over. (A group of six is a <em>six</em>; more than one
      are <em>sixes</em>.)
    </p>
    <p>
      Here&apos;s the part that takes getting used to.{' '}
      <strong>
        The words still mean the amounts they always meant. Only the writing
        moved.
      </strong>{' '}
      Ten is still ten fingers. It&apos;s written <S>14</S> because ten is one
      six and four left over.
    </p>
    <p>
      The trap: <S>12</S> looks like twelve, and it isn&apos;t. It&apos;s one
      six and two left over, so it&apos;s eight. Never read the digits as if
      they were decimal.
    </p>

    <h2>Dozen</h2>
    <p>
      After <S>15</S> the ones digit has run out, so the sixes digit goes up:{' '}
      <S>20</S>, two sixes and nothing left over. That amount already has a good
      English word, <strong>dozen</strong>, and from there the count goes the
      way you&apos;d guess: dozen-one, dozen-two, up to dozen-five (<S>25</S>,
      decimal 17).
    </p>

    <h2>Thirsy, foursy, fifsy</h2>
    <p>
      Three, four and five sixes get new words, built the way thirty and forty
      are, with -sy in place of -ty: <S>30</S> is <strong>thirsy</strong>,{' '}
      <S>40</S> is <strong>foursy</strong>, <S>50</S> is <strong>fifsy</strong>.
      They combine just like dozen does. Here&apos;s the whole count, one row
      per sixes digit:
    </p>
    <CountTable />
    <p>
      Say the rows out loud once, top to bottom. Every row after the second has
      the same shape.
    </p>

    <h2>Count on your hands</h2>
    <p>
      Use your right hand for the ones, from a fist (0) to all five fingers (5).
      Use your left hand for the sixes. When the right hand is full and needs
      one more, close it and raise one finger on the left.
    </p>
    <p>
      Left hand 2, right hand 3 is <S>23</S>, dozen-three. Both hands open is{' '}
      <S>55</S>, fifsy-five: thirty-five on two hands, where decimal fingers
      stop at ten.
    </p>
    <p>
      To turn a pile of things into a number, take out as many sixes as you can,
      then count what&apos;s left. Sixteen things is two sixes and four left
      over: <S>24</S>, dozen-four.
    </p>

    <h2>Where this level stops</h2>
    <p>
      <S>55</S>, fifsy-five, is the biggest number with two digits. One more and
      a third place opens: <S>100</S> is <strong>nif</strong> (decimal 36), six
      sixes. Level two starts there, so it isn&apos;t in this drill.
    </p>

    <h2>What you&apos;ll meet elsewhere</h2>
    <ul>
      <li>
        The system has other names: mathematicians call it senary, and some
        people say heximal. Seximal is jan Misali&apos;s word.
      </li>
      <li>
        <a href={SEXIMAL_NET}>seximal.net</a> is where thirsy, foursy, fifsy and
        nif come from, and it&apos;s the place to read more. Nif is borrowed
        from Ndom, a language of New Guinea that counts in sixes.
      </li>
      <li>
        That site says twelve for <S>20</S> and starts dozen at <S>21</S>,
        written dozen one with no hyphen. I say dozen for <S>20</S> too.
      </li>
      <li>
        Outside this course, don&apos;t expect anyone to know what you mean by
        foursy-three.
      </li>
    </ul>

    <h2>The drill</h2>
    <p>
      Type your answer before you see the truth. Recognizing a right answer is a
      different skill from producing one. &quot;Show me&quot; counts as a miss.
      Capitals, hyphens and extra spaces don&apos;t matter.
    </p>
    <p>
      It runs in three rounds of a dozen questions: first say the names up to
      dozen-five, then write them, then both directions from thirsy to
      fifsy-five. Three rounds is a nif of questions.
    </p>
  </div>
);

const Two = () => (
  <div className="lesson">
    <p>
      <code>100</code> in base six is thirty-six, and it has its own name:{' '}
      <strong>nif</strong>. It is to base six what a hundred is to decimal — the
      point where you stop counting units and start counting groups.
    </p>
    <p>
      And because a nif is exactly two digits wide, big numbers are read{' '}
      <strong>in pairs</strong>, not digit by digit. Take the top pair, say{' '}
      <em>nif</em>, then take the bottom pair:
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
      just <em>nif</em>. And <code>1000</code> is <em>six nif</em>, because its
      top pair is <code>10</code>, which is six.
    </p>
    <p>
      Above four digits the same idea repeats one level up: <code>10000</code>{' '}
      is an <strong>unexian</strong>, and numbers group into four-digit blocks,
      each block read as its own pair-nif-pair. So <code>13132</code> is one
      unexian, thirsy-one nif thirsy-two: the top digit is its own block, then
      the usual pair-nif-pair.
    </p>
  </div>
);

const Three = () => (
  <div className="lesson">
    <p>
      The arithmetic you already know is unchanged. Every algorithm is the same.
      The only thing that moves is <strong>where the wall is</strong>: you carry
      at six instead of at ten.
    </p>
    <p>
      Three plus four is seven, which is written <code>11</code>. One six, one
      left over. Nothing mysterious happened — you just crossed the wall earlier
      than you are used to.
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
    <p>Here is the argument for base six that actually convinces people.</p>
    <p>
      <strong>The times table is tiny.</strong> Decimal makes children memorise
      up to 9 × 9 = 81. In base six the whole table tops out at 5 × 5 ={' '}
      <code>41</code> — twenty-five facts instead of eighty-one, and most of
      them are ones you would work out anyway.
    </p>
    <p>
      <strong>Thirds are clean.</strong> Six is 2 × 3, so it divides evenly by
      both. One third is <code>0.2</code> exactly. In decimal, one third is
      0.333… forever, because ten is 2 × 5 and there is no three in it. Halves,
      thirds and sixths all come out exact.
    </p>
    <p>
      That is not a party trick — thirds turn up constantly, and a base that
      cannot write them is a base that rounds.
    </p>
    <p>
      A two-digit multiplication is the same long multiplication you already do
      — just carry at six. <code>23</code> × <code>4</code>: four threes is a
      dozen, write <code>0</code> carry <code>2</code>; four twos is eight, plus
      the carried two is ten, which is <code>14</code>. Answer <code>140</code>.
      Division is long division with the same wall.
    </p>
    <p className="lesson__dim">
      Division here is always exact; nothing in this level has a remainder.
    </p>
  </div>
);

const Five = () => (
  <div className="lesson">
    <p>
      A <strong>complement</strong> is what a number needs to reach nif. It
      looks like subtraction, and it is — but doing it as subtraction is the
      slow way, and the whole point is that there is a reflex instead.
    </p>
    <p className="lesson__example">
      nif − <code>XY</code>
      {' = ('}
      five − X{')('}
      six − Y{')'}
    </p>
    <p>
      Subtract the first digit from <strong>five</strong>, the second from{' '}
      <strong>six</strong>. So nif − <code>23</code> is <code>33</code>: five
      minus two is three, six minus three is three.
    </p>
    <p>
      The reason it works is that <code>55</code> plus one is <code>100</code>.
      You are really taking the number away from fifsy-five, which never
      borrows, and then adding the one back on the end.
    </p>
    <p>
      One edge case: when the last digit is already zero there is nothing to add
      back, so nif − <code>X0</code> is just <code>(six − X)0</code>.
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
