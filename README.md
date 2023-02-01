# Analytics-Module

### Dev setup

 * Clone [Ruuter](https://github.com/buerokratt/Ruuter)
 * For Apple Silicon, replace Ruuter's Dockerfile line and add platform specification `FROM --platform=linux/amd64 openjdk:17-jdk-alpine`
 * Navigate to Ruuter and build the image `docker build -t ruuter .`
 * Clone [Resql](https://github.com/buerokratt/Resql)
 * Navigate to Resql and build the image `docker build -t resql .`
 * Clone [Data Mapper](https://github.com/buerokratt/DataMapper)
 * Navigate to Data Mapper and build the image `docker build -t datamapper-node .`
  
 * Navigate to current repo and run `docker compose up -d`

 * Go to https://localhost:3001
 
 * For setting up the database initially, run 
 `docker run --platform linux/amd64 --network=bykstack riaee/byk-users-db:liquibase20220615 --url=jdbc:postgresql://users_db:5432/byk --username=byk --password=01234 --changelog-file=./master.yml update
`

### Data Mapper Changes

* In Server.js add `app.use(express.json());` to enable data mapper to receive json input
* In Server.js add `res.render(req.params[0], req.body);` in `app.get('/hbs/*', (req, res)` to enable handlebars templates to receive a body
* Need to add configurable response headers in case you want to return the body as `text/plain` or `application/json` instead of `text/html`
