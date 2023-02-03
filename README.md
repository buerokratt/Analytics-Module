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
 
 ### Database setup
 * For setting up the database initially, run 
 `docker run --platform linux/amd64 --network=bykstack riaee/byk-users-db:liquibase20220615 --url=jdbc:postgresql://users_db:5432/byk --username=byk --password=01234 --changelog-file=./master.yml update`
 * Run migrations added in this repository by running the helper script `./migrate.sh`
 * When creating new migrations, use the helper `./create-migration.sh name-of-migration` which will create a timestamped file in the correct directory and add the required headers

Database configuration seed for developers:
Run the following command in your terminal when the users_db container is running, to add a default user and bot configuration
```
docker exec users_db psql byk byk -c "INSERT INTO public."user" (login,password_hash,first_name,last_name,id_code,display_name,status,created) VALUES
         ('EE90009999999','t','t','t','EE90009999999','t',NULL,NULL);
INSERT INTO public."configuration" ("key",value) VALUES
         ('bot_institution_id','botname');"
```
