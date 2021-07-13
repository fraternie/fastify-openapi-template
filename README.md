####Built with <3 in Ts

## To get rid of initial error, run
    0. yarn install
    1. yarn schema

## Running without docker
    yarn dev

## To use Docker for running it
#### to run -> 
    docker run {your-dockerhubId}/{app-name}
#### to run using custom cmd -> 
    docker run -it {your-dockerhubId}/{app-name} {cmd}

## Docker cmds

#### to build -> 
    docker build -t {your-dockerhubId}/{app-name} .
#### to run -> 
    docker run {your-dockerhubId}/{app-name}
#### to run using custom cmd -> 
    docker run -it {your-dockerhubId}/{app-name} {cmd} 
#### to sh inside a container -> 
    docker exec -it {containerId from docker ps} sh
#### to get logs of a container -> 
    docker logs {containerId from docker ps}
#### to stop or kill it -> 
    docker {stop/kill} {containerId from docker ps}
#### to remove image -> 
    docker rmi -f {your-dockerhubId}/{app-name}
#### to remove container -> 
    docker rm -f {containerId}
 
##### Note: Handler logic is meant to go in services folder
