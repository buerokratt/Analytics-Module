# Analytics-Module

### Dev setup

 * Clone [Ruuter](https://github.com/buerokratt/Ruuter)
 * For Apple Silicon, replace Ruuter's Dockerfile line and add platform specification `FROM --platform=linux/amd64 openjdk:17-jdk-alpine`
 * Ruuter has an unresolved issue with allowing cross-origin credentials to be sent, for now fix this by adding:
  `.allowCredentials(true);` to line 24 in CORSConfiguration.java
 * Navigate to Ruuter and build the image `docker build -t ruuter .`
 * Clone [Resql](https://github.com/buerokratt/Resql)
 * Navigate to Resql and build the image `docker build -t resql .`
  
 * Navigate to current repo and run `docker compose up -d`

 * Go to https://localhost:3000
 
 * For setting up the database initially, run 
 `docker run --platform linux/amd64 --network=bykstack riaee/byk-users-db:liquibase20220615 --url=jdbc:postgresql://users_db:5432/byk --username=byk --password=01234 --changelog-file=./master.yml update
`
