$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$catalogPath = Join-Path $root "data/geospatial/catalog.json"
$originalsDir = Join-Path $root "data/geospatial/originals"
New-Item -ItemType Directory -Force -Path $originalsDir | Out-Null

$catalog = Get-Content -Raw -LiteralPath $catalogPath | ConvertFrom-Json

function Download-DriveFile {
  param(
    [Parameter(Mandatory = $true)][string]$Id,
    [Parameter(Mandatory = $true)][string]$OutputPath
  )

  if (Test-Path -LiteralPath $OutputPath) {
    return
  }

  $url = "https://drive.google.com/uc?export=download&id=$Id&confirm=t"
  Invoke-WebRequest -Uri $url -OutFile $OutputPath -UseBasicParsing
}

foreach ($layer in $catalog.layers) {
  $layerDir = Join-Path $originalsDir $layer.name
  New-Item -ItemType Directory -Force -Path $layerDir | Out-Null
  $files = $layer.files.PSObject.Properties
  foreach ($file in $files) {
    $extension = $file.Name
    $id = $file.Value
    $outputPath = Join-Path $layerDir "$($layer.name).$extension"
    Write-Host "Baixando $($layer.name).$extension"
    Download-DriveFile -Id $id -OutputPath $outputPath
  }
}

Write-Host "Originais preservados em $originalsDir"
