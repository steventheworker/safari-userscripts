#!/usr/bin/env python3
from pathlib import Path
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
USERSCRIPTS = ROOT / "Userscripts"
# PUBLIC_REPO = Path.home() / "proj/js/safari-userscripts"

def sh(cmd, cwd=None):
    subprocess.check_call(cmd, cwd=cwd)

def main():
    msg = sys.argv[1]
    # copy artifacts
    for f in USERSCRIPTS.glob("*.user.js"):
        (PUBLIC_REPO / f.name).write_text(f.read_text())
    sh(["git", "add", "-A"], cwd=PUBLIC_REPO)
    sh(["git", "commit", "-m", msg], cwd=PUBLIC_REPO)
    sh(["git", "push", "origin", "main"], cwd=PUBLIC_REPO)
    print("Release pushed")

if __name__ == "__main__":
    main()
