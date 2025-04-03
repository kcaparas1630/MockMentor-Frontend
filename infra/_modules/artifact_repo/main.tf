# main.tf
# Define Artifact Registry Repositories
resource "google_artifact_registry_repository" "repos" {
  for_each = { for repo in var.artifact_repos : repo.name => repo }

  project       = var.project_id
  repository_id = each.value.name
  location      = each.value.location
  format        = each.value.repository_format
  description   = each.value.description
}

# Assign IAM roles to the repositories
resource "google_artifact_registry_repository_iam_member" "iam_bindings" {
  for_each = {
    for repo_name, repo_members in var.bindings : repo_name => repo_members
  }
  project    = var.project_id
  repository = google_artifact_registry_repository.repos[each.key].name
  role       = each.key
  member     = each.value[*]
}

# Grant roles to the CI service account
resource "google_project_iam_member" "ci_runner_artifact_registry_admin" {
  project = var.project_id
  role    = "roles/artifactregistry.admin"
  member  = "serviceAccount:${var.service_account_email}"
}

resource "google_project_iam_member" "ci_runner_token_creator" {
  project = var.project_id
  role    = "roles/iam.serviceAccountTokenCreator"
  member  = "serviceAccount:${var.service_account_email}"
}

resource "google_project_iam_member" "artifact_readers" {
  for_each = var.artifact_readers
  project  = var.project_id
  role     = "roles/artifactregistry.reader"
  member   = each.value
}
