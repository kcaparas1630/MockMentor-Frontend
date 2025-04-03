# variables.tf

variable "project_id" {
  description = "The ID of the GCP project"
  type        = string
}

variable "gcp_api_url" {
  description = "The domain URL of the service to be enabled in the project"
  type        = string
}

variable "enable_service_account" {
  description = "Flag to determine if a service account should be created"
  type        = bool
  default     = false
}

variable "service_account_roles" {
  description = "List of IAM roles to assign to the service account"
  type        = list(string)
  default     = []
}
