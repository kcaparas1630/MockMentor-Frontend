# Include the root `terragrunt.hcl` configuration. The root configuration contains settings that are common across all
# components and environments.
include "root" {
  path = find_in_parent_folders()
}

# Include the envcommon configuration for the component.
include "envcommon" {
  path = "${dirname(find_in_parent_folders())}/_envcommon/enabled-api.hcl"
  expose = true
}

# Configure the version of the module to use in this environment.
terraform {
  source = "${include.envcommon.locals.base_source_url}?"
}

inputs = {
  gcp_api_url = "cloudrun.googleapis.com"
}
