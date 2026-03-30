import re

with open('/etc/nginx/nginx.conf', 'r') as f:
    config = f.read()

# Remove all gzip_min_length directives
config = re.sub(r'\s*gzip_min_length\s+1000;', '', config)
# Remove all gzip_types (we will add a single clean one)
config = re.sub(r'\s*gzip_types.*?;', '', config)

# Add the clean ones right after gzip on;
replacement = r"""
        gzip on;
        gzip_min_length 1000;
        gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
"""
config = config.replace('gzip on;', replacement, 1) # replace only the first occurrence

with open('/etc/nginx/nginx.conf', 'w') as f:
    f.write(config)

