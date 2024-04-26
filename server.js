
const fs = require("fs");
const { exec } = require("child_process");
const http = require("http");
const https = require("https");
const { URL } = require("url");
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const port = 8090;

// Define repository URL and file path
const repoUrl =
  "https://gist.githubusercontent.com/hafiz-azhar/22e31800406a2a6ea787bbab6e856d1d/raw/1fbdb87c000bf9b05780a053a29061358a9807bb/docker-compose.yml";
const filePath = "docker-compose.yml";
const dockerRepoNameWithTag = "rahmanazhar/docker-sample:latest";
const dockerRepoName = "rahmanazhar/docker-sample";
const composeDirectory = "./";

// Function to fetch Docker Compose file from the repository
async function fetchDockerComposeFile(repoUrl, filePath) {
  return new Promise((resolve, reject) => {
    const url = new URL(repoUrl);
    const protocolHandler = url.protocol === "https:" ? https : http;

    protocolHandler
      .get(repoUrl, (response) => {
        let data = "";
        response.on("data", (chunk) => {
          data += chunk;
        });
        response.on("end", () => {
          fs.writeFile(filePath, data, (err) => {
            if (err) {
              reject(err);
            } else {
              console.log("Docker Compose file fetched successfully.");
              resolve();
            }
          });
        });
      })
      .on("error", (err) => {
        reject(err);
      });
  });
}

// Function to run Docker compose
function runDockerCompose() {
  console.log("Running Docker compose...");
  const command = `docker-compose -f ${composeDirectory}/docker-compose.yml up -d --build`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error("Error running Docker compose:", error.message);
      return;
    }
    if (stderr) {
      console.error("Docker compose stderr:", stderr);
      return;
    }
    console.log("Docker compose stdout:", stdout);
    console.log("Docker compose process completed successfully.");
  });

  // Remove unused dangling images after Docker Compose
  const pruneCommand = "docker image prune -f";
  exec(pruneCommand, (pruneError, pruneStdout, pruneStderr) => {
    if (pruneError) {
      console.error("Error pruning unused images:", pruneError.message);
      return;
    }
    if (pruneStderr) {
      console.error("Prune unused images stderr:", pruneStderr);
      return;
    }
    console.log("Unused images pruned successfully:", pruneStdout);
  });
}

app.use(bodyParser.json());

// Endpoint to receive Docker Hub push events
app.post("/dockerhub-webhook", async (req, res) => {
  try {
    const eventData = req.body;
    console.log("Docker image updated:", eventData.repository.repo_name);
    if (eventData.repository.repo_name === dockerRepoName) {
        // Fetch Docker Compose file
        await fetchDockerComposeFile(repoUrl, filePath);
        runDockerCompose();
    }
    res.sendStatus(200);
  } catch (error) {
    console.error("Error handling Docker Hub webhook:", error);
    res.sendStatus(500);
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Webhook server listening at http://localhost:${port}`);
});
