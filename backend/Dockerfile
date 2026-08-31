FROM eclipse-temurin:21-jdk AS build
WORKDIR /app

COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
COPY src/ src/

RUN chmod +x mvnw && ./mvnw package -DskipTests

FROM eclipse-temurin:21-jre
WORKDIR /app

COPY --from=build --chown=10001:10001 /app/target/*.jar app.jar

EXPOSE 8080

USER 10001:10001

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
