# ── General ──────────────────────────────────────────────────
variable "project_name" {
  description = "Prefix for all resource names"
  type        = string
  default     = "cloudapp"
}

variable "environment" {
  type    = string
  default = "dev"
}

variable "aws_region" {
  type    = string
  default = "eu-north-1"
}

# ── VPC ──────────────────────────────────────────────────────
variable "vpc_cidr" {
  type    = string
  default = "10.0.0.0/16"
}

variable "availability_zones" {
  type    = list(string)
  default = ["eu-north-1a", "eu-north-1b", "eu-north-1c"]
}

variable "public_subnets" {
  type    = list(string)
  default = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
}

variable "private_subnets" {
  type    = list(string)
  default = ["10.0.11.0/24", "10.0.12.0/24", "10.0.13.0/24"]
}

# ── EKS ──────────────────────────────────────────────────────
variable "cluster_version" {
  type    = string
  default = "1.29"
}

variable "node_instance_type" {
  description = "t3.medium = 2 vCPU 4GB RAM — minimum for all pods"
  type        = string
  default     = "t3.medium"
}

variable "node_desired_size" {
  type    = number
  default = 2
}

variable "node_min_size" {
  type    = number
  default = 1
}

variable "node_max_size" {
  type    = number
  default = 4
}

# ── RDS ──────────────────────────────────────────────────────
variable "db_name" {
  type    = string
  default = "cloudapp_db"
}

variable "db_username" {
  type    = string
  default = "cloudapp_admin"
}

variable "db_password" {
  type      = string
  sensitive = true
}

variable "db_instance_class" {
  type    = string
  default = "db.t3.micro"
}
