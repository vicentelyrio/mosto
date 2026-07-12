use std::collections::HashMap;
use std::net::IpAddr;
use std::sync::Mutex;
use std::time::{Duration, Instant};

const PRUNE_THRESHOLD: usize = 4096;

/// Fixed-window per-IP limiter. In-memory only: this server faces clients
/// directly, so the peer address is the real client.
pub struct RateLimiter {
    max_attempts: u32,
    window: Duration,
    attempts: Mutex<HashMap<IpAddr, WindowCount>>,
}

struct WindowCount {
    count: u32,
    window_start: Instant,
}

impl RateLimiter {
    pub fn new(max_attempts: u32, window: Duration) -> Self {
        RateLimiter {
            max_attempts,
            window,
            attempts: Mutex::new(HashMap::new()),
        }
    }

    pub fn check(&self, ip: IpAddr) -> bool {
        let mut attempts = self.attempts.lock().unwrap();
        let now = Instant::now();
        if attempts.len() > PRUNE_THRESHOLD {
            attempts.retain(|_, w| now.duration_since(w.window_start) < self.window);
        }
        match attempts.get(&ip) {
            Some(w) if now.duration_since(w.window_start) < self.window => {
                w.count < self.max_attempts
            }
            _ => true,
        }
    }

    pub fn record(&self, ip: IpAddr) {
        let mut attempts = self.attempts.lock().unwrap();
        let now = Instant::now();
        let entry = attempts
            .entry(ip)
            .or_insert(WindowCount { count: 0, window_start: now });
        if now.duration_since(entry.window_start) >= self.window {
            entry.count = 0;
            entry.window_start = now;
        }
        entry.count += 1;
    }

    pub fn clear(&self, ip: IpAddr) {
        self.attempts.lock().unwrap().remove(&ip);
    }
}
