import React, { useMemo, useState } from 'react';

import { exportCode, importCode, previewImport } from './transfer';

/*
 * ============================================================================
 * A BRIDGE. IT IS MEANT TO BE DELETED. See the header of transfer.js.
 * ============================================================================
 *
 * WHAT DELETES IT: the www Zig backend, Phases 2/3/4. When progress has a
 * server-side home, delete this file, transfer.js, their tests, and the
 * <ProgressTransfer /> mount in LearnHome.jsx.
 *
 * Two things this UI owes the person using it, both required because the whole
 * point is moving a record they cannot afford to lose:
 *
 *   1. Say what the button will do BEFORE it is pressed, in counts, not in
 *      adjectives. previewImport() runs the real merge against the real local
 *      record and reports the numbers; the button then repeats them in its own
 *      label. There is no way to press it without having been told.
 *   2. Never fail silently. A bad paste produces a visible, specific message
 *      and writes nothing at all.
 *
 * It lives on /learn rather than on either course page because one record
 * covers both courses — the store is a single session list keyed by course.
 *
 * The panel is a button and a region rather than <details>/<summary> because
 * the export code is read from storage when it opens, and an explicit open
 * state keeps that read (and its refresh after an import) obvious.
 */

const COPY_IDLE = 'Copy';
const COPY_DONE = 'Copied';
const COPY_FAIL = 'Copy failed — select the text and copy it by hand';

function ProgressTransfer() {
  const [open, setOpen] = useState(false);
  // Bumped after an import so the export code below is regenerated rather than
  // sitting there describing the record as it was a moment ago.
  const [revision, setRevision] = useState(0);
  const [copyLabel, setCopyLabel] = useState(COPY_IDLE);
  const [paste, setPaste] = useState('');
  const [result, setResult] = useState(null);

  const code = useMemo(() => (open ? exportCode() : ''), [open, revision]);
  const preview = useMemo(
    () => (paste.trim() === '' ? null : previewImport(paste)),
    [paste, revision],
  );

  const copy = () => {
    try {
      navigator.clipboard.writeText(code).then(
        () => setCopyLabel(COPY_DONE),
        () => setCopyLabel(COPY_FAIL),
      );
    } catch (e) {
      setCopyLabel(COPY_FAIL);
    }
  };

  const runImport = () => {
    const outcome = importCode(paste);
    setResult(outcome);
    if (outcome.ok) {
      setPaste('');
      setRevision((n) => n + 1);
    }
  };

  return (
    <div className="transfer">
      <button
        type="button"
        className="drill__link-button transfer__toggle"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        {open ? 'Hide device transfer' : 'Move progress between devices'}
      </button>

      {open && (
        <div>
          <p className="learn__meta">
            {`Scores live in this browser only, so the iPad and the laptop each keep their own. Until they share one, copy the code below and paste it into the other device.`}
          </p>

          <section className="transfer__half">
            <h3 className="transfer__heading">Copy from this device</h3>
            <label className="drill__label" htmlFor="transfer-out">
              {`this device's record — select all, or use the button`}
            </label>
            <textarea
              id="transfer-out"
              className="transfer__box"
              readOnly
              value={code}
              rows={4}
              onFocus={(e) => e.target.select()}
            />
            <div className="drill__actions">
              <button type="button" className="drill__button" onClick={copy}>
                {copyLabel}
              </button>
            </div>
          </section>

          <section className="transfer__half">
            <h3 className="transfer__heading">Paste into this device</h3>
            <label className="drill__label" htmlFor="transfer-in">
              {'a code copied from the other device'}
            </label>
            <textarea
              id="transfer-in"
              className="transfer__box"
              value={paste}
              rows={4}
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck="false"
              placeholder="paste here"
              onChange={(e) => {
                setPaste(e.target.value);
                setResult(null);
              }}
            />

            {/*
              Always-mounted live region: the preview and the outcome both
              appear and change in place while typing/pasting, and a region
              that only mounts once there is something to say announces
              nothing the first time.
            */}
            <div aria-live="polite">
              {preview && !preview.ok && (
                <p className="drill__verdict is-wrong">{preview.error}</p>
              )}

              {preview && preview.ok && (
                <p className="drill__verdict is-right">
                  {`${preview.incoming} sessions in this code. `
                    + `${preview.added} are new here, ${preview.alreadyHad} this device already has. `
                    + 'Nothing is removed — importing only adds.'
                    + (preview.skipped > 0
                      ? ` ${preview.skipped} unreadable sessions will be skipped.`
                      : '')
                    + (preview.dropped > 0
                      ? ` ${preview.dropped} of the oldest will fall off the 200-session limit.`
                      : '')}
                </p>
              )}

              {result && result.ok && (
                <p className="drill__verdict is-right">
                  {`Done — ${result.added} added, ${result.total} sessions on this device now.`}
                </p>
              )}
            </div>

            <div className="drill__actions">
              <button
                type="button"
                className="drill__button"
                disabled={!preview || !preview.ok || preview.added === 0}
                onClick={runImport}
              >
                {preview && preview.ok
                  ? `Add ${preview.added} sessions to this device`
                  : 'Add to this device'}
              </button>
            </div>
          </section>

          <p className="learn__meta">
            {'Temporary. When /learn gets a backend, every device will read the same record and this panel goes away.'}
          </p>
        </div>
      )}
    </div>
  );
}

export default ProgressTransfer;
