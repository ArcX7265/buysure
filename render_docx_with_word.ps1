$ErrorActionPreference = 'Stop'
$inputPath = 'C:\Users\ADARSH\Documents\ChatGPT\IQOO Hackathon\DealTwin_Super_Detailed_Project_Report.docx'
$outputDir = 'C:\Users\ADARSH\Documents\ChatGPT\IQOO Hackathon\_report_work\word_render'
$outputPath = Join-Path $outputDir 'DealTwin_Super_Detailed_Project_Report.pdf'

New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
$word = New-Object -ComObject Word.Application
$word.Visible = $false
$word.DisplayAlerts = 0
$word.Options.PrintBackground = $false
try {
    $document = $word.Documents.Open($inputPath, $false, $true)
    try {
        $document.SaveAs2($outputPath, 17)
    }
    finally {
        $document.Close($false)
    }
}
finally {
    $word.Quit()
    [System.Runtime.InteropServices.Marshal]::FinalReleaseComObject($word) | Out-Null
}
Write-Output $outputPath
