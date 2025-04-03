# ---------------------------------------------------------------------------------------------------------------------
# TERRAGRUNT CONFIGURATION FOR GCP
# Terragrunt is a thin wrapper for Terraform/OpenTofu that provides extra tools for working with multiple modules,
# remote state, and locking: https://github.com/gruntwork-io/terragrunt
# ---------------------------------------------------------------------------------------------------------------------

locals {
  # Automatically load global variables
  global_vars = read_terragrunt_config(find_in_parent_folders("global.hcl"))
  region_vars = read_terragrunt_config(find_in_parent_folders("region.hcl"))
  account_vars = read_terragrunt_config(find_in_parent_folders("project.hcl"))
  environment_vars = read_terragrunt_config(find_in_parent_folders("env.hcl"))

  // # Extract the variables we need for easy access
  gcp_global_region = local.global_vars.locals.gcp_global_region
  gcp_billing_project = local.global_vars.locals.gcp_billing_project
  customer_id      = local.global_vars.locals.customer_id
  gcp_infra_state_project_number = local.global_vars.locals.gcp_infra_state_project_number
}

# Configure Terragrunt to automatically store tfstate files in a Google Cloud Storage (GCS) bucket
remote_state {
  backend = "gcs"
  config = {
    bucket        = "terragrunt-state-${local.gcp_infra_state_project_number}-${local.gcp_global_region}"
    prefix        = "${path_relative_to_include()}"
    project       = "${local.gcp_billing_project}"
    location      = "${local.gcp_global_region}"
  }
  generate = {
    path      = "backend.tf"
    if_exists = "overwrite_terragrunt"
  }
}

# ---------------------------------------------------------------------------------------------------------------------
# GLOBAL PARAMETERS
# These variables apply to all configurations in this subfolder. These are automatically merged into the child
# `terragrunt.hcl` config via the include block.
# ---------------------------------------------------------------------------------------------------------------------

# Configure root level variables that all resources can inherit. This is especially helpful with multi-account configs
# where terraform_remote_state data sources are placed directly into the modules.
inputs = merge(
  local.account_vars.locals,
  local.region_vars.locals,
  local.environment_vars.locals,
  local.global_vars.locals
)
