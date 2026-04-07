$ErrorActionPreference = "Stop"

$backendDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$javaHome = "C:\Program Files\Java\jdk-23"

if (-not (Test-Path (Join-Path $javaHome "bin\java.exe"))) {
    Write-Error "Java not found at $javaHome. Update start-backend.ps1 with your JDK path."
}

$env:JAVA_HOME = $javaHome
$env:Path = "$env:JAVA_HOME\bin;$env:Path"

Set-Location $backendDir
.\mvnw.cmd "-Dmaven.repo.local=.m2/repository" spring-boot:run
