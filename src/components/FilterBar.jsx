/** Search box + category buttons + muscle select for the Exercise Library. */
function FilterBar({
  search,
  onSearchChange,
  categories,
  categoryId,
  onCategoryChange,
  muscles,
  muscleId,
  onMuscleChange,
}) {
  return (
    <div className="filters">
      <input
        type="search"
        className="field__input filters__search"
        placeholder="Search exercises…"
        aria-label="Search exercises"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      <div className="filters__chips" role="group" aria-label="Filter by category">
        <button
          type="button"
          className={`chip-btn ${categoryId === null ? 'chip-btn--active' : ''}`}
          aria-pressed={categoryId === null}
          onClick={() => onCategoryChange(null)}
        >
          All
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            className={`chip-btn ${categoryId === c.id ? 'chip-btn--active' : ''}`}
            aria-pressed={categoryId === c.id}
            onClick={() => onCategoryChange(c.id)}
          >
            {c.name}
          </button>
        ))}
      </div>
      <select
        className="field__input filters__muscle"
        aria-label="Filter by muscle"
        value={muscleId ?? ''}
        onChange={(e) => onMuscleChange(e.target.value ? Number(e.target.value) : null)}
      >
        <option value="">All muscles</option>
        {muscles.map((m) => (
          <option key={m.id} value={m.id}>
            {m.name}
          </option>
        ))}
      </select>
    </div>
  );
}

export default FilterBar;
