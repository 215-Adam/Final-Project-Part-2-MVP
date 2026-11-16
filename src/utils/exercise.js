const ENGLISH = 2;

/** Removes HTML tags from wger descriptions and collapses whitespace. */
export function stripHtml(html = '') {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Turns a raw /exerciseinfo/ record into the flat shape the app uses.
 * Returns null when the exercise has no English translation.
 */
export function normalizeExercise(raw) {
  if (!raw) return null;
  const translations = raw.translations || [];
  const english = translations.find((t) => t.language === ENGLISH);
  if (!english || !english.name) return null;

  const images = (raw.images || []).map((img) => ({
    id: img.id,
    url: img.image,
    isMain: img.is_main,
  }));
  const main = images.find((img) => img.isMain) || images[0];

  return {
    id: raw.id,
    name: english.name.trim(),
    description: stripHtml(english.description),
    category: raw.category ? raw.category.name : 'Other',
    categoryId: raw.category ? raw.category.id : null,
    muscles: (raw.muscles || []).map((m) => m.name_en || m.name),
    secondaryMuscles: (raw.muscles_secondary || []).map((m) => m.name_en || m.name),
    muscleIds: [...(raw.muscles || []), ...(raw.muscles_secondary || [])].map((m) => m.id),
    equipment: (raw.equipment || []).map((e) => e.name),
    images,
    imageUrl: main ? main.url : null,
  };
}

/** Filters exercises by search text, category id and muscle id. */
export function filterExercises(exercises, { search = '', categoryId = null, muscleId = null } = {}) {
  const query = search.trim().toLowerCase();
  return exercises.filter((exercise) => {
    if (query && !exercise.name.toLowerCase().includes(query)) return false;
    if (categoryId && exercise.categoryId !== categoryId) return false;
    if (muscleId && !exercise.muscleIds.includes(muscleId)) return false;
    return true;
  });
}
