terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "6.41.0"
    }
    google-beta = {
      source  = "hashicorp/google-beta"
      version = "6.41.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = local.region
  user_project_override = true
}

provider "google-beta" {
  project = var.project_id
  region  = local.region
  user_project_override = true
}
