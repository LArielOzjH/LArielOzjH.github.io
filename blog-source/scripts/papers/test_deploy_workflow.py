import unittest
import os
import shutil
import subprocess
import tempfile
from pathlib import Path


WORKFLOW = Path(__file__).resolve().parents[3] / ".github" / "workflows" / "deploy.yml"


class DeployWorkflowTests(unittest.TestCase):
    def test_content_build_can_use_saved_papers_without_a_network_refresh(self):
        script = WORKFLOW.parents[2] / "scripts" / "build-blog.sh"
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / "scripts").mkdir()
            shutil.copy2(script, root / "scripts" / script.name)
            blog = root / "blog-source"
            (blog / "out" / "papers").mkdir(parents=True)
            (blog / "out" / "papers" / "index.html").write_text("saved paper library")
            (blog / "data" / "papers").mkdir(parents=True)
            snapshot = blog / "data" / "papers" / "papers.json"
            snapshot.write_text('{"papers": [{"id": "saved"}]}')
            binaries = root / "bin"
            binaries.mkdir()
            for name, body in {
                "python3": "#!/bin/sh\necho 'network unavailable' >&2\nexit 1\n",
                "npm": "#!/bin/sh\necho \"$*\" >> \"$BUILD_TEST_LOG\"\n",
            }.items():
                executable = binaries / name
                executable.write_text(body)
                executable.chmod(0o755)
            log = root / "build.log"
            env = {**os.environ, "PATH": f"{binaries}:{os.environ['PATH']}", "BUILD_TEST_LOG": str(log)}
            env.pop("BLOG_PAPERS_FIXTURE", None)
            env["BLOG_REFRESH_PAPERS"] = "false"
            result = subprocess.run(["bash", str(root / "scripts" / script.name)], env=env, capture_output=True, text=True)
            self.assertEqual(result.returncode, 0, result.stderr)
            self.assertEqual(log.read_text().splitlines(), ["ci", "run build:blog"])
            self.assertEqual((root / "public" / "blog" / "papers" / "index.html").read_text(), "saved paper library")
            self.assertEqual(snapshot.read_text(), '{"papers": [{"id": "saved"}]}')

            env["BLOG_REFRESH_PAPERS"] = "true"
            refresh = subprocess.run(["bash", str(root / "scripts" / script.name)], env=env, capture_output=True, text=True)
            self.assertNotEqual(refresh.returncode, 0)
            self.assertIn("network unavailable", refresh.stderr)

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
