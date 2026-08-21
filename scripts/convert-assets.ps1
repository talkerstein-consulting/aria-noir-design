Add-Type -AssemblyName System.Drawing

$srcRoot = "F:\ARCHIVE WORK\04 SEAN\193 Aria Noir August\Final Assets"
$destRoot = "F:\ARCHIVE WORK\04 SEAN\193 Aria Noir August\public\images\arca-i"
$maxDim = 2400
$quality = 82L

# src (relative to Final Assets), dest filename
$map = @(
  @("Arca 1 - Aria Photoshoot Matrix Brutalist Portrait layered foreground 2.png", "hero-arca.jpg"),
  @("Duo, Macro, Envi\Arca 1 brutalist door bust shot bokeh desaturated.png", "structure-door.jpg"),
  @("Arca 1 - Aria Photoshoot Matrix Brutalist Potrait dark negative space medium shot.png", "structure-negative-space.jpg"),
  @("Arca 1 - Aria Photoshoot Matrix Brutalist Potrait black sleeveless.png", "aria.jpg"),
  @("Noir\Arca 1 brutalist Look Down - Portrait.png", "noir.jpg"),
  @("Arca 1 - Aria Photoshoot Matrix Brutalist Potrait face fisheye.png", "shoot-fisheye-face.jpg"),
  @("Arca 1 - Aria Photoshoot Matrix Brutalist Zoom In Fisheye.png", "shoot-zoom-fisheye.jpg"),
  @("Noir\Arca 1 brutalist door long coat bespoke shot.png", "meaning-longcoat.jpg"),
  @("Arca 1 - Aria Photoshoot Matrix Brutalist Potrait black ribbon dress.png", "detail-ribbon-dress.jpg"),
  @("Latest additions and macro\ARCAI-KBlack_macro_bridge.png", "spec-macro-bridge.jpg"),
  @("Latest additions and macro\ARCAI-KBlack_macro_ltemple.png", "spec-macro-ltemple.jpg"),
  @("Latest additions and macro\ARCAI-KBlack_macro_rtemple.png", "spec-macro-rtemple.jpg"),
  @("Latest additions and macro\ARCAI-KBlack_front.png", "offering-front.jpg"),
  @("Latest additions and macro\ARCAI-KBlack_side.png", "variation-kblack-side.jpg"),
  @("Latest additions and macro\ARCAI-KBlack_back.png", "variation-kblack-back.jpg"),
  @("Duo, Macro, Envi\Arca 1 brutalist environment with ARIA.png", "worn-01.jpg"),
  @("Noir\Arca 1 brutalist door standing up shot.png", "worn-02.jpg"),
  @("Duo, Macro, Envi\ARIA and NOIR wearing arca 1 portrait.png", "worn-03.jpg"),
  @("Noir\Arca 1 brutalist layered foreground - Portrait.png", "worn-04.jpg"),
  @("Duo, Macro, Envi\Arca 1 brutalist environment anoir looking down.png", "worn-05.jpg"),
  @("Duo, Macro, Envi\ARIA and NOIR wearing arca 1.png", "worn-06.jpg"),
  @("Noir\Arca 1 brutalist bust turtleneck closeup.png", "worn-07.jpg"),
  @("Duo, Macro, Envi\ARCA 1 GLASSES PORTAIT.png", "worn-08.jpg"),
  @("Arca 1 - Aria Photoshoot Matrix Brutalist Perspective Low Angle.png", "worn-09.jpg"),
  @("Noir\Arca 1 mirror shot.png", "worn-10.jpg"),
  @("Duo, Macro, Envi\Arca 1 brutalist portrait arca 1 subject photo stairway.png", "worn-11.jpg"),
  @("Arca 1 - Aria Photoshoot Matrix Brutalist Closeup Face bokeh shot.png", "worn-12.jpg"),
  @("Duo, Macro, Envi\Arca 1 brutalist environment anoir looking down variation 2.png", "worn-13.jpg"),
  @("Arca 1 - Aria Photoshoot Matrix Brutalist Potrait black sleeveless mirror portrait.png", "worn-14.jpg"),
  @("Duo, Macro, Envi\ARCA 1 CLOSEUP.png", "worn-15.jpg"),
  @("Arca 1 - Aria Photoshoot Matrix Brutalist Drop Frames Motion.png", "close-dropframes.jpg")
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
