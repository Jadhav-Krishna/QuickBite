FROM eclipse-temurin:21-jre-alpine AS builder
WORKDIR /builder
COPY target/*.jar application.jar
RUN java -Djarmode=layertools -jar application.jar extract

FROM eclipse-temurin:21-jre-alpine
RUN apk add --no-cache curl && rm -rf /var/cache/apk/*
WORKDIR /app
COPY --from=builder /builder/dependencies/ ./
COPY --from=builder /builder/spring-boot-loader/ ./
COPY --from=builder /builder/snapshot-dependencies/ ./
COPY --from=builder /builder/application/ ./
EXPOSE 8003
ENTRYPOINT ["java", "org.springframework.boot.loader.launch.JarLauncher"]
