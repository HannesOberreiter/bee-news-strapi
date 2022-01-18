#!/bin/sh
set -ea

if [ ! -d "node_modules" ] || [ ! "$(ls -qAL node_modules 2>/dev/null)" ]; then
  echo "Node modules not installed. Installing..."
  if [ -f "yarn.lock" ]; then
    yarn install
    yarn build
  else
    npm install
    yarn build
  fi
fi

echo "Starting your app..."

exec "$@"