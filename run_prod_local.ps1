$env:SPRING_PROFILES_ACTIVE = "prod"
$env:DATABASE_URL = "postgresql://postgres.hsxeulvcfrbyvxehhhaj:db_coolify_pecae@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true"
$env:DIRECT_URL = "postgresql://postgres.hsxeulvcfrbyvxehhhaj:db_coolify_pecae@aws-1-us-east-2.pooler.supabase.com:5432/postgres"
$env:JWT_SECRET = "jwt_secret_dummy"
$env:RESEND_API_KEY = "re_Z7xRpcCx_4Vd7McByXWAs3G5YfanNUnqW"
$env:EMAIL_FROM = "noreply@pecae.com.br"
$env:STORAGE_TYPE = "s3"
$env:SUPABASE_URL = "https://hsxeulvcfrbyvxehhhaj.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzeGV1bHZjZnJieXZ4ZWhoaGFqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDg5NTQ2NCwiZXhwIjoyMDk2NDcxNDY0fQ.JBsUv4-QhRiSWEcf0c7d5pzwzm-U27cJABBDrOrWS6A"
$env:EXPO_PUBLIC_SUPABASE_URL = "https://hsxeulvcfrbyvxehhhaj.supabase.co"
$env:EXPO_PUBLIC_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzeGV1bHZjZnJieXZ4ZWhoaGFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4OTU0NjQsImV4cCI6MjA5NjQ3MTQ2NH0.gl7nMqpNt-5-AQb39OogZUsTTzcoqtr0esoumTUu6c0"

cd backend
./gradlew bootRun --no-daemon
