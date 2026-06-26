# Stage 1: Build
FROM eclipse-temurin:21-jdk-alpine AS builder

WORKDIR /app
COPY gradlew .
COPY gradle gradle
COPY build.gradle.kts .
COPY settings.gradle.kts .

# Garantir que o gradlew tenha permissão de execução
RUN chmod +x gradlew

# Baixar dependências
RUN ./gradlew dependencies --no-daemon

COPY src src

# Build da aplicação sem rodar testes
RUN ./gradlew bootJar -x test --no-daemon

# Stage 2: Runner
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Copia o jar gerado do Stage 1
COPY --from=builder /app/build/libs/*.jar app.jar

EXPOSE 8080

# Comando para iniciar
ENTRYPOINT ["java", "-jar", "app.jar"]
