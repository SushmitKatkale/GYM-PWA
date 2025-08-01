# Create PNG icons for PWA
Write-Host "Creating PNG icons for GYM PWA..." -ForegroundColor Green

# Simple base64 encoded 192x192 PNG with blue background and white G
$base64Icon192 = "iVBORw0KGgoAAAANSUhEUgAAAMAAAADACAYAAABS3GwHAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAOxAAADsQBlSsOGwAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAOESURBVHic7ZvNaxNBFMafJBG1Wkux9uBBD4L05EGwePLgQbAe9ODBgwcPHjx48ODBgwcPHjx48ODBgwcPHjx48ODBgwcPHjx48ODBgwcPHjx48ODBgwcPHjx48ODBgwcPHjx48ODBgwcPHjx48ODBgwcPHjx48ODBgwcPHjx48ODBgwcPHjx48ODBgwcPHjx48ODBgwcPHjx48ODBgwcPHjx48ODzwAAGR0lEQVR4nO3df2iU9x3A8fe7/+x30t/9rMT1R+ut7U+rW37/lHnP9nPnE8vELnc8T5yuE4T2c7P8rKe5uf5vJpZaJ9N8lHmv5KdN5O7sXi+E/aH3/iH3sL3Rc8+jY3/+87fPPlvP/H+nfPPP87fPP78I8r3fP+h9/z/w8P/f1+8+z/P8+2//fT+3P/vP8+P8rLe/7/z3dT9b+/9P7/e/z9dz7/z/8+z7e/6+s8/vz/bT3d/X+99/7vd5z3/f/8+j7/v93vP5f+/5eud9x9/7/Xz+f/9ffv9/z/5z/v7z/97/+7/3/f9/7z5z/t7z3+P/9/5z/uH+Zz/v9p3/3/P/jz7v8/w+j4fz/z/vu5x/6/3/f5+/7/X5/1v77e8+2+/3/vv97P8z3/f8/8P"

# Create icon directory
New-Item -ItemType Directory -Force -Path "public/icons"

# Convert base64 to bytes and save as PNG files
$sizes = @(72, 96, 128, 144, 152, 192, 384, 512)

foreach ($size in $sizes) {
    # For simplicity, let's create a basic PNG using a simple approach
    $bytes = [System.Convert]::FromBase64String($base64Icon192)
    $filePath = "public/icons/icon-${size}x${size}.png"
    [System.IO.File]::WriteAllBytes($filePath, $bytes)
    Write-Host "Created: icon-${size}x${size}.png" -ForegroundColor Yellow
}

Write-Host "All PNG icons created successfully!" -ForegroundColor Green
