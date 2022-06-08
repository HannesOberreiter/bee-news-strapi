# Bee-News Strapi Backend

Strapi powered CMS for the bee-news project.

## Dev

It will build based on the `Dockerfile` inside `docker-dev` folder.

```bash
docker-compose up
# If you changed the Dockerfile or entrypoint.sh you need to rebuild it before using up again:
docker-compose build
```

## Upgrade notes

- set `docker-compose.yml` the `STRAPI_VERSION` to latest
- update `package.json` inside the `app` folder to the Strapi version, same as above
- delete node_modules and build folders inside `app` folder
- run `docker-compose build`
- run `docker-compose up` the `docker-entrypoint-dev.sh` should see that `nodes_modules` is deleted and rebuild everything
- for production an image is created see section **Build** below

## Build

Build an image for production use, will be created as `.tar` archive in the `images` folder.

```bash
docker build -f Dockerfile.prod -t hannesoberreiter/beenews:1.7 .
docker save -o images/image.tar hannesoberreiter/beenews:1.7
```

The image can then be loaded with following command on the production side.

```bash
docker load --input image.tar
```

## Container Commands

Following commands are available. Careful don't build the `nodes_modules` from your machine in dev mode, as it will use your operation system and not the linux one from the container.

```bash
# Available commands in your project:

yarn develop
# Start Strapi in watch mode. (Changes in Strapi project files will trigger a server restart)
yarn start
# Start Strapi without watch mode.
yarn build
# Build Strapi admin panel.
yarn strapi
# Display all available commands.

# You can start by doing:
cd /srv/app
yarn develop
```

## Production Server Stuff

Following guide for Strapi inside container: <https://docs.strapi.io/developer-docs/latest/setup-deployment-guides/deployment/optional-software/nginx-proxy.html#nginx-virtual-host>

Proxy redirecting inside `upstream.conf`. Important the redirect IP address is not localhost it is the container IP address: `docker inspect <container-id>` (get the gateway IP address + Port).

```bash
# path: /etc/nginx/conf.d/upstream.conf
# https://docs.strapi.io/developer-docs/latest/setup-deployment-guides/deployment/optional-software/nginx-proxy.html#strapi-server

# Strapi server
upstream beekeeping_news_com_strapi {
    server 172.18.0.1:1337; # Gateway + Port
}
```

Settings up nginx:

```bash
# Create Config File inside /etc/nginx/sites-available
touch your_url.conf
# Create Symlink in /etc/nginx/sites-enabled
ln -s ../sites-available/your_url.conf .
```

```bash
# path: /etc/nginx/sites-available/strapi.conf
# https://docs.strapi.io/developer-docs/latest/setup-deployment-guides/deployment/optional-software/nginx-proxy.html#nginx-virtual-host
# Certificates see
# https://certbot.eff.org/instructions

server {
    # Listen HTTP
    listen 80;
    server_name api.beekeeping-news.com;

    # Redirect HTTP to HTTPS
    return 301 https://$host$request_uri;
}

server {
    # Listen HTTPS
    listen 443 ssl;
    server_name api.beekeeping-news.com;

    # SSL config
    ssl_certificate /etc/letsencrypt/live/api.beekeeping-news.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.beekeeping-news.com/privkey.pem;

    # Proxy Config
    location / {
        proxy_pass http://beekeeping_news_com_strapi;
        proxy_http_version 1.1;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Server $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Host $http_host;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_pass_request_headers on;
    }
}
```

## SSL Certificates

Using certbot: <https://certbot.eff.org/instructions?ws=nginx&os=ubuntufocal>
