# main.tf

resource "google_project_service" "service" {
  project = var.project_id
  service = var.gcp_api_url
}

# resource "google_project_service_identity" "hc_sa" {
#   provider = google-beta

#   count = var.enable_service_account ? 1 : 0

#   project = var.project_id
#   service = var.gcp_api_url
# }

# resource "google_project_iam_member" "service_identity_iam" {
#   for_each = var.enable_service_account ? toset(var.service_account_roles) : []
#   project = var.project_id
#   role    = each.value
#   member  = "serviceAccount:${google_project_service_identity.hc_sa[0].email}"
# }
