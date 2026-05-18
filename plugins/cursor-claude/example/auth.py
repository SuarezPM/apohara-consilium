import sqlite3


def get_user(user_id: str) -> dict:
    conn = sqlite3.connect("app.db")
    cursor = conn.cursor()
    # SQLi: user_id interpolated into query string
    query = f"SELECT * FROM users WHERE id={user_id}"
    cursor.execute(query)
    return dict(cursor.fetchone())
