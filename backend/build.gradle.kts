plugins {
	java
	id("org.springframework.boot") version "3.5.3"
	id("io.spring.dependency-management") version "1.1.7"
}

group = "com.pecae"
version = "0.0.1-SNAPSHOT"
description = "PECAÊ — Backend API (Java 25 + Spring Boot)"

java {
	toolchain {
		languageVersion = JavaLanguageVersion.of(21)
	}
}

configurations {
	compileOnly {
		extendsFrom(configurations.annotationProcessor.get())
	}
}

repositories {
	mavenCentral()
}

val mapstructVersion = "1.6.3"
val jjwtVersion = "0.12.6"
val springdocVersion = "2.8.4"

dependencies {
	// ── Spring Boot Starters ──
	implementation("org.springframework.boot:spring-boot-starter-web")
	implementation("org.springframework.boot:spring-boot-starter-data-jpa")
	implementation("org.springframework.boot:spring-boot-starter-security")
	implementation("org.springframework.boot:spring-boot-starter-validation")
	implementation("org.springframework.boot:spring-boot-starter-websocket")
	implementation("org.springframework.boot:spring-boot-starter-cache")
	implementation("org.springframework.boot:spring-boot-starter-mail")
	implementation("org.springframework.boot:spring-boot-starter-actuator")
	implementation("org.springframework.boot:spring-boot-starter-thymeleaf")

	// ── Database ──
	runtimeOnly("org.postgresql:postgresql")
	implementation("org.flywaydb:flyway-core")
	implementation("org.flywaydb:flyway-database-postgresql")

	// ── Redis (Cache) ──
	implementation("org.springframework.boot:spring-boot-starter-data-redis")

	// ── JWT ──
	implementation("io.jsonwebtoken:jjwt-api:$jjwtVersion")
	runtimeOnly("io.jsonwebtoken:jjwt-impl:$jjwtVersion")
	runtimeOnly("io.jsonwebtoken:jjwt-jackson:$jjwtVersion")

	// ── Google OAuth2 ──
	implementation("com.google.api-client:google-api-client:2.7.2")

	// ── MapStruct ──
	implementation("org.mapstruct:mapstruct:$mapstructVersion")
	annotationProcessor("org.mapstruct:mapstruct-processor:$mapstructVersion")

	// ── Lombok ──
	compileOnly("org.projectlombok:lombok")
	annotationProcessor("org.projectlombok:lombok")
	annotationProcessor("org.projectlombok:lombok-mapstruct-binding:0.2.0")

	// ── OpenAPI / Swagger ──
	implementation("org.springdoc:springdoc-openapi-starter-webmvc-ui:$springdocVersion")

	// ── Hibernate Types (JSON column support) ──
	implementation("io.hypersistence:hypersistence-utils-hibernate-63:3.9.2")

	// ── Jackson extras ──
	implementation("com.fasterxml.jackson.datatype:jackson-datatype-jsr310")

	// ── DevTools ──
	developmentOnly("org.springframework.boot:spring-boot-devtools")
	annotationProcessor("org.springframework.boot:spring-boot-configuration-processor")

	// ── Test ──
	testImplementation("org.springframework.boot:spring-boot-starter-test")
	testImplementation("org.springframework.security:spring-security-test")
	testImplementation("org.testcontainers:junit-jupiter")
	testImplementation("org.testcontainers:postgresql")
	testCompileOnly("org.projectlombok:lombok")
	testAnnotationProcessor("org.projectlombok:lombok")
	testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}

tasks.withType<Test> {
	useJUnitPlatform()
}

// Garante que MapStruct use o Lombok-gerado getters/setters
tasks.withType<JavaCompile> {
	options.compilerArgs.addAll(listOf(
		"-Amapstruct.defaultComponentModel=spring",
		"-Amapstruct.unmappedTargetPolicy=IGNORE"
	))
}
