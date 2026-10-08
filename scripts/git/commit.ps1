# Writes a commit message from a file so Cursor does not append Co-authored-by trailers.
# Usage: scripts/git/commit.ps1 -Subject "feat: summary" [-Body "Optional body paragraph"]
param(
  [Parameter(Mandatory = $true)]
  [string]$Subject,
  [string]$Body = '',
  [switch]$Amend
)

$ErrorActionPreference = 'Stop'
$repoRoot = git rev-parse --show-toplevel
$messagePath = Join-Path $repoRoot '.git/COMMIT_MSG_CLEAN'

$message = $Subject
if ($Body -ne '') {
  $message = "$Subject`n`n$Body"
}
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($messagePath, $message, $utf8NoBom)

if ($Amend) {
  git -C $repoRoot commit --amend -F $messagePath
} else {
  git -C $repoRoot commit -F $messagePath
}

Remove-Item $messagePath -ErrorAction SilentlyContinue

$lastMessage = git -C $repoRoot log -1 --format=%B
if ($lastMessage -match '(?m)^Co-authored-by:\s*Cursor\b') {
  Write-Error 'Commit still contains a Cursor co-author trailer. Amend manually before pushing.'
  exit 1
}

Write-Host 'Commit created without Cursor co-author trailer.'
