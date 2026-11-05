terraform {
  required_version = ">= 1.5.0"
  required_providers {
    github = {
      source  = "integrations/github"
      version = "~> 6.0"
    }
  }
}

provider "github" {
  token = var.github_token
  owner = var.github_owner
}

# Configures GitHub Pages to serve from the /site directory on main
resource "github_repository_pages" "decoder_pages" {
  repository = var.repository_name

  source {
    branch = "main"
    path   = "/site"
  }
}