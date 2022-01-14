# Bee-News Strapi Backend

Strapi powered CMS for the bee-news project.

## Dev

It will build based on the `Dockerfile` inside `docker-dev` folder.

```bash
docker-compose up
```

## Build

Build an image for production use, will be created as `.tar` archive in the `images` folder.

```bash
docker build -f Dockerfile.prod -t hannesoberreiter/beenews:1.0 .
docker save -o images/image.tar hannesoberreiter/beenews:1.0
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
