# Stage 1: Build
FROM gradle:jdk21-alpine AS builder
# (Usando jdk21 ou a base que suportar java 25, mas para compatibilidade Alpine vamos de eclipse-temurin ou similar)
# Para Java 25, vamos usar eclipse-temurin:21-jdk-alpine ou amazoncorretto:21 e rodar o wrapper
# Corrigindo para usar eclipse-temurin pois Java 25 EA pode não ter builder Alpine oficial ainda.
FROM eclipse-temurin:21-jdk-alpine AS builder

WORKDIR /app
COPY gradlew .
COPY gradle gradle
COPY build.gradle.kts .
COPY settings.gradle.kts .

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
