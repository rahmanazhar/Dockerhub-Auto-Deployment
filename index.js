const Docker = require("dockerode");
const fs = require("fs");
const { exec } = require("child_process");
const http = require("http");
const https = require("https");
const { URL } = require("url");
const docker = new Docker();

// Define repository URL and file path
const repoUrl =
  "https://gist.githubusercontent.com/hafiz-azhar/22e31800406a2a6ea787bbab6e856d1d/raw/b3242796c416711c638ddc5691fe361373b53118/docker-compose.yml";
const filePath = "docker-compose.yml";
const dockerRepoName = "rahmanazhar/docker-sample:latest";
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

// Function to monitor Docker Hub for image updates
function monitorDockerHub(repoName, callback) {
  console.log("Monitoring Docker Hub for image updates...");
  docker.getEvents(
    { filters: { type: ["image"], event: ["push"] } },
    (err, stream) => {
      if (err) {
        console.error("Error monitoring Docker Hub:", err);
        return;
      }
      stream.setEncoding("utf8");
      stream.on("data", (data) => {
        try {
          const eventData = JSON.parse(data);
          console.log("Docker image updated:", eventData.id);
          if (eventData.id === repoName) {
            callback();
          }
        } catch (error) {
          console.error("Error parsing Docker event data:", error);
        }
      });
    }
  );
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

// Fetch Docker Compose file
fetchDockerComposeFile(repoUrl, filePath);

// Monitor Docker Hub for image updates
monitorDockerHub(dockerRepoName, runDockerCompose);
