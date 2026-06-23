# Luncha Libre — art batch generator
#
# Reads scripts/art-prompts.json and generates a PNG per card into
# public/cards/<type>/<id>[-variant].png. Picks a provider based on which
# env var is set:
#   REPLICATE_API_TOKEN  → Replicate (Flux Schnell, fast & cheap)
#   OPENAI_API_KEY       → OpenAI Images (DALL-E 3 1024x1024)
#   (otherwise)          → assumes Automatic1111 SD WebUI on http://127.0.0.1:7860
#
# Usage:
#   pwsh scripts/generate-art.ps1                  # all cards (skips existing)
#   pwsh scripts/generate-art.ps1 -Tier base       # base files only (~44)
#   pwsh scripts/generate-art.ps1 -Tier qualities  # +recipe quality variants (24)
#   pwsh scripts/generate-art.ps1 -Tier stages     # +ingredient stage variants (110)
#   pwsh scripts/generate-art.ps1 -Sample 1        # one image then stop (sanity check)
#   pwsh scripts/generate-art.ps1 -Force           # re-generate even if file exists

param(
  [ValidateSet('base', 'qualities', 'stages', 'all')]
  [string]$Tier = 'all',
  [int]$Sample = 0,
  [switch]$Force
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$manifestPath = Join-Path $PSScriptRoot 'art-prompts.json'
$manifest = Get-Content $manifestPath -Raw | ConvertFrom-Json

$style    = $manifest.style
$negative = $manifest.negative

# Choose provider
if ($env:REPLICATE_API_TOKEN) {
  $provider = 'replicate'
  Write-Host "Provider: Replicate (Flux Schnell)" -ForegroundColor Green
} elseif ($env:OPENAI_API_KEY) {
  $provider = 'openai'
  Write-Host "Provider: OpenAI DALL-E 3" -ForegroundColor Green
} else {
  $provider = 'sd-local'
  Write-Host "Provider: Local Automatic1111 (http://127.0.0.1:7860)" -ForegroundColor Yellow
  Write-Host "  Make sure webui.bat is running with --api flag" -ForegroundColor Yellow
}

# Build the work list: [@{ subject; outPath }]
$jobs = @()

# Ingredient base files
foreach ($prop in $manifest.ingredients.PSObject.Properties) {
  $id = $prop.Name; $subject = $prop.Value
  $out = Join-Path $root "public\cards\ingredients\$id.png"
  $jobs += @{ subject = $subject; out = $out; type = 'ingredient-base'; id = $id }
}

# Action cards (all base)
foreach ($prop in $manifest.actions.PSObject.Properties) {
  $id = $prop.Name; $subject = $prop.Value
  $out = Join-Path $root "public\cards\actions\$id.png"
  $jobs += @{ subject = $subject; out = $out; type = 'action'; id = $id }
}

# Recipe base files + quality variants
foreach ($prop in $manifest.recipes.PSObject.Properties) {
  $id = $prop.Name; $subject = $prop.Value
  $out = Join-Path $root "public\cards\recipes\$id.png"
  $jobs += @{ subject = $subject; out = $out; type = 'recipe-base'; id = $id }
}

if ($Tier -eq 'qualities' -or $Tier -eq 'all') {
  foreach ($prop in $manifest.recipes.PSObject.Properties) {
    if ($prop.Name -eq 'wild-dish') { continue }
    foreach ($qProp in $manifest.recipe_qualities.PSObject.Properties) {
      $q = $qProp.Name; $qModifier = $qProp.Value
      $subject = $prop.Value + ", " + $qModifier
      $out = Join-Path $root "public\cards\recipes\$($prop.Name)-$q.png"
      $jobs += @{ subject = $subject; out = $out; type = 'recipe-quality'; id = "$($prop.Name)-$q" }
    }
  }
}

if ($Tier -eq 'stages' -or $Tier -eq 'all') {
  foreach ($prop in $manifest.ingredients.PSObject.Properties) {
    foreach ($sProp in $manifest.ingredient_stages.PSObject.Properties) {
      $st = $sProp.Name
      if ($st -eq 'raw') { continue }  # raw == base file
      $subject = $prop.Value + ", " + $sProp.Value
      $out = Join-Path $root "public\cards\ingredients\$($prop.Name)-$st.png"
      $jobs += @{ subject = $subject; out = $out; type = 'ingredient-stage'; id = "$($prop.Name)-$st" }
    }
  }
}

if ($Tier -eq 'base') {
  $jobs = $jobs | Where-Object { $_.type -eq 'ingredient-base' -or $_.type -eq 'action' -or $_.type -eq 'recipe-base' }
}

# Filter existing if not forcing
if (-not $Force) {
  $jobs = $jobs | Where-Object { -not (Test-Path $_.out) }
}

if ($Sample -gt 0) { $jobs = $jobs | Select-Object -First $Sample }

Write-Host "Jobs queued: $($jobs.Count)" -ForegroundColor Cyan
if ($jobs.Count -eq 0) { Write-Host "Nothing to do." ; exit 0 }

# ─── Provider impls ─────────────────────────────────────

function Invoke-Replicate {
  param([string]$Prompt, [string]$OutPath)
  $headers = @{
    'Authorization' = "Bearer $env:REPLICATE_API_TOKEN"
    'Content-Type'  = 'application/json'
  }
  # Flux Schnell — fast, cheap (~$0.003/image), decent at pixel art
  $body = @{
    version = 'black-forest-labs/flux-schnell'
    input = @{
      prompt = $Prompt
      aspect_ratio = '1:1'
      num_outputs = 1
      output_format = 'png'
      output_quality = 90
    }
  } | ConvertTo-Json -Depth 5

  $resp = Invoke-RestMethod -Uri 'https://api.replicate.com/v1/models/black-forest-labs/flux-schnell/predictions' -Method Post -Headers $headers -Body $body
  $url = "https://api.replicate.com/v1/predictions/$($resp.id)"
  while ($resp.status -ne 'succeeded' -and $resp.status -ne 'failed') {
    Start-Sleep -Milliseconds 1500
    $resp = Invoke-RestMethod -Uri $url -Headers $headers
  }
  if ($resp.status -eq 'failed') {
    Write-Warning "Replicate failed: $($resp.error)"; return $false
  }
  $imgUrl = $resp.output[0]
  Invoke-WebRequest -Uri $imgUrl -OutFile $OutPath -UseBasicParsing
  return $true
}

function Invoke-OpenAI {
  param([string]$Prompt, [string]$OutPath)
  $headers = @{
    'Authorization' = "Bearer $env:OPENAI_API_KEY"
    'Content-Type'  = 'application/json'
  }
  $body = @{
    model = 'dall-e-3'
    prompt = $Prompt
    n = 1
    size = '1024x1024'
    response_format = 'b64_json'
    quality = 'standard'
    style = 'vivid'
  } | ConvertTo-Json -Depth 5
  $resp = Invoke-RestMethod -Uri 'https://api.openai.com/v1/images/generations' -Method Post -Headers $headers -Body $body
  $bytes = [Convert]::FromBase64String($resp.data[0].b64_json)
  [IO.File]::WriteAllBytes($OutPath, $bytes)
  return $true
}

function Invoke-LocalSD {
  param([string]$Prompt, [string]$OutPath)
  $body = @{
    prompt = $Prompt
    negative_prompt = $negative
    width = 512
    height = 512
    steps = 20
    sampler_name = 'Euler a'
    cfg_scale = 7
  } | ConvertTo-Json
  try {
    $resp = Invoke-RestMethod -Uri 'http://127.0.0.1:7860/sdapi/v1/txt2img' -Method Post -ContentType 'application/json' -Body $body -TimeoutSec 600
  } catch {
    Write-Warning "Local SD failed: $_"; return $false
  }
  $bytes = [Convert]::FromBase64String($resp.images[0])
  [IO.File]::WriteAllBytes($OutPath, $bytes)
  return $true
}

# ─── Run ────────────────────────────────────────────────

$ok = 0; $fail = 0
foreach ($job in $jobs) {
  $dir = Split-Path $job.out
  if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
  $fullPrompt = "$style $($job.subject)."
  Write-Host "[$($job.id)]" -ForegroundColor Cyan -NoNewline
  Write-Host " → $($job.out)"
  Write-Host "   $fullPrompt" -ForegroundColor DarkGray

  $success = switch ($provider) {
    'replicate' { Invoke-Replicate -Prompt $fullPrompt -OutPath $job.out }
    'openai'    { Invoke-OpenAI    -Prompt $fullPrompt -OutPath $job.out }
    default     { Invoke-LocalSD   -Prompt $fullPrompt -OutPath $job.out }
  }
  if ($success) { $ok++ } else { $fail++ }
}

Write-Host "`nDone. OK: $ok  Failed: $fail" -ForegroundColor Green
