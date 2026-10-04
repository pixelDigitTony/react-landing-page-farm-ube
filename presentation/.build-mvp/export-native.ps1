param(
    [string]$Source = 'presentation/mvp/roote-origin-client-presentation-new-designs.pptx',
    [string]$PreviewDirectory = 'presentation/mvp-new-designs-preview'
)
$ErrorActionPreference = 'Stop'
$sourcePath = [IO.Path]::GetFullPath($Source)
$previewPath = [IO.Path]::GetFullPath($PreviewDirectory)
$privatePdf = [IO.Path]::GetFullPath('presentation/.build-mvp/native-review.pdf')
[IO.Directory]::CreateDirectory($previewPath) | Out-Null
$hadPowerPoint = @(Get-Process POWERPNT -ErrorAction SilentlyContinue).Count -gt 0
$app = New-Object -ComObject PowerPoint.Application
$document = $null
$report = [ordered]@{ source = $sourcePath; slides = 0; overflow = @(); outsideCanvas = @(); nativeTables = @(); nativeMedia = @(); slideTexts = @() }
try {
    $document = $app.Presentations.Open($sourcePath, -1, 0, 0)
    $report.slides = $document.Slides.Count
    foreach ($slide in $document.Slides) {
        $slideText = @()
        foreach ($shape in $slide.Shapes) {
            if ($shape.Left -lt -2 -or $shape.Top -lt -2 -or ($shape.Left + $shape.Width) -gt ($document.PageSetup.SlideWidth + 2) -or ($shape.Top + $shape.Height) -gt ($document.PageSetup.SlideHeight + 2)) {
                $report.outsideCanvas += [PSCustomObject]@{ slide = $slide.SlideIndex; name = $shape.Name }
            }
            if ($shape.Type -eq 16) {
                $report.nativeMedia += [PSCustomObject]@{ slide = $slide.SlideIndex; name = $shape.Name }
            }
            if ($shape.HasTextFrame -eq -1 -and $shape.TextFrame.HasText -eq -1) {
                $text = $shape.TextFrame.TextRange.Text
                $slideText += $text
                $available = $shape.Height - $shape.TextFrame.MarginTop - $shape.TextFrame.MarginBottom
                $bound = $shape.TextFrame2.TextRange.BoundHeight
                if ($bound -gt ($available + 3)) {
                    $report.overflow += [PSCustomObject]@{ slide = $slide.SlideIndex; text = $text; available = $available; bound = $bound }
                }
            }
            if ($shape.HasTable -eq -1) {
                $report.nativeTables += [PSCustomObject]@{ slide = $slide.SlideIndex; rows = $shape.Table.Rows.Count; columns = $shape.Table.Columns.Count; top = $shape.Top; height = $shape.Height }
                for ($row = 1; $row -le $shape.Table.Rows.Count; $row++) {
                    for ($column = 1; $column -le $shape.Table.Columns.Count; $column++) {
                        $cellShape = $shape.Table.Cell($row, $column).Shape
                        $text = $cellShape.TextFrame.TextRange.Text
                        $slideText += $text
                        $available = $cellShape.Height - $cellShape.TextFrame.MarginTop - $cellShape.TextFrame.MarginBottom
                        $bound = $cellShape.TextFrame2.TextRange.BoundHeight
                        if ($bound -gt ($available + 3)) {
                            $report.overflow += [PSCustomObject]@{ slide = $slide.SlideIndex; cell = "$row,$column"; text = $text; available = $available; bound = $bound }
                        }
                    }
                }
            }
        }
        $report.slideTexts += [PSCustomObject]@{ slide = $slide.SlideIndex; text = ($slideText -join "`n") }
    }
    $document.Export($previewPath, 'PNG', 1920, 1080)
    $document.SaveAs($privatePdf, 32)
    $report | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath 'presentation/.build-mvp/native-review.json' -Encoding UTF8
    Write-Output "PowerPoint opened and rendered $($report.slides) slides. Overflow: $($report.overflow.Count). Native tables: $($report.nativeTables.Count). Embedded media: $($report.nativeMedia.Count)."
}
finally {
    if ($null -ne $document) {
        $document.Close()
        [Runtime.InteropServices.Marshal]::FinalReleaseComObject($document) | Out-Null
    }
    if (-not $hadPowerPoint -and $app.Presentations.Count -eq 0) { $app.Quit() }
    [Runtime.InteropServices.Marshal]::FinalReleaseComObject($app) | Out-Null
}
