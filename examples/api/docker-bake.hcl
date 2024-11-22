group "default" {
  targets = ["api"]
}

variable "IMAGE_URI" {
  default = "api"
}
variable "IMAGE_TAG" {
  default = "local"
}

target "api" {
  dockerfile = "Dockerfile"
  context = "."
  tags = ["${IMAGE_URI}:${IMAGE_TAG}"]
  platforms = ["linux/amd64"]
  args = {
    TARGETARCH = "amd64"
    TARGETOS = "linux"
  }
  attest = []
  provenance = false
}