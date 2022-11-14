const fs = require("fs");
const http = require("http");
const path = require("path");
const url = require("url");

const port = 5000;

const server = http.createServer((req, res) => {
  const queryData = url.parse(req.url, true).query;
  const reqURL = req.url.split("?")[0];
  let forlderPath = "";

  if (req.method !== "GET") {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        success: false,
        statusCode: 500,
        description: "Not Supported",
        errorMessage: "Only the GET request method is supported",
      })
    );
    return;
  }

  switch (reqURL) {
    case "/readFile":
      if ("filename" in queryData) {
        const rootDirectory =
          "foldername" in queryData
            ? `${__dirname}/data/${queryData.foldername}`
            : `${__dirname}/data`;
        forlderPath = path.join(rootDirectory, queryData.filename);
        fs.promises
          .readFile(forlderPath, "utf-8")
          .then((result) => {
            console.log(result);
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(
              JSON.stringify({
                success: true,
                statusCode: 200,
                description: "Successfully read the file",
                messsage: "Please check the console to see the output as well.",
                data: result,
              })
            );
            return;
          })
          .catch(() => {
            res.writeHead(404, { "Content-Type": "application/json" });
            res.end(
              JSON.stringify({
                success: false,
                statusCode: 404,
                description: "Not Found",
                errorMessage:
                  "The file does not exist or it is due to a case-sensitivity issue",
              })
            );
            return;
          });
      } else {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            success: false,
            statusCode: 400,
            description: "Bad request",
            errorMessage: "filename parameter required",
          })
        );
        return;
      }
      break;
    case "/getFileName":
      if ("foldername" in queryData) {
        forlderPath = path.join(`${__dirname}/data`, queryData.foldername);
        fs.readdir(forlderPath, (err, files) => {
          if (err) {
            res.writeHead(404, { "Content-Type": "application/json" });
            res.end(
              JSON.stringify({
                success: false,
                statusCode: 404,
                description: "Not Found",
                errorMessage:
                  "The folder does not exist or it is due to a case-sensitivity issue",
              })
            );
            return;
          } else if (files) {
            console.log(files);
            if (files.length) {
              let listOfFiles = () => {
                return files
                  .map((file) => {
                    let url = `http://localhost:${port}/readFile?filename=${file}&foldername=${queryData.foldername}`;
                    return `<li key=${file}><a href=${url}>${file}</a></li>`;
                  })
                  .join("");
              };
              res.writeHead(200, { "Content-Type": "text/html" });
              res.write(
                "<div><h2>Following are the files:</h2><p>click on any one file to view the content</p><ul>" +
                  listOfFiles() +
                  "</ul></div>"
              );
              return;
            } else {
              res.writeHead(204, { "Content-Type": "application/json" });
              res.end(
                JSON.stringify({
                  success: false,
                  statusCode: 204,
                  description: "No content",
                  errorMessage: "The folder is empty",
                })
              );
              return;
            }
          }
        });
      } else {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            success: false,
            statusCode: 400,
            description: "Bad request",
            errorMessage: "foldername parameter required",
          })
        );
        return;
      }
      break;
    default:
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          success: false,
          statusCode: 500,
          description: "Unexpected error",
          errorMessage: "Looks like something went wrong, please try again.",
        })
      );
  }
});

server.listen(port, () =>
  console.log(`The server running at the port ${port}`)
);
