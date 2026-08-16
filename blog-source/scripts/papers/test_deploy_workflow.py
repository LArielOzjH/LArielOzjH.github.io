import unittest
from pathlib import Path


WORKFLOW = Path(__file__).resolve().parents[3] / ".github" / "workflows" / "deploy.yml"


class DeployWorkflowTests(unittest.TestCase):
    def test_scheduled_and_manual_runs_persist_the_paper_snapshot(self):
        workflow = WORKFLOW.read_text()

        self.assertIn("  contents: write", workflow)
        self.assertIn("  pages: write", workflow)
        self.assertIn("  id-token: write", workflow)
        self.assertIn(
            "if: github.event_name == 'schedule' || github.event_name == 'workflow_dispatch'",
            workflow,
        )
        self.assertIn('git config user.name "github-actions[bot]"', workflow)
        self.assertIn(
            'git config user.email "41898282+github-actions[bot]@users.noreply.github.com"',
            workflow,
        )
        git_add_commands = [
            line.strip() for line in workflow.splitlines() if line.strip().startswith("git add ")
        ]
        self.assertEqual(
            git_add_commands,
            ["git add -- blog-source/data/papers/papers.json"],
        )
        self.assertIn("if git diff --cached --quiet; then", workflow)
        self.assertIn('git commit -m "chore: refresh paper library [skip ci]"', workflow)
        self.assertIn('git push origin "HEAD:${GITHUB_REF_NAME}"', workflow)


if __name__ == "__main__":
    unittest.main()
