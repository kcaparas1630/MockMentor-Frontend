include "root" {
  path = find_in_parent_folders()
}

include "envcommon" {
  path   = "${dirname(find_in_parent_folders("cloud.hcl"))}/_envcommon/cloudrun.hcl"
  expose = true
}

dependency "platform_service_account" {
  config_path = "${dirname(find_in_parent_folders("services.hcl"))}/_default-service-account/"
}

dependency "artifact_registry_repository" {
  config_path = "${dirname(find_in_parent_folders("cloud.hcl"))}/dentaltemp-production/global/agnostic/artifact-registry"
}

locals {
  artifact_registry_gcp_project = "${include.envcommon.locals.artifact_registry_gcp_project}"
  artifact_registry_region      = "${include.envcommon.locals.artifact_registry_region}"
  artifact_registry_repo        = "${include.service_env.locals.artifact_registry_repo}"
  service_name                  = "portal"
}

# KENT: We reference the envcommon url for the module folder or repo and append the version as this file is per env
terraform {
  source = "${include.envcommon.locals.base_source_url}?ref=v2.0.0"
}

# KENT: we can actually read SOPS secrets here and inject them into terraform modules


# KENT: The inputs below will all fill in the variables in variables.tf of external terraform repos, or local terraform module directories
inputs = {
  service_name    = "${local.service_name}"
  service_account = "${dependency.platform_service_account.outputs.service_account_email}"
  container_port  = 8080

  containers = [
    {
      name  = "${local.service_name}-container"
      image = "${local.artifact_registry_region}-docker.pkg.dev/${local.artifact_registry_gcp_project}/${local.artifact_registry_repo}/${local.service_name}"
      tag = "v0.0.5" # would updated by a bot, then we would run a a build
      env_vars = [
        {
          name = "GOOGLE_CLOUD_PROJECT"
          value = "${include.envcommon.locals.gcp_project_id}"
        },
        {
          # TODO: Use a dependency to get the Firestore database name
          name = "FIRESTORE_DATABASE"
          value = "dev-platform"
        },
        {
          name = "SERVICE_NAME"
          value = "${local.service_name}"
        }
      ]
      resources = {
        limits = {
          memory = "512Mi"
          cpu    = "1"
        }
      }
      volume_mounts = []
    }
  ]

  # If you want secret-based volumes, define them here as before:
  volumes = []

  min_instance_count = 0
  max_instance_count = 3

  labels = {
    "layer" = "platform"
  }

  iam_bindings = [
    {
      role    = "roles/run.invoker"
      members = [
        "serviceAccount:${dependency.api_gateway_service_account.outputs.service_account_email}"
      ]
    }
  ]
}
