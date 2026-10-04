$ErrorActionPreference = 'Stop'
$presentationRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$exportJobs = Get-Content -LiteralPath (Join-Path $PSScriptRoot 'export-jobs.json') -Raw -Encoding UTF8 | ConvertFrom-Json
$existingPowerPoint = @(Get-Process POWERPNT -ErrorAction SilentlyContinue).Count -gt 0
$powerPointApp = New-Object -ComObject PowerPoint.Application
$exportReport = @()
try {
    foreach ($job in $exportJobs) {
        $presentationDocument = $null
        try {
            # Open only the generated file without a document window.
            $presentationDocument = $powerPointApp.Presentations.Open($job.source, -1, 0, 0)
            # Native PDF SaveAs avoids the optional PrintRange COM marshaling issue.
            $presentationDocument.SaveAs($job.pdf, 32)
            $textOverflow = @()
            foreach ($slide in $presentationDocument.Slides) {
                foreach ($shape in $slide.Shapes) {
                    if ($shape.HasTextFrame -eq -1 -and $shape.TextFrame.HasText -eq -1) {
                        $availableHeight = $shape.Height - $shape.TextFrame.MarginTop - $shape.TextFrame.MarginBottom
                        $boundHeight = $shape.TextFrame2.TextRange.BoundHeight
                        if ($boundHeight -gt ($availableHeight + 3)) {
                            $textOverflow += [PSCustomObject]@{ slide = $slide.SlideIndex; text = $shape.TextFrame.TextRange.Text; height = $availableHeight; bound = $boundHeight }
                        }
                    }
                }
            }
            if ($job.images) {
                [IO.Directory]::CreateDirectory($job.images) | Out-Null
                $presentationDocument.Export($job.images, 'PNG', 1920, 1080)
            }
            $exportReport += [PSCustomObject]@{ source = $job.source; pdf = $job.pdf; slides = $presentationDocument.Slides.Count; overflow = $textOverflow }
            Write-Output "Exported $($presentationDocument.Slides.Count) slides: $($job.pdf)"
        }
        finally {
            if ($null -ne $presentationDocument) {
                $presentationDocument.Close()
                [Runtime.InteropServices.Marshal]::FinalReleaseComObject($presentationDocument) | Out-Null
            }
        }
    }
}
finally {
    if (-not $existingPowerPoint -and $powerPointApp.Presentations.Count -eq 0) { $powerPointApp.Quit() }
    [Runtime.InteropServices.Marshal]::FinalReleaseComObject($powerPointApp) | Out-Null
}
$exportReport | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath (Join-Path $PSScriptRoot 'export-report.json') -Encoding UTF8
