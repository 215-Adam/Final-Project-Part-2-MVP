import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useExercises } from '../contexts/ExerciseContext';
import { fetchExercise, fetchExerciseImages } from '../services/wgerApi';
import AddToWorkoutButton from '../components/AddToWorkoutButton';
import { ErrorMessage, LoadingSpinner } from '../components/StatusMessage';

function ExerciseDetailPage() {
  const { id } = useParams();
  const { getExerciseById } = useExercises();
  const cached = getExerciseById(id);

  const [fetched, setFetched] = useState(null);
  const [images, setImages] = useState([]);
  const [status, setStatus] = useState(cached ? 'success' : 'loading');
  const [error, setError] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [attempt, setAttempt] = useState(0);

  const exercise = cached || (fetched && fetched.id === Number(id) ? fetched : null);

  // Fetch the exercise only if it isn't already cached in ExerciseContext.
  useEffect(() => {
    if (cached) return undefined;
    let ignore = false;
    setStatus('loading');
    setError(null);
    fetchExercise(id)
      .then((data) => {
        if (ignore) return;
        setFetched(data);
        setStatus('success');
      })
      .catch((err) => {
        if (ignore) return;
        setError(err.message.includes('404') ? 'Exercise not found' : err.message);
        setStatus('error');
      });
    return () => {
      ignore = true;
    };
  }, [id, cached, attempt]);

  // Demonstration images come from /exerciseimage/.
  useEffect(() => {
    let ignore = false;
    setActiveImage(0);
    fetchExerciseImages(id)
      .then((data) => {
        if (!ignore) setImages(data.sort((a, b) => Number(b.isMain) - Number(a.isMain)));
      })
      .catch(() => {
        if (!ignore) setImages([]);
      });
    return () => {
      ignore = true;
    };
  }, [id]);

  if (!exercise && status === 'error') {
    return (
      <div>
        <Link to="/exercises" className="back-link">← Back to library</Link>
        <ErrorMessage message={error} onRetry={() => setAttempt((n) => n + 1)} />
      </div>
    );
  }
  if (!exercise) return <LoadingSpinner label="Loading exercise…" />;

  const gallery = images.length ? images : exercise.images;
  const current = gallery[activeImage];

  return (
    <article className="detail">
      <Link to="/exercises" className="back-link">← Back to library</Link>
      <div className="detail__layout">
        <div className="detail__media">
          {current ? (
            <img src={current.url} alt={`${exercise.name} demonstration`} className="detail__image" />
          ) : (
            <div className="detail__placeholder" aria-hidden="true">{exercise.name.charAt(0)}</div>
          )}
          {gallery.length > 1 && (
            <div className="detail__thumbs" role="group" aria-label="Exercise images">
              {gallery.map((img, index) => (
                <button
                  key={img.id}
                  type="button"
                  className={`thumb ${index === activeImage ? 'thumb--active' : ''}`}
                  aria-label={`Show image ${index + 1}`}
                  aria-pressed={index === activeImage}
                  onClick={() => setActiveImage(index)}
                >
                  <img src={img.url} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="detail__info">
          <span className="chip">{exercise.category}</span>
          <h1 className="detail__title">{exercise.name}</h1>
          <dl className="detail__facts">
            <div>
              <dt>Primary muscles</dt>
              <dd>{exercise.muscles.join(', ') || '—'}</dd>
            </div>
            <div>
              <dt>Secondary muscles</dt>
              <dd>{exercise.secondaryMuscles.join(', ') || '—'}</dd>
            </div>
            <div>
              <dt>Equipment</dt>
              <dd>{exercise.equipment.join(', ') || 'None'}</dd>
            </div>
          </dl>
          <h2 className="detail__subtitle">How to do it</h2>
          <p className="detail__description">
            {exercise.description || 'No description is available for this exercise yet.'}
          </p>
          <AddToWorkoutButton exercise={exercise} />
        </div>
      </div>
    </article>
  );
}

export default ExerciseDetailPage;
