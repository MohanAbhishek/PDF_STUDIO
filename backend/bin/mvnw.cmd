@echo off
setlocal
set MAVEN_HOME=%USERPROFILE%\.m2\wrapper\dists\apache-maven-3.9.6
if exist "%MAVEN_HOME%" goto run
echo Downloading Maven...
powershell -Command "Invoke-WebRequest -Uri 'https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/3.9.6/apache-maven-3.9.6-bin.zip' -OutFile 'maven.zip'; Expand-Archive -Path 'maven.zip' -DestinationPath '%USERPROFILE%\.m2\wrapper\dists'; Rename-Item '%USERPROFILE%\.m2\wrapper\dists\apache-maven-3.9.6' 'apache-maven-3.9.6' -ErrorAction SilentlyContinue; Remove-Item 'maven.zip'"
:run
"%USERPROFILE%\.m2\wrapper\dists\apache-maven-3.9.6\bin\mvn" %*
endlocal