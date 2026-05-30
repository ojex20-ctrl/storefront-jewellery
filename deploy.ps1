Import-Module Posh-SSH
$pw = ConvertTo-SecureString "Adnan123" -AsPlainText -Force
$cred = New-Object System.Management.Automation.PSCredential("root", $pw)
$session = New-SSHSession -ComputerName "144.91.102.75" -Credential $cred -AcceptKey -Force
if (-not $session) { Write-Host "FAILED TO CONNECT"; exit 1 }

function Run($cmd) {
    $r = Invoke-SSHCommand -SessionId $session.SessionId -Command $cmd -TimeOut 120
    if ($r.Output) { $r.Output | ForEach-Object { Write-Host $_ } }
    if ($r.ExitStatus -ne 0) { Write-Host "ERR: $cmd" }
}

Write-Host "Stopping app..."
Run "pm2 delete syra-jewellery 2>/dev/null"
Run "rm -rf /var/www/syra && mkdir -p /var/www/syra"

Write-Host "Uploading (22MB)..."
Set-SCPItem -ComputerName "144.91.102.75" -Credential $cred -Path "deploy.tar.gz" -Destination "/var/www/syra/" -AcceptKey -Force

Write-Host "Extracting..."
Run "cd /var/www/syra && tar -xzf deploy.tar.gz && rm deploy.tar.gz"

Write-Host "Starting app..."
Run "cd /var/www/syra && PORT=3002 pm2 start server.js --name syra-jewellery"
Run "sleep 3 && pm2 status"
Run "curl -s -o /dev/null -w '%{http_code}' http://localhost:3002/"
Run "pm2 save"

Remove-SSHSession -SessionId $session.SessionId | Out-Null
Write-Host "`n=== DEPLOYED ==="
