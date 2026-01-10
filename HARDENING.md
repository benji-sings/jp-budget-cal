# Docker Security Hardening Guide

This document describes the security hardening measures implemented for the Japan Travel Budget Calculator Docker deployment, following the CIS Docker Benchmark v1.7.0 Level 2 standards.

## Table of Contents

1. [Overview](#overview)
2. [CIS Docker Benchmark Level 2 Controls](#cis-docker-benchmark-level-2-controls)
   - [Container Images (Section 4)](#section-4-container-images)
   - [Container Runtime (Section 5)](#section-5-container-runtime)
   - [Daemon Configuration (Section 2)](#section-2-docker-daemon-configuration)
3. [Service-Specific Hardening](#service-specific-hardening)
4. [Network Isolation](#network-isolation)
5. [Resource Limits](#resource-limits)
6. [Read-Only Filesystem](#read-only-filesystem)
7. [Logging Configuration](#logging-configuration)
8. [Build Context Security](#build-context-security)
9. [Health Checks](#health-checks)
10. [Verification Commands](#verification-commands)
11. [Automated Compliance Checks](#automated-compliance-checks)
12. [Web Application Firewall (WAF)](#web-application-firewall-waf)
13. [Attack Simulation Test Results](#attack-simulation-test-results)
14. [References](#references)

---

## Overview

The Docker configuration implements defense-in-depth security controls across multiple layers:

- Container runtime restrictions
- Image security best practices
- Network isolation
- Resource limits
- Logging and monitoring

### Quick Start Scripts

| Script | Purpose |
|--------|---------|
| `start-all.sh` | Development: Runs Python + Node.js with cleanup handling |
| `docker-compose up` | Docker: Basic deployment with PostgreSQL |
| `docker-compose -f docker-compose.scaled.yml up` | Docker: Scaled deployment with nginx, Redis |

## CIS Docker Benchmark Level 2 Controls

### Section 4: Container Images

| Control ID | Description | Implementation |
|------------|-------------|----------------|
| 4.1 | Create a user for the container | `USER nodejs` in Node.js Dockerfile, `USER python` in Python Dockerfile |
| 4.1 | Use trusted base images | Official `node:20-alpine` and `python:3.11-slim` images |
| 4.3 | Do not install unnecessary packages | Multi-stage builds exclude dev dependencies |
| 4.3 | Exclude secrets from build context | Comprehensive `.dockerignore` excludes `.env`, `*.pem`, `*.key` files |
| 4.6 | Add HEALTHCHECK instruction | Both Dockerfiles include HEALTHCHECK commands |
| 4.7 | Do not use update instructions alone | Package installation combined with cleanup |
| 4.8 | Remove setuid and setgid permissions | Alpine/slim images have minimal setuid binaries |
| 4.9 | Use COPY instead of ADD | Only COPY instructions used |
| 4.10 | Do not store secrets in Dockerfiles | Secrets passed via environment variables at runtime |

### Section 5: Container Runtime

| Control ID | Description | Implementation |
|------------|-------------|----------------|
| 5.3 | Restrict Linux kernel capabilities | `cap_drop: ALL` with minimal `cap_add` per service |
| 5.4 | Do not use privileged containers | No `privileged: true` in any service |
| 5.7 | Do not map privileged ports | Internal ports > 1024 (5000, 5001); only nginx binds port 80 |
| 5.10 | Set memory limits | `mem_limit: 512m` for app services |
| 5.11 | Set CPU priority | `cpus: 1.0` limits CPU usage |
| 5.12 | Mount root filesystem as read only | `read_only: true` with tmpfs for writable paths |
| 5.14 | Restrict acquiring new privileges | `security_opt: no-new-privileges:true` |
| 5.25 | Restrict container from acquiring additional privileges | Minimal capability set enforced |
| 5.26 | Check container health at runtime | HEALTHCHECK in Dockerfiles and compose health checks |
| 5.28 | Use PIDs cgroup limit | `ulimits.nproc: 100` prevents fork bombs |
| 5.29 | Do not use Docker's default bridge | Custom bridge network with ICC disabled |
| 5.31 | Do not mount sensitive host directories | No host path mounts except nginx config (read-only) |

### Section 2: Docker Daemon Configuration

| Control ID | Description | Implementation |
|------------|-------------|----------------|
| 2.13 | Configure centralized and remote logging | JSON file driver with size rotation |
| 2.14 | Containers are restricted from acquiring new privileges | `no-new-privileges` security option |

## Service-Specific Hardening

### Application Services (app, python-api)

```yaml
security_opt:
  - no-new-privileges:true
cap_drop:
  - ALL
read_only: true
tmpfs:
  - /app/tmp:mode=1777,size=100M
  - /tmp:mode=1777,size=50M
mem_limit: 512m
mem_reservation: 128m
cpus: 1.0
ulimits:
  nproc: 100
```

**Capabilities**: None required - services bind to ports > 1024

### Nginx Load Balancer

```yaml
security_opt:
  - no-new-privileges:true
cap_drop:
  - ALL
cap_add:
  - NET_BIND_SERVICE  # Required for port 80
  - CHOWN
  - SETGID
  - SETUID
read_only: true
tmpfs:
  - /var/cache/nginx:mode=1777,size=100M
  - /var/run:mode=1777,size=10M
mem_limit: 128m
cpus: 0.5
```

### PostgreSQL Database

```yaml
security_opt:
  - no-new-privileges:true
cap_drop:
  - ALL
cap_add:
  - CHOWN
  - SETGID
  - SETUID
  - DAC_OVERRIDE
  - FOWNER
mem_limit: 512m
cpus: 1.0
```

**Capabilities**: Required for PostgreSQL initialization and file ownership

### Redis Cache

```yaml
security_opt:
  - no-new-privileges:true
cap_drop:
  - ALL
cap_add:
  - SETGID
  - SETUID
mem_limit: 300m
cpus: 0.5
```

## Network Isolation

### User-Defined Bridge Network

```yaml
networks:
  japan-travel-network:
    driver: bridge
    driver_opts:
      com.docker.network.bridge.enable_icc: "false"
```

- **Inter-container communication disabled**: Containers cannot communicate directly; traffic must go through defined network links
- **No default bridge**: Custom network provides better isolation
- **Explicit service dependencies**: Services only connect to required dependencies

## Resource Limits

| Service | Memory Limit | Memory Reservation | CPU Limit | PID Limit |
|---------|--------------|-------------------|-----------|-----------|
| app | 512MB | 128MB | 1.0 | 100 |
| python-api | 512MB | 128MB | 1.0 | 100 |
| db | 512MB | 128MB | 1.0 | 100 |
| redis | 300MB | 64MB | 0.5 | 50 |
| nginx | 128MB | 32MB | 0.5 | 50 |

## Read-Only Filesystem

All application containers run with read-only root filesystems. Writable directories are mounted as tmpfs:

| Service | Writable Paths |
|---------|----------------|
| app | `/app/tmp` (100MB), `/tmp` (50MB) |
| python-api | `/app/tmp` (100MB), `/tmp` (50MB) |
| nginx | `/var/cache/nginx` (100MB), `/var/run` (10MB), `/tmp` (50MB) |

## Logging Configuration

```yaml
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "5"
    labels: "service"
```

- **Log rotation**: Maximum 10MB per file, 5 files retained
- **Structured logging**: JSON format for parsing
- **Service labels**: Easy identification in aggregated logs

## Build Context Security

The `.dockerignore` file excludes sensitive files from the build context:

```
# Secrets and credentials
.env
.env.*
*.pem
*.key
*.crt
secrets/

# Development files
node_modules/
__pycache__/
.git/
*.log

# Test files
tests/
*.test.*
```

## Dockerfile Security Labels

Both Dockerfiles include OCI-compliant security labels:

```dockerfile
LABEL org.opencontainers.image.title="Japan Travel Budget Calculator"
LABEL org.opencontainers.image.vendor="Japan Travel App"
LABEL org.opencontainers.image.licenses="MIT"
LABEL security.privileged="false"
LABEL security.capabilities.drop="all"
```

## Health Checks

### Dockerfile Health Checks

```dockerfile
# Node.js
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

# Python
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5001/api/health || exit 1
```

### Health Endpoints

| Endpoint | Purpose |
|----------|---------|
| `/api/health` | Full application health with dependencies |
| `/api/health/live` | Kubernetes liveness probe |
| `/api/health/ready` | Kubernetes readiness probe |

## Verification Commands

### Check Container Capabilities

```bash
docker inspect --format='{{.HostConfig.CapAdd}}' japan-travel-app
docker inspect --format='{{.HostConfig.CapDrop}}' japan-travel-app
```

### Check Resource Limits

```bash
docker stats --no-stream japan-travel-app
docker inspect --format='{{.HostConfig.Memory}}' japan-travel-app
```

### Check Security Options

```bash
docker inspect --format='{{.HostConfig.SecurityOpt}}' japan-travel-app
```

### Check Read-Only Filesystem

```bash
docker inspect --format='{{.HostConfig.ReadonlyRootfs}}' japan-travel-app
```

## Automated Compliance Checks

For continuous compliance verification, consider using:

- **Hadolint**: Dockerfile linting for security best practices
- **Dockle**: Container image security scanning
- **Trivy**: Vulnerability scanning for images
- **Docker Bench Security**: CIS benchmark automated checks

### Example Hadolint Check

```bash
hadolint Dockerfile Dockerfile.python
```

### Example Dockle Scan

```bash
dockle japan-travel-app:latest
```

## Web Application Firewall (WAF)

The nginx load balancer can be deployed with ModSecurity WAF and OWASP Core Rule Set (CRS) to protect against common web application attacks.

### WAF Components

| Component | Description |
|-----------|-------------|
| ModSecurity v3 | Open-source WAF engine |
| OWASP CRS v4 | Industry-standard rule set |
| Custom Rules | Application-specific protections |

### Attack Categories Blocked

The WAF protects against 100+ attack types including:

#### OWASP Top 10 Coverage

| Category | Protection |
|----------|------------|
| A01: Broken Access Control | Path traversal, privilege escalation detection |
| A02: Cryptographic Failures | Sensitive data leakage prevention |
| A03: Injection | SQL injection, command injection, LDAP injection |
| A04: Insecure Design | Protocol enforcement, request validation |
| A05: Security Misconfiguration | Error disclosure prevention |
| A06: Vulnerable Components | Scanner/bot detection |
| A07: Authentication Failures | Session fixation, brute force protection |
| A08: Data Integrity Failures | File upload restrictions, XXE prevention |
| A09: Logging Failures | Comprehensive audit logging |
| A10: SSRF | Internal IP/localhost blocking |

#### Additional Protections

| Attack Type | Rule ID Range |
|-------------|---------------|
| Cross-Site Scripting (XSS) | 941xxx |
| SQL Injection | 942xxx |
| Remote Code Execution (RCE) | 932xxx |
| Local File Inclusion (LFI) | 930xxx |
| Remote File Inclusion (RFI) | 931xxx |
| PHP Injection | 933xxx |
| Java Injection | 944xxx |
| Log4Shell (JNDI) | Custom 1000500 |
| HTTP Request Smuggling | Custom 1000700-1000701 |
| XML External Entity (XXE) | Custom 1000900-1000901 |
| Server-Side Request Forgery | Custom 1000600 |
| CSRF Token Enforcement | Custom 1001100 |
| Dangerous File Uploads | Custom 1000800 |
| Rate Limiting | Custom 1000100-1000102 |

### WAF Configuration

#### Rule Engine Mode

```
SecRuleEngine On  # Blocking mode enabled (not DetectionOnly)
```

The WAF operates in **blocking mode** by default, actively denying malicious requests rather than just logging them.

#### Paranoia Level

```
Paranoia Level 2: Balanced security with minimal false positives
Anomaly Score Threshold: 5 (inbound), 4 (outbound)
```

#### Resource Requirements

```yaml
nginx-waf:
  mem_limit: 256m
  mem_reservation: 64m
  cpus: 1.0
  tmpfs:
    - /var/log/modsecurity:size=100M
    - /var/cache/modsecurity:size=50M
```

### Deployment

#### Deploy with WAF (Default)

```bash
docker-compose -f docker-compose.scaled.yml up -d
```

#### Deploy without WAF (Basic nginx)

```bash
docker-compose -f docker-compose.scaled.yml --profile basic up -d nginx
```

### WAF Files

| File | Purpose |
|------|---------|
| `Dockerfile.nginx-waf` | Multi-stage build with ModSecurity |
| `nginx/nginx-waf.conf` | Nginx config with WAF enabled |
| `nginx/modsecurity/main.conf` | ModSecurity main configuration |
| `nginx/modsecurity/custom-rules.conf` | Application-specific rules |

### Allowlists

The following endpoints bypass WAF inspection for performance:

- `/health` - Nginx health endpoint
- `/api/health/*` - Application health probes
- Static assets (`.js`, `.css`, `.png`, `.jpg`, etc.)

### Monitoring WAF

#### View Blocked Requests

```bash
docker exec japan-travel-nginx-waf tail -f /var/log/modsecurity/audit.log
```

#### Check WAF Status

```bash
docker exec japan-travel-nginx-waf nginx -t
```

### Tuning False Positives

If legitimate requests are blocked, add exceptions to `custom-rules.conf`:

```apache
# Example: Allow specific parameter pattern
SecRule ARGS:my_param "@rx ^[a-zA-Z0-9]+$" \
    "id:1999001,\
    phase:2,\
    pass,\
    t:none,\
    nolog,\
    ctl:ruleRemoveById=942100"
```

## Attack Simulation Test Results

The following table shows the results of attack simulations run against the application. Tests were performed against both the Express application (without WAF) and document expected behavior with the nginx-waf in production.

### Test Summary (36 Total Scenarios)

| Attack Category | Tests | App-Level Blocked | WAF Would Block |
|-----------------|-------|-------------------|-----------------|
| SQL Injection | 6 | 6 (All) | 6 (All) |
| Cross-Site Scripting (XSS) | 5 | 5 (All) | 5 (All) |
| Path Traversal | 3 | 2 (encoded variants) | 3 (All) |
| Command Injection | 7 | 7 (All) | 7 (All) |
| Log4Shell / JNDI | 2 | 2 (All) | 2 (All) |
| SSRF | 3 | 3 (All) | 3 (All) |
| XXE | 2 | 2 (All) | 2 (All) |
| Request Smuggling | 1 | 1 | 1 |
| File Upload Patterns | 2 | 2 (All) | 2 (All) |
| Scanner Detection | 2 | 2 (All) | 2 (All) |
| Legitimate Requests | 3 | N/A (should pass) | N/A (should pass) |
| **Attack Tests** | **33** | **32** | **33** |
| **Legitimate Tests** | **3** | **3 Pass** | **3 Pass** |

### Defense-in-Depth Analysis

**App-Level Security (Always Active)**:
- Input validation catches malformed URLs and encoded path traversal
- Rate limiting blocks rapid successive requests (HTTP 429)
- SSRF protection validates coordinates against internal IP ranges
- XXE protection via JSON-only API (no XML parsing)

**WAF Protection (Production Deployment)**:
- CRS 941xxx: XSS patterns including script tags, event handlers, JS URIs
- CRS 942xxx: SQL injection including UNION, OR 1=1, comment sequences
- CRS 930xxx: Path traversal including all encoding variants
- CRS 932xxx: Command injection including semicolons, pipes, backticks
- Custom 1000500: Log4Shell/JNDI patterns
- CRS 913xxx: Scanner/bot user-agent detection (sqlmap, nikto, etc.)

### Running Attack Simulations

```bash
# Run Python-based attack simulation
python tests/waf_simulation.py http://localhost:5000

# Run against WAF-protected endpoint (Docker deployment)
python tests/waf_simulation.py http://localhost:80
```

The test script (`tests/waf_simulation.py`) tests 36 attack scenarios and reports which are blocked by app-level security vs. which require WAF protection.

## Performance Security

The application implements performance optimizations that maintain security:

### Compression
- **gzip compression**: Level 6 with 1KB threshold
- **x-no-compression header**: Bypass for clients that don't support compression
- Excludes already-compressed files (images, videos)

### Caching Headers
- **Static assets**: 1-year immutable cache for JS/CSS/fonts, 1-day for images
- **HTML**: no-cache to ensure fresh content
- **API responses**: ETag-based conditional caching for exchange rate and weather endpoints

### ETag Implementation
- Exchange rate endpoint: ETags derived from lastUpdated timestamp
- Weather endpoint: ETags include city and cache timestamp
- Returns 304 Not Modified when If-None-Match matches

## NPM Security Status

As of January 2026, the application has **0 npm vulnerabilities**:

```
npm audit
found 0 vulnerabilities
```

### Security Updates Applied

| Package | Version | Fix |
|---------|---------|-----|
| express | 4.22.1 | DoS via malformed qs |
| body-parser | 1.20.4 | qs vulnerability |
| qs | 6.14.1 | Memory exhaustion via arrayLimit bypass |

### Removed Packages

| Package | Reason |
|---------|--------|
| @vercel/node | Had 4 vulnerable dependencies (esbuild, path-to-regexp, undici); unused as Express handles all API routes |

## References

- [CIS Docker Benchmark v1.7.0](https://www.cisecurity.org/benchmark/docker)
- [Docker Security Best Practices](https://docs.docker.com/develop/security-best-practices/)
- [OWASP Docker Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Docker_Security_Cheat_Sheet.html)
- [ModSecurity Reference Manual](https://github.com/SpiderLabs/ModSecurity/wiki/Reference-Manual)
- [OWASP Core Rule Set](https://coreruleset.org/docs/)
