output "qr_ids" {
  value = random_id.qr_ids[*].hex
}