Add-Type -AssemblyName System.Drawing

function New-UltradianPng {
  param(
    [int]$Size,
    [string]$OutFile,
    [string]$Background,
    [string]$Foreground
  )

  $bmp = New-Object System.Drawing.Bitmap $Size, $Size
  $gfx = [System.Drawing.Graphics]::FromImage($bmp)
  $gfx.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $gfx.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $gfx.Clear([System.Drawing.ColorTranslator]::FromHtml($Background))

  $scale = $Size / 512.0
  $ringWidth = [Math]::Max(2.0, 28 * $scale)
  $waveWidth = [Math]::Max(1.5, 10 * $scale)

  $ink = [System.Drawing.ColorTranslator]::FromHtml($Foreground)
  $ringPen = New-Object System.Drawing.Pen $ink, $ringWidth
  $wavePen = New-Object System.Drawing.Pen $ink, $waveWidth
  $wavePen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $wavePen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
  $wavePen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round

  $cx = 256 * $scale
  $radius = 148 * $scale
  $gfx.DrawEllipse($ringPen, $cx - $radius, $cx - $radius, $radius * 2, $radius * 2)

  $points = New-Object 'System.Drawing.PointF[]' 64
  for ($i = 0; $i -lt 64; $i++) {
    $t = $i / 63.0
    $x = (118 + (394 - 118) * $t) * $scale
    # Match the SVG cubic: shallow, crest, trough, settle
    $wave = [Math]::Sin(($t - 0.18) * [Math]::PI * 2.15) * [Math]::Exp(-[Math]::Pow(($t - 0.48) * 2.1, 2))
    $y = (256 - ($wave * 34)) * $scale
    $points[$i] = New-Object System.Drawing.PointF ([float]$x), ([float]$y)
  }
  $gfx.DrawCurve($wavePen, $points, 0.45)

  $outDir = Split-Path -Parent $OutFile
  if ($outDir -and -not (Test-Path -LiteralPath $outDir)) {
    New-Item -ItemType Directory -Path $outDir | Out-Null
  }
  $bmp.Save($OutFile, [System.Drawing.Imaging.ImageFormat]::Png)

  $gfx.Dispose()
  $bmp.Dispose()
  $ringPen.Dispose()
  $wavePen.Dispose()
}

$publicDir = Join-Path $PSScriptRoot "..\public"
$paper = "#f4efe6"
$inkHex = "#1c1917"

New-UltradianPng -Size 512 -OutFile (Join-Path $publicDir "pwa-512x512.png") -Background $paper -Foreground $inkHex
New-UltradianPng -Size 192 -OutFile (Join-Path $publicDir "pwa-192x192.png") -Background $paper -Foreground $inkHex
New-UltradianPng -Size 180 -OutFile (Join-Path $publicDir "apple-touch-icon.png") -Background $paper -Foreground $inkHex
New-UltradianPng -Size 32 -OutFile (Join-Path $publicDir "favicon-32.png") -Background $paper -Foreground $inkHex
New-UltradianPng -Size 16 -OutFile (Join-Path $publicDir "favicon-16.png") -Background $paper -Foreground $inkHex

$pngBytes = [System.IO.File]::ReadAllBytes((Join-Path $publicDir "favicon-32.png"))
$stream = New-Object System.IO.MemoryStream
$writer = New-Object System.IO.BinaryWriter $stream
$writer.Write([uint16]0)
$writer.Write([uint16]1)
$writer.Write([uint16]1)
$writer.Write([byte]32)
$writer.Write([byte]32)
$writer.Write([byte]0)
$writer.Write([byte]0)
$writer.Write([uint16]1)
$writer.Write([uint16]32)
$writer.Write([uint32]$pngBytes.Length)
$writer.Write([uint32]22)
$writer.Write($pngBytes)
$writer.Flush()
[System.IO.File]::WriteAllBytes((Join-Path $publicDir "favicon.ico"), $stream.ToArray())
$writer.Dispose()
$stream.Dispose()

Get-ChildItem -LiteralPath $publicDir | Select-Object Name, Length | Format-Table -AutoSize
