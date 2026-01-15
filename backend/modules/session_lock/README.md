# Session Lock Contract

## Keying
- key: work_lock:{work_id}
- value: device_id
- expire: WORK_LOCK_EXPIRE_SECONDS

## Functions
- acquire_lock(work_id, device_id) -> bool
- refresh_lock(work_id, device_id) -> bool
- release_lock(work_id, device_id) -> bool
- get_lock_holder(work_id) -> device_id | None

## Boundaries
- Session/Lock only manages locks and ignores work/user semantics.
