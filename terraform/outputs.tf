output "live_decoder_url" {
  description = "Public URL of the deployed JWT tool"
  value       = github_repository_pages.decoder_pages.html_url
}