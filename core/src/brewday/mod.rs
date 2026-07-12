pub mod model;

pub use model::*;

// TODO: follow the `recipes` pattern once this resource is wired up:
// store.rs covering brew_sessions, brew_step_completions, gravity_readings,
// and schedule_events. Step *definitions* stay generated from the recipe
// (mirroring brew-brewday.jsx's `BREW_STEPS(recipe)`) rather than persisted —
// only which step ids are completed needs a row.
