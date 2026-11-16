import { describe, expect, it } from 'vitest';
import { filterExercises, normalizeExercise, stripHtml } from './exercise';
import { sampleExercises } from '../test/utils';

const rawExercise = {
  id: 9,
  category: { id: 10, name: 'Abs' },
  muscles: [{ id: 11, name: 'Biceps femoris', name_en: 'Hamstrings' }],
  muscles_secondary: [{ id: 8, name: 'Gluteus maximus', name_en: 'Glutes' }],
  equipment: [{ id: 10, name: 'Kettlebell' }],
  images: [
    { id: 1, image: 'https://img/side.png', is_main: false },
    { id: 2, image: 'https://img/main.png', is_main: true },
  ],
  translations: [
    { language: 1, name: 'Kettlebell-Schwung', description: '<p>Deutsch</p>' },
    { language: 2, name: ' Kettlebell Swing ', description: '<ol><li>Hinge</li><li>Swing</li></ol>' },
  ],
};

describe('stripHtml', () => {
  it('removes tags and collapses whitespace', () => {
    expect(stripHtml('<p>Hello&nbsp;<b>world</b></p>\n')).toBe('Hello world');
  });
});

describe('normalizeExercise', () => {
  it('maps a wger exerciseinfo record to the app shape using the English translation', () => {
    const exercise = normalizeExercise(rawExercise);
    expect(exercise).toMatchObject({
      id: 9,
      name: 'Kettlebell Swing',
      description: 'Hinge Swing',
      category: 'Abs',
      categoryId: 10,
      muscles: ['Hamstrings'],
      secondaryMuscles: ['Glutes'],
      muscleIds: [11, 8],
      equipment: ['Kettlebell'],
      imageUrl: 'https://img/main.png',
    });
  });

  it('returns null when there is no English translation', () => {
    expect(normalizeExercise({ ...rawExercise, translations: [rawExercise.translations[0]] })).toBeNull();
  });
});

describe('filterExercises', () => {
  it('filters by search text (case-insensitive)', () => {
    expect(filterExercises(sampleExercises, { search: 'sQu' }).map((e) => e.name)).toEqual(['Squat']);
  });

  it('filters by category and muscle together', () => {
    expect(filterExercises(sampleExercises, { categoryId: 11 }).map((e) => e.id)).toEqual([1]);
    expect(filterExercises(sampleExercises, { muscleId: 1 }).map((e) => e.id)).toEqual([3]);
    expect(filterExercises(sampleExercises, { categoryId: 9, muscleId: 1 })).toEqual([]);
  });

  it('does not mutate the input array', () => {
    const copy = [...sampleExercises];
    filterExercises(sampleExercises, { search: 'bench' });
    expect(sampleExercises).toEqual(copy);
  });
});
