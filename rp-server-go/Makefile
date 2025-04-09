## help: print this help message
.PHONY: help
help:
	@echo 'Usage:'
	@sed -n 's/^##//p' ${MAKEFILE_LIST} | column -t -s ':' |  sed -e 's/^/ /'

## run: starts demo http services
.PHONY: run-proxy-server
run-proxy-server:
	go run cmd/main.go

## run: starts demo http services
.PHONY: run-containers
run-containers:
	docker run --rm -d -p 8080:8080 --name server0 game-server-mock:latest 
	# docker run --rm -d -p 8081:8081 --name server1 kennethreitz/httpbin
	# docker run --rm -d -p 8082:8082 --name server2 kennethreitz/httpbin
	# docker run --rm -d -p 8083:8083 --name server3 kennethreitz/httpbin

## stop: stops all demo services
.PHONY: stop
stop:
	docker stop server1
	docker stop server2
	docker stop server3
