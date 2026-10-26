import ast
import json
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


class ArchivedSourceSmoke(unittest.TestCase):
    def test_python_syntax(self):
        modules = list(ROOT.glob("*.py")) + list((ROOT / "func").glob("*.py"))
        self.assertGreaterEqual(len(modules), 6)
        for module in modules:
            with self.subTest(module=module.name):
                ast.parse(module.read_text(encoding="utf-8"), filename=str(module))

    def test_no_broken_install_script(self):
        package = json.loads((ROOT / "package.json").read_text(encoding="utf-8"))
        self.assertNotIn("install", package.get("scripts", {}))


if __name__ == "__main__":
    unittest.main()
