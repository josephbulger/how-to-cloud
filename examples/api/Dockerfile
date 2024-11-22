# syntax=docker/dockerfile:1

FROM golang:1.23 AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY *.go ./

ARG TARGETARCH=amd64
ENV GOARCH=$TARGETARCH

ARG TARGETOS=linux
ENV GOOS=$TARGETOS

RUN CGO_ENABLED=0 go build -o /api

FROM scratch

COPY --from=builder /api /api

EXPOSE 8080

ENTRYPOINT ["/api"]