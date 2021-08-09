#!/bin/bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm

TARGET="/home/brawauser/brawa/repo"
BRANCH="release"

# Redirect stdout/stderr to a file
DS=`date +%Y-%m-%d`;
exec > /home/brawauser/brawa/webhook_output.log 2>&1

# only checking out the master (or whatever branch you would like to deploy)
#if [ "$ref" = "refs/heads/$BRANCH" ];
#then
    echo "Branch release received. Deploying ${BRANCH} branch ..."
    cd /home/brawauser/brawa/repo/ &&
    git pull

    echo "Stopping All services" &&
    /home/brawauser/.nvm/versions/node/v16.6.1/bin/pm2 stop all

    echo "Building Backend" &&
    cd /home/brawauser/brawa/repo/backend && npm run build

    echo "Start Backend Service again" &&
    /home/brawauser/.nvm/versions/node/v16.6.1/bin/pm2 start backend

    echo "Start Webserver again" &&
   # sudo caddy start --config /etc/caddy/Caddyfile
    caddy reload --config /etc/caddy/Caddyfile


#else
#    echo "Branch $ref received. Doing nothing: only the ${BRANCH} branch may be deployed on this #server."
#fi
