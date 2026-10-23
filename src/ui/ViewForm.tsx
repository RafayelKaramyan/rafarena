import { useState, type FormEvent } from 'react';
import { ArrowUpRight, Bookmark } from 'lucide-react';
import type { SavedView } from '../domain/views';
import type { ViewState } from '../domain/match';
import { cameraNames, getMoment } from '../domain/match';
import Dialog from './Dialog';
import { createId } from '../domain/id';

export default function ViewForm({
  view,
  existing,
  save,
  onClose,
  onSaved,
}: {
  view: ViewState;
  existing?: SavedView;
  save: (value: SavedView) => Promise<void>;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState(
    existing?.title ?? `${getMoment(view.momentId).title} / ${cameraNames[view.camera]}`,
  );
  const [note, setNote] = useState(existing?.note ?? '');
  const [error, setError] = useState(''),
    [busy, setBusy] = useState(false);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (busy) return;
    if (!title.trim()) {
      setError('Give this perspective a name.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await save({
        id: existing?.id ?? createId(),
        title: title.trim(),
        note,
        createdAt: existing?.createdAt ?? new Date().toISOString(),
        view: structuredClone(view),
      });
      onSaved();
      onClose();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'This view could not be saved. Try again.');
      setBusy(false);
    }
  };
  return (
    <Dialog
      title={existing ? 'A little more context.' : 'Keep this perspective.'}
      onClose={busy ? () => {} : onClose}
    >
      <p className="dialog-intro">The exact moment, camera and layers, ready for another look.</p>
      <form
        onSubmit={(event) => {
          void submit(event);
        }}
      >
        <label className="field">
          Name your view
          <input
            autoFocus
            required
            maxLength={70}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="The run that changed the game"
          />
        </label>
        <label className="field">
          Your observation <span>optional</span>
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            maxLength={600}
            rows={4}
            placeholder="What made this moment worth a second look?"
          />
        </label>
        <div className="save-recap">
          <Bookmark size={17} />
          <div>
            <strong>{getMoment(view.momentId).title}</strong>
            <span>
              {cameraNames[view.camera]} · {(view.timeMs / 1000).toFixed(1)}s into the sequence
            </span>
          </div>
        </div>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <button className="button primary form-submit" disabled={busy}>
          {busy ? 'Saving perspective…' : existing ? 'Save changes' : 'Save perspective'}
          <ArrowUpRight size={17} />
        </button>
        <p className="fine-print">
          Saved on this browser. Shared links include the view, without your private notes.
        </p>
      </form>
    </Dialog>
  );
}
