import { normalizeExercise } from '../utils/exercise';

export const BASE_URL = 'https://wger.de/api/v2';
export const ENGLISH = 2;

async function getJson(path) {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) {
    throw new Error(`wger API request failed (${response.status})`);
  }
  return response.json();
}

/** GET /exerciseinfo/ — full exercise list for the library page. */
export async function fetchExercises({ limit = 200, offset = 0 } = {}) {
  const data = await getJson(
    `/exerciseinfo/?language=${ENGLISH}&limit=${limit}&offset=${offset}`
  );
  return {
    count: data.count,
    next: data.next,
    exercises: data.results.map(normalizeExercise).filter(Boolean),
  };
}

/** GET /exerciseinfo/{id}/ — details for one exercise. */
export async function fetchExercise(id) {
  const data = await getJson(`/exerciseinfo/${id}/`);
  const exercise = normalizeExercise(data);
  if (!exercise) throw new Error('Exercise has no English translation');
  return exercise;
}

/** GET /exercisecategory/ — categories used as filter buttons. */
export async function fetchCategories() {
  const data = await getJson('/exercisecategory/');
  return data.results;
}

/** GET /muscle/ — muscle groups used as filter options. */
export async function fetchMuscles() {
  const data = await getJson('/muscle/?limit=50');
  return data.results.map((m) => ({ id: m.id, name: m.name_en || m.name }));
}

/** GET /exerciseimage/?exercise={id} — demonstration images for one exercise. */
export async function fetchExerciseImages(exerciseId) {
  const data = await getJson(`/exerciseimage/?exercise=${exerciseId}`);
  return data.results.map((img) => ({
    id: img.id,
    url: img.image,
    isMain: img.is_main,
  }));
}
