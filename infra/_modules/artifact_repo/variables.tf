# variables.tf
# Input variables for artifact repositories
variable "artifact_repos" {
  description = "List of Artifact Repositories"
  type = list(object({
    name              = string
    location          = string # GCP region for the repository
    repository_format = string # Format of the repository (e.g., DOCKER, MAVEN, etc.)
    description       = string # Description of the repository
  }))
}

# Input variable for project ID
variable "project_id" {
  description = "GCP Project ID"
  type        = string
}

# Input variable for service account email
variable "service_account_email" {
  description = "Service account email to bind roles"
  type        = string
}

# IAM bindings for Artifact Registry repositories
variable "bindings" {
  description = "IAM bindings for the Artifact Registry repositories"
  type        = map(list(string)) # Map of roles to a list of members
  default     = {}
  # Example:
  # {
  #   "roles/artifactregistry.reader" = ["user:reader@example.com"]
  #   "roles/artifactregistry.writer" = ["user:writer@example.com"]
  #   "roles/artifactregistry.admin"  = ["user:admin@example.com"]
  # }
}

variable "artifact_readers" {
  description = "Map of artifact readers"
  type        = map(string)
  default     = {}
  # Example:
  # {
  #   "dev_agencyswarm" = "serviceAccount:service-account-email"
  # }
}
