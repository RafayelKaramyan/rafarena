import { useState } from 'react';
import { ArrowUpRight, Bookmark, Pencil, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cameraNames, getMoment } from '../domain/match';
import { encodeView, type SavedView } from '../domain/views';
import FlatPitch from '../ui/FlatPitch';
import ViewForm from '../ui/ViewForm';
import Dialog from '../ui/Dialog';

export default function Saved({
  views,
  loading,
  error,
  save,
  remove,
  notify,
}: {
  views: SavedView[];
  loading: boolean;
  error: string | null;
  save: (view: SavedView) => Promise<void>;
  remove: (id: string) => Promise<void>;
  notify: (message: string) => void;
}) {
  const [edit, setEdit] = useState<SavedView | null>(null),
    [deleting, setDeleting] = useState<SavedView | null>(null),
    [failure, setFailure] = useState(''),
    [busy, setBusy] = useState(false);
  return (
    <section className="library-page saved-page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">YOUR OWN REPLAY COLLECTION</span>
          <h1>
            Worth keeping.
            <br />
            <em>Worth another look.</em>
          </h1>
        </div>
        <p>
          A moment. An angle. An observation.
          <br />
          Your perspectives, saved on this browser.
        </p>
      </div>
      <div className="saved-register">
        <span>
          <Bookmark size={15} /> {views.length.toString().padStart(2, '0')} SAVED PERSPECTIVES
        </span>
        <Link className="text-button" to="/">
          Back to the pitch
          <ArrowUpRight size={16} />
        </Link>
      </div>
      {loading ? (
        <div className="empty-state" role="status">
          Opening your collection…
        </div>
      ) : !views.length ? (
        <div className="empty-state">
          <div className="empty-mark">
            <Bookmark size={28} strokeWidth={1.3} />
          </div>
          <span className="eyebrow">THE NEXT GREAT DETAIL IS YOURS TO FIND</span>
          <h2>
            {error ? 'Your collection is currently unavailable.' : 'See something worth saving?'}
          </h2>
          <p>
            {error
              ? 'You can keep exploring and share perspectives with a link.'
              : 'Choose a moment, find your angle and save your view. Your collection begins with a second look.'}
          </p>
          <Link className="button primary" to="/">
            Find a perspective
            <ArrowUpRight size={17} />
          </Link>
        </div>
      ) : (
        <div className="saved-grid">
          {views.map((saved) => (
            <article className="saved-card" key={saved.id}>
              <Link
                className="saved-image"
                to={encodeView(saved.view)}
                aria-label={`Open ${saved.title}`}
              >
                <FlatPitch view={saved.view} compact />
                <span className="saved-camera">{cameraNames[saved.view.camera]}</span>
                <span className="saved-image-arrow">
                  <ArrowUpRight size={21} />
                </span>
              </Link>
              <div className="saved-body">
                <span className="eyebrow">
                  {getMoment(saved.view.momentId).clock} / {(saved.view.timeMs / 1000).toFixed(1)}S
                  INTO THE SEQUENCE
                </span>
                <h2>{saved.title}</h2>
                <p className={saved.note ? '' : 'empty-note'}>
                  {saved.note || 'An angle worth remembering.'}
                </p>
                <div className="saved-card-tools">
                  <Link className="text-button" to={encodeView(saved.view)}>
                    Open perspective
                    <ArrowUpRight size={15} />
                  </Link>
                  <div>
                    <button
                      className="icon-button"
                      aria-label={`Edit ${saved.title}`}
                      onClick={() => setEdit(saved)}
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      className="icon-button"
                      aria-label={`Remove ${saved.title}`}
                      onClick={() => {
                        setDeleting(saved);
                        setFailure('');
                      }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
      <p className="saved-storage-note">
        Saved views belong to this browser. Clearing browser storage clears this collection. Share a
        perspective link to keep its camera and scene outside this device.
      </p>
      {edit && (
        <ViewForm
          view={edit.view}
          existing={edit}
          save={save}
          onClose={() => setEdit(null)}
          onSaved={() => notify('Your observation has been updated.')}
        />
      )}{' '}
      {deleting && (
        <Dialog
          title="Remove this perspective?"
          onClose={busy ? () => {} : () => setDeleting(null)}
        >
          <p className="dialog-intro">
            “{deleting.title}” and its observation will be removed from this browser.
          </p>
          {failure && (
            <p role="alert" className="form-error">
              {failure}
            </p>
          )}
          <div className="dialog-buttons">
            <button className="button secondary" disabled={busy} onClick={() => setDeleting(null)}>
              Keep perspective
            </button>
            <button
              className="button danger"
              disabled={busy}
              onClick={() => {
                setBusy(true);
                void remove(deleting.id)
                  .then(() => {
                    setDeleting(null);
                    notify('Perspective removed.');
                  })
                  .catch((cause: unknown) =>
                    setFailure(
                      cause instanceof Error
                        ? cause.message
                        : 'The perspective could not be removed.',
                    ),
                  )
                  .finally(() => setBusy(false));
              }}
            >
              {busy ? 'Removing…' : 'Remove perspective'}
              <Trash2 size={15} />
            </button>
          </div>
        </Dialog>
      )}
    </section>
  );
}
