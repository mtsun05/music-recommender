#!/usr/bin/env bash
set -euo pipefail

awslocal sqs create-queue --queue-name recommendation-jobs >/dev/null
