# Build all Docker images
build:
	docker-compose build

# Run all services
up:
	docker-compose up

# Stop all services
down:
	docker-compose down

# Rebuild and start all services
restart: down build up

# Check the logs of running services
logs:
	docker-compose logs -f
