```markdown
# apohara-consilium Development Patterns

> Auto-generated skill from repository analysis

## Overview
This skill teaches the core development patterns and conventions used in the `apohara-consilium` Python codebase. You'll learn about file naming, import/export styles, commit message conventions, and how to write and organize tests. This guide is ideal for contributors aiming to maintain consistency and quality in the project.

## Coding Conventions

### File Naming
- **Style:** `snake_case`
- **Example:**  
  ```python
  # Good
  user_profile.py

  # Bad
  UserProfile.py
  userProfile.py
  ```

### Import Style
- **Style:** Relative imports are preferred.
- **Example:**  
  ```python
  # Good
  from .utils import calculate_score

  # Bad
  from utils import calculate_score
  ```

### Export Style
- **Style:** Named exports using `__all__`
- **Example:**  
  ```python
  __all__ = ["calculate_score", "UserProfile"]
  ```

### Commit Messages
- **Pattern:** Conventional Commits
- **Prefix:** `feat`
- **Average Length:** ~59 characters
- **Example:**  
  ```
  feat: add user authentication to login endpoint
  ```

## Workflows

### Adding a New Feature
**Trigger:** When implementing a new feature or module  
**Command:** `/add-feature`

1. Create a new Python file using `snake_case` naming.
2. Use relative imports for any internal dependencies.
3. Export public functions/classes via `__all__`.
4. Write or update relevant tests in a corresponding `*.test.*` file.
5. Commit changes using the `feat` prefix and a clear, concise message.

### Writing Tests
**Trigger:** When adding or updating functionality  
**Command:** `/write-test`

1. Create or update a test file matching the pattern `*.test.*`.
2. Write test cases covering the new or updated code.
3. Run the test suite to ensure all tests pass.

## Testing Patterns

- **Test File Pattern:** `*.test.*` (e.g., `user_profile.test.py`)
- **Testing Framework:** Not explicitly detected; use standard Python testing practices (e.g., `unittest` or `pytest`).
- **Example Test File:**
  ```python
  # user_profile.test.py

  import unittest
  from .user_profile import UserProfile

  class TestUserProfile(unittest.TestCase):
      def test_username(self):
          user = UserProfile("alice")
          self.assertEqual(user.username, "alice")

  if __name__ == "__main__":
      unittest.main()
  ```

## Commands
| Command        | Purpose                                      |
|----------------|----------------------------------------------|
| /add-feature   | Scaffold and commit a new feature/module     |
| /write-test    | Create or update tests for your code         |
```