Add-Type -AssemblyName System.Drawing

$srcRoot = "F:\ARCHIVE WORK\04 SEAN\193 Aria Noir August\Final Assets\Latest additions and macro"
$destRoot = "F:\ARCHIVE WORK\04 SEAN\193 Aria Noir August\public\images\arca-i"
$maxDim = 2400
$quality = 82L

$map = @(
  @("Arca 1 Macro Front Details artsy keyhole light.jpeg", "spec-macro-keyhole.jpg"),
  @("Arca 1 Macro Front Details artsy keyhole light wear and tear.jpeg", "spec-macro-keyhole-wear.jpg"),
  @("Arca 1 Macro Inner Details Left Side.jpeg", "spec-macro-inner-left.jpg"),
  @("Arca 1 Macro Inner Details Left Side 2.jpeg", "spec-macro-inner-left-2.jpg"),
  @("Arca 1 Macro Inner Details Right Side.jpeg", "spec-macro-inner-right.jpg"),
  @("Arca 1 Macro Inner Details Right Side 2.jpeg", "spec-macro-inner-right-2.jpg"),
  @("Arca 1 Macro Inner Details Right Side 3 - Full Details.jpeg", "spec-macro-inner-right-full.jpg"),
  @("Arca 1 macro nose level front.jpeg", "spec-macro-nose.jpg")
)

$encoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
$encParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
$encParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, $quality)

foreach ($pair in $map) {
  $src = Join-Path $srcRoot $pair[0]
  $dest = Join-Path $destRoot $pair[1]
  if (-not (Test-Path $src)) {
    Write-Host "MISSING: $src"
    continue
  }
  $img = [System.Drawing.Image]::FromFile($src)
  $ratio = [Math]::Min(1.0, $maxDim / [Math]::Max($img.Width, $img.Height))
  $w = [int]($img.Width * $ratio)
  $h = [int]($img.Height * $ratio)
  $bmp = New-Object System.Drawing.Bitmap($w, $h)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.DrawImage($img, 0, 0, $w, $h)
  $bmp.Save($dest, $encoder, $encParams)
  $g.Dispose()
  $bmp.Dispose()
  $img.Dispose()
  Write-Host "OK: $($pair[1]) ($w x $h)"
}
