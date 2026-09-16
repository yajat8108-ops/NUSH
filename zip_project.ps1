Add-Type -AssemblyName System.IO.Compression.FileSystem

$sourceDirectory = "d:\COODING\NUSH"
$zipFilePath = "d:\COODING\1 month aniversary.zip"

if (Test-Path $zipFilePath) { Remove-Item $zipFilePath }

$excludeFolders = @(".next", "node_modules", ".git")
$archive = [System.IO.Compression.ZipFile]::Open($zipFilePath, "Create")

Get-ChildItem -Path $sourceDirectory -Recurse | Where-Object {
    $item = $_
    $skip = $false
    foreach ($exclude in $excludeFolders) {
        if ($item.FullName -match "\\$exclude\\") {
            $skip = $true
            break
        }
        if ($item.FullName.EndsWith("\$exclude")) {
            $skip = $true
            break
        }
    }
    
    if (!$skip -and !$item.PSIsContainer) {
        $relativePath = $item.FullName.Substring($sourceDirectory.Length + 1)
        # Suppress output of CreateEntryFromFile to avoid console spam
        $null = [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, $item.FullName, $relativePath)
    }
}

$archive.Dispose()
Write-Host "Created NUSH_FINAL.zip successfully!"
