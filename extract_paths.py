#!/usr/bin/env python3
import re

# Read the map.html file
with open('src/map.html', 'r') as f:
    content = f.read()

# Extract all path elements
paths = re.findall(r'<path[^>]*id="([^"]+)"[^>]*d="([^"]+)"[^>]*/>', content, re.DOTALL)

print(f"Found {len(paths)} paths")

# Create the JSX output
jsx_paths = []
for path_id, path_d in paths:
    jsx_paths.append(f'        <path id="{path_id}" d="{path_d}" />')

# Write to a temporary file
with open('/tmp/map_paths.jsx', 'w') as f:
    f.write('\n'.join(jsx_paths))

print("Paths written to /tmp/map_paths.jsx")
