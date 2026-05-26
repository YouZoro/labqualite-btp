# LABQUALITÉ BTP - LIGHTWEIGHT NATIVE POWERSHELL TCP SOCKET SERVER (ALL INTERFACES)
$port = 8080
# Listen on all interfaces (0.0.0.0) to avoid any IPv4/IPv6 loopback mismatch
$server = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Any, $port)
$server.Start()

Write-Host "Raw TCP Web Server started on all interfaces on port $port"
Write-Host "En ecoute... Appuyez sur Ctrl+C pour arreter."

try {
    while ($true) {
        # High-performance native blocking call (0% idle CPU usage)
        $client = $server.AcceptTcpClient()
        $stream = $client.GetStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $writer = New-Object System.IO.StreamWriter($stream)
        
        # Read HTTP Request header line
        $reqLine = $reader.ReadLine()
        if ($null -eq $reqLine) {
            $client.Close()
            continue
        }
        
        Write-Host "Requete: $reqLine"
        
        # Extract relative Path
        $tokens = $reqLine -split ' '
        if ($tokens.Length -lt 2) {
            $client.Close()
            continue
        }
        
        $path = $tokens[1]
        
        # Discard query parameters
        if ($path.Contains("?")) {
            $path = $path.Split("?")[0]
        }
        
        if ($path -eq "/" -or $path -eq "") {
            $path = "/index.html"
        }
        
        # Decode path (handles spaces, accent symbols in URI)
        $path = [System.Uri]::UnescapeDataString($path)
        
        $filePath = Join-Path "c:\Users\Lenovo\Desktop\les norme" $path
        
        if (Test-Path $filePath -PathType Leaf) {
            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            
            # Content-Type Mapping
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $contentType = "text/plain"
            if ($ext -eq ".html") { $contentType = "text/html; charset=utf-8" }
            elseif ($ext -eq ".css") { $contentType = "text/css" }
            elseif ($ext -eq ".js") { $contentType = "application/javascript; charset=utf-8" }
            elseif ($ext -eq ".png") { $contentType = "image/png" }
            
            # Write HTTP 200 OK headers
            $writer.WriteLine("HTTP/1.1 200 OK")
            $writer.WriteLine("Content-Type: $contentType")
            $writer.WriteLine("Content-Length: $($bytes.Length)")
            $writer.WriteLine("Connection: close")
            $writer.WriteLine("")
            $writer.Flush()
            
            # Write content stream
            $stream.Write($bytes, 0, $bytes.Length)
        } else {
            # Send standard 404
            $errBytes = [System.Text.Encoding]::UTF8.GetBytes("404 - Fichier non trouve")
            $writer.WriteLine("HTTP/1.1 404 Not Found")
            $writer.WriteLine("Content-Type: text/plain; charset=utf-8")
            $writer.WriteLine("Content-Length: $($errBytes.Length)")
            $writer.WriteLine("Connection: close")
            $writer.WriteLine("")
            $writer.Flush()
            $stream.Write($errBytes, 0, $errBytes.Length)
        }
        
        # Safely shut down client socket
        $writer.Close()
        $reader.Close()
        $client.Close()
    }
} catch {
    Write-Error $_
} finally {
    $server.Stop()
}
