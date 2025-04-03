# ---------------------------------------------------------------------------------------------------------------------
# COMMON TERRAGRUNT CONFIGURATION
# This is the common component configuration for mysql. The common variables for each environment to
# deploy mysql are defined here. This configuration will be merged into the environment configuration
# via an include block.
# ---------------------------------------------------------------------------------------------------------------------

locals {
  # Automatically load environment-level variables
  environment_vars = read_terragrunt_config(find_in_parent_folders("env.hcl"))
  region_vars = read_terragrunt_config(find_in_parent_folders("region.hcl"))
  account_vars = read_terragrunt_config(find_in_parent_folders("project.hcl"))
  global_vars = read_terragrunt_config(find_in_parent_folders("global.hcl"))

  # Extract out common variables for reuse
  env = local.environment_vars.locals.environment
  gcp_region = local.region_vars.locals.gcp_region
  gcp_project_id = local.account_vars.locals.gcp_project_id
  gcp_project_name = local.account_vars.locals.gcp_project_name
  gcp_billing_account_id = local.global_vars.locals.gcp_billing_account_id

  # Get the root of the repository programmatically
  repo_root = get_repo_root()

  # Construct the base source URL using the repo root and module path


  # example if infra/_modules/api is in a different repo
  base_source_url = "github.com/kents-gcp-api-module"
}

# ---------------------------------------------------------------------------------------------------------------------
# MODULE PARAMETERS
# These are the variables we have to pass in to use the module. This defines the parameters that are common across all
# environments.
# ---------------------------------------------------------------------------------------------------------------------
inputs = {
  project_id = local.gcp_project_id
}
