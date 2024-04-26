

# Dockerhub Auto Deployment
This script monitors updated image in Dockerhub and do docker build on the server via Docker webhook.

## Requirement
1. Node
2. NPM
3. Yarn
4. docker / docker-compose

## Server.js
1. Edit variables repoUrl, dockerRepoName

	`const repoUrl = 'your-docker-compose-yml-file-repo;`
	`const dockerRepoName = "vendor/docker-image-name";`

2. Change running port if intended to run multiple monitoring webhooks in the same server in line 10 `const port = 8090;`

3. Place this code in the server you want to do auto deployment.
4. Run the script using `node server.js`

### Running using Forever
1. Install Forever `npm install forever -g`
2. `cd /path/to/your/project`
3. `forever start server.js`
4. To see the list of running `server.js`, type `forever list`
5. To stop running the `server.js`, type `forever stop <pid>`

## Docker Hub Config
1. Login to `https://hub.docker.com/`
2. On your repository, add webhook URL, for example `http://ip:8090/dockerhub-webhook`

  

