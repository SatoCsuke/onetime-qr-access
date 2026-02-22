resource "google_project_service" "default" {

  project = local.project_id

  for_each = toset([
    "firestore.googleapis.com",
    "cloudbilling.googleapis.com",
    "cloudresourcemanager.googleapis.com",
    "serviceusage.googleapis.com",
    "identitytoolkit.googleapis.com",
    "firebase.googleapis.com",
    "firebaserules.googleapis.com",
    "firebasestorage.googleapis.com",
    "storage.googleapis.com",
  ])

  service            = each.key
  disable_on_destroy = false
}

### firebase app ###

resource "google_firebase_web_app" "default" {
  provider     = google-beta
  project      = local.project_id
  display_name = "${local.name}-app"
}

### database ###

resource "google_firestore_database" "default" {
  project     = local.project_id
  name        = "id-database"
  location_id = local.region
  type        = "FIRESTORE_NATIVE"

  depends_on = [
    google_project_service.default
  ]
}

resource "random_id" "qr_ids" {
  count       = local.id_num
  byte_length = 16
}

resource "google_firestore_document" "qr_id" {
  count       = local.id_num
  project     = local.project_id
  database    = google_firestore_database.default.name
  collection  = "qrid"
  document_id = random_id.qr_ids[count.index].hex
  fields      = "{\"isUsed\":{\"booleanValue\":false}, \"num\":{\"integerValue\": ${count.index}}}"
}

### firebase authentication

resource "google_identity_platform_config" "default" {
  project = local.project_id

  autodelete_anonymous_users = false
  sign_in {
    allow_duplicate_emails = true

    anonymous {
      enabled = false
    }

    email {
      enabled           = true
      password_required = true
    }
  }
}