from database import tasks_collection
from datetime import datetime, timezone

async def get_dashboard(user_id: str) -> dict:
    """Aggregate task stats for the current user (assigned to or created by)."""
    cursor = tasks_collection.find({
        "$or": [{"assigned_to": user_id}, {"creator_id": user_id}]
    })

    # Deduplicate in case a task has both creator_id and assigned_to as same user
    seen = set()
    all_tasks = []
    async for t in cursor:
        tid = str(t["_id"])
        if tid not in seen:
            seen.add(tid)
            all_tasks.append(t)

    total = len(all_tasks)
    by_status = {"todo": 0, "in_progress": 0, "done": 0}
    overdue = []
    now = datetime.now(timezone.utc)

    for task in all_tasks:
        status = task.get("status", "todo")
        if status in by_status:
            by_status[status] += 1

        due = task.get("due_date")
        if due and status != "done":
            try:
                if isinstance(due, datetime):
                    # Make timezone-aware if naive
                    due_dt = due.replace(tzinfo=timezone.utc) if due.tzinfo is None else due
                else:
                    due_dt = datetime(due.year, due.month, due.day, tzinfo=timezone.utc)
                if due_dt < now:
                    overdue.append(str(task["_id"]))
            except Exception:
                pass  # skip malformed due_date

    completed = by_status["done"]
    productivity_score = round((completed / total) * 100, 1) if total > 0 else 0.0

    return {
        "total_tasks": total,
        "by_status": by_status,
        "overdue_task_ids": overdue,
        "overdue_count": len(overdue),
        "productivity_score": productivity_score,
    }
