pub mod model;
pub mod store;

pub use model::*;

// Note: schedule_events has no store support yet — nothing consumes it
// until a dashboard/calendar feature needs it. Step *definitions* stay
// generated from the recipe (mirroring brew-brewday.jsx's `BREW_STEPS(recipe)`)
// rather than persisted — only which step ids are completed needs a row.
