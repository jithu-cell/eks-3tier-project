output "vpc_id" { value = module.vpc.vpc_id }
output "public_subnet_ids" { value = module.vpc.public_subnet_ids }
output "private_subnet_ids" { value = module.vpc.private_subnet_ids }

output "cluster_name" {
  description = "Use in: aws eks update-kubeconfig --name <this>"
  value       = module.eks.cluster_name
}
output "cluster_endpoint" { value = module.eks.cluster_endpoint }

output "kubeconfig_command" {
  description = "Run this to configure kubectl after apply"
  value       = "aws eks update-kubeconfig --name ${module.eks.cluster_name} --region eu-north-1"
}

output "rds_endpoint" {
  description = "Use as DB_HOST in Kubernetes secrets (Phase 07)"
  value       = module.rds.db_endpoint
}
output "rds_port" { value = module.rds.db_port }
output "db_name" { value = module.rds.db_name }