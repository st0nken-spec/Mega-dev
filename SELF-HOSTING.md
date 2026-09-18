# Deployment boundary

Mega's deployment is external to this repository. The owner's server builds and serves whatever lands on `main`.

Keep this repository focused on application code and quality checks. Do not add Dockerfiles, Compose files, reverse-proxy configuration, or other serving configuration here.

Before merging to `main`, run the repository's typecheck, lint, unit tests, production build, and browser tests. The external pipeline retains the previous live version when those checks fail.
