$ErrorActionPreference = "Stop"

$backendDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$javaHome = $null

if ($env:JAVA_HOME -and (Test-Path (Join-Path $env:JAVA_HOME "bin\\java.exe"))) {
    $javaHome = $env:JAVA_HOME
} else {
    $javaCommand = Get-Command java.exe -ErrorAction SilentlyContinue
    if ($javaCommand -and $javaCommand.Source) {
        $javaHome = Split-Path -Parent (Split-Path -Parent $javaCommand.Source)
    } else {
        $javaHome = "C:\\Program Files\\Java\\jdk-23"
    }
}

if (-not (Test-Path (Join-Path $javaHome "bin\java.exe"))) {
    Write-Error "Java not found at $javaHome. Update start-backend.ps1 with your JDK path."
}

$env:JAVA_HOME = $javaHome
$env:Path = "$env:JAVA_HOME\bin;$env:Path"

Set-Location $backendDir
cmd /c mvnw.cmd spring-boot:run
